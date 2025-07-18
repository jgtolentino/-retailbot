#!/usr/bin/env node

/**
 * Deploy Supabase Schema Fix
 * Executes the SQL fix to create tables and enable Realtime
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  console.error('\n⚠️  Service role key is required to create tables and enable Realtime');
  process.exit(1);
}

console.log('🚀 Deploying Supabase Schema Fix...\n');

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'fix-supabase-realtime.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    console.log('📄 Executing SQL schema...');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        // Skip if it's just a comment
        if (statement.trim().startsWith('--')) continue;
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          // Try direct execution as fallback
          const { data, error: directError } = await supabase
            .from('_supabase_migrations')
            .select('*')
            .limit(1);
          
          if (directError && directError.message.includes('exec_sql')) {
            console.log('⚠️  exec_sql function not available, please run SQL manually in Supabase Dashboard');
            console.log('\n📋 Instructions:');
            console.log('1. Go to: https://app.supabase.com/project/' + SUPABASE_URL.match(/https:\/\/([^.]+)/)[1]);
            console.log('2. Navigate to SQL Editor');
            console.log('3. Copy and paste the contents of: scripts/fix-supabase-realtime.sql');
            console.log('4. Click "Run"');
            return;
          }
          
          console.error('❌ Error executing statement:', error.message);
          errorCount++;
        } else {
          successCount++;
          process.stdout.write('.');
        }
      } catch (err) {
        console.error('❌ Error:', err.message);
        errorCount++;
      }
    }
    
    console.log('\n\n✅ Execution complete!');
    console.log(`   Success: ${successCount} statements`);
    console.log(`   Errors: ${errorCount} statements`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Schema deployed successfully!');
      console.log('\n📊 Next steps:');
      console.log('1. Restart your Next.js development server');
      console.log('2. Check the browser console - WebSocket errors should be gone');
      console.log('3. Your dashboard should now show live data updates');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.log('\n📋 Manual deployment required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the contents of scripts/fix-supabase-realtime.sql');
    console.log('4. Paste and run in the SQL Editor');
  }
}

// Test connection first
async function testConnection() {
  console.log('🔌 Testing connection...');
  
  try {
    // Try a simple query
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('version')
      .limit(1);
    
    if (!error || error.code === '42P01') { // Table doesn't exist is OK
      console.log('✅ Connection successful\n');
      return true;
    }
    
    console.error('❌ Connection failed:', error.message);
    return false;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

// Main execution
async function main() {
  const connected = await testConnection();
  
  if (!connected) {
    console.error('\n❌ Cannot connect to Supabase. Please check your credentials.');
    return;
  }
  
  await executeSQLFile();
}

main().catch(console.error);