#!/usr/bin/env node

/**
 * Direct Supabase Schema Fix
 * Executes SQL directly using Supabase client
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Your actual credentials
const SUPABASE_URL = 'https://cxzllzyxwpyptfretryc.supabase.co';
const SUPABASE_SERVICE_KEY = 'sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64';

console.log('🚀 Executing Direct Supabase Fix...\n');

async function executeFix() {
  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'fix-supabase-realtime-mcp.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('📄 SQL file loaded');
    console.log('🔗 Target: ' + SUPABASE_URL);
    
    // Since we can't execute raw SQL directly via the JS client,
    // we'll provide instructions for manual execution
    console.log('\n⚠️  The Supabase JS client cannot execute raw DDL statements.');
    console.log('\n📋 Please follow these steps:\n');
    
    console.log('1. Open your Supabase Dashboard:');
    console.log('   ' + SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/').replace('.supabase.co', '') + '/sql');
    
    console.log('\n2. Copy the SQL from: scripts/fix-supabase-realtime-mcp.sql');
    
    console.log('\n3. Paste and click "Run"\n');
    
    console.log('✅ This will:');
    console.log('   - Create 7 required tables');
    console.log('   - Enable Realtime (fixes WebSocket 404)');
    console.log('   - Set up indexes and security');
    console.log('   - Add sample data\n');
    
    // Test current connection
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log('🔌 Testing current connection...');
    const { data, error } = await supabase
      .from('consumer_profiles')
      .select('count');
    
    if (error && error.code === '42P01') {
      console.log('❌ Table "consumer_profiles" does not exist - SQL fix needed!');
    } else if (!error) {
      console.log('✅ Tables already exist! You may still need to enable Realtime.');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Alternative: Open browser automatically
const open = require('child_process').exec;
const sqlEditorUrl = 'https://app.supabase.com/project/cxzllzyxwpyptfretryc/sql';

console.log('\n🌐 Opening Supabase SQL Editor in your browser...');
switch (process.platform) {
  case 'darwin':
    open(`open "${sqlEditorUrl}"`);
    break;
  case 'win32':
    open(`start "${sqlEditorUrl}"`);
    break;
  default:
    open(`xdg-open "${sqlEditorUrl}"`);
}

executeFix().catch(console.error);