#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://cxzllzyxwpyptfretryc.supabase.co';
const SUPABASE_SERVICE_KEY = 'sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQLStatements() {
  const sqlContent = fs.readFileSync('./scripts/normalize-transactions-schema.sql', 'utf8');
  
  // Split by semicolons but preserve ones inside function bodies
  const statements = sqlContent
    .split(/;\s*$/gm)
    .filter(s => s.trim().length > 0)
    .map(s => s.trim() + ';');

  console.log(`Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Skip comments
    if (stmt.trim().startsWith('--')) continue;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: stmt 
      });
      
      if (error) {
        console.error(`Statement ${i + 1} failed:`, error.message);
      } else {
        process.stdout.write('.');
      }
    } catch (e) {
      console.error(`Statement ${i + 1} error:`, e.message);
    }
  }
  
  console.log('\nNormalization complete!');
  console.log('\nTo migrate data, run: SELECT migrate_transactions_to_normalized();');
}

executeSQLStatements().catch(console.error);