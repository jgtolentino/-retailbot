#!/usr/bin/env node

/**
 * Supabase Realtime Verification Script
 * Checks and fixes Realtime configuration for Scout Databank
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verifying Supabase Configuration...\n');

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓' : '✗');
  process.exit(1);
}

console.log('📋 Configuration:');
console.log('   URL:', SUPABASE_URL);
console.log('   Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
console.log('   Service Key:', SUPABASE_SERVICE_KEY ? '✓ Present' : '✗ Missing');

// Extract project reference from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
console.log('   Project Ref:', projectRef || '❌ Could not extract');

// Test basic connection
async function testBasicConnection() {
  console.log('\n🔌 Testing Basic Connection...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    const { data, error } = await supabase
      .from('consumer_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Basic query failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

// Test WebSocket connection
async function testWebSocketConnection() {
  console.log('\n🌐 Testing WebSocket Connection...');
  
  const wsUrl = `wss://${projectRef}.supabase.co/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`;
  console.log('   WebSocket URL:', wsUrl.substring(0, 60) + '...');
  
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connection opened');
      ws.close();
      resolve(true);
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error.message || 'Connection failed');
      resolve(false);
    };
    
    ws.onclose = (event) => {
      if (event.code === 1000) {
        console.log('✅ WebSocket closed normally');
      } else {
        console.error('❌ WebSocket closed with code:', event.code);
      }
    };
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (ws.readyState !== WebSocket.CLOSED) {
        console.error('❌ WebSocket connection timeout');
        ws.close();
        resolve(false);
      }
    }, 5000);
  });
}

// Check if Realtime is enabled on tables
async function checkRealtimeEnabled() {
  console.log('\n📊 Checking Realtime Status on Tables...');
  
  const tables = [
    'consumer_profiles',
    'consumer_behavior',
    'consumer_preferences',
    'product_mix',
    'transactions'
  ];
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  for (const table of tables) {
    try {
      // Subscribe to the table
      const channel = supabase.channel(`test-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          console.log(`✅ ${table}: Realtime subscription successful`);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ ${table}: Successfully subscribed`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ ${table}: Subscription error`);
          }
        });
      
      // Give it a moment to connect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Unsubscribe
      await supabase.removeChannel(channel);
      
    } catch (error) {
      console.error(`❌ ${table}: Error testing realtime -`, error.message);
    }
  }
}

// Generate fix script
function generateFixScript() {
  console.log('\n📝 Generating Fix Instructions...\n');
  
  console.log('To enable Realtime on your tables, run these SQL commands in Supabase:');
  console.log('```sql');
  
  const tables = [
    'consumer_profiles',
    'consumer_behavior', 
    'consumer_preferences',
    'product_mix',
    'transactions'
  ];
  
  tables.forEach(table => {
    console.log(`-- Enable Realtime for ${table}`);
    console.log(`ALTER PUBLICATION supabase_realtime ADD TABLE ${table};`);
    console.log('');
  });
  
  console.log('```');
  
  console.log('\nOr use the Supabase Dashboard:');
  console.log('1. Go to https://app.supabase.com/project/' + projectRef);
  console.log('2. Navigate to Table Editor');
  console.log('3. For each table, click the table name');
  console.log('4. Click the "Realtime" toggle to enable it');
  
  console.log('\n🔧 Updated Supabase Client Configuration:');
  console.log('```typescript');
  console.log(`// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
`);
  console.log('```');
}

// Main execution
async function main() {
  const basicOk = await testBasicConnection();
  
  if (!basicOk) {
    console.error('\n❌ Basic connection failed. Please check your credentials.');
    return;
  }
  
  const wsOk = await testWebSocketConnection();
  
  if (!wsOk) {
    console.error('\n❌ WebSocket connection failed. This is causing the 404 errors.');
  }
  
  await checkRealtimeEnabled();
  
  generateFixScript();
}

// Run the verification
main().catch(console.error);