#!/usr/bin/env node

// This script applies the normalization schema to your Supabase project
// Since direct SQL execution requires proper service role JWT, this script
// provides the exact steps needed

console.log('Scout Databank Normalization Guide');
console.log('==================================\n');

console.log('Your Supabase MCP is configured at: .mcp.json');
console.log('Project: cxzllzyxwpyptfretryc\n');

console.log('To apply the normalization:');
console.log('1. The schema is ready at: scripts/normalize-transactions-schema.sql');
console.log('2. It creates 9 normalized tables from your flat transactions table');
console.log('3. Includes migration function to move existing data\n');

console.log('With MCP active in Claude:');
console.log('- Ask: "Execute the normalize-transactions-schema.sql file"');
console.log('- Or: "Create the normalized schema for scout databank"');
console.log('\nThe MCP server will handle the execution automatically.');

// Test current state
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://cxzllzyxwpyptfretryc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('\nChecking current database state...');
  
  const tables = ['stores', 'customers', 'products', 'transactions_normalized'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' not found`);
      }
    } catch (e) {
      console.log(`❌ Table '${table}' not found`);
    }
  }
  
  console.log('\nNormalization will:');
  console.log('- Fix WebSocket 404 errors');
  console.log('- Enable real-time updates');
  console.log('- Improve query performance');
  console.log('- Maintain backward compatibility via views');
}

checkTables().catch(console.error);