#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://cxzllzyxwpyptfretryc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listAllTables() {
  console.log('🔍 Fetching all tables from Supabase...\n');

  try {
    // Query to get all tables from information_schema
    const { data: tables, error } = await supabase
      .rpc('get_all_tables', {});

    if (error && error.code === 'PGRST202') {
      // Function doesn't exist, let's create it and try again
      console.log('Creating helper function...');
      
      // For now, let's try to query known tables
      const knownTables = [
        'transactions',
        'stores', 
        'customers',
        'products',
        'transactions_normalized',
        'users',
        'profiles',
        'orders',
        'items',
        'categories',
        'inventory',
        'sales',
        'analytics'
      ];

      console.log('Checking known tables for data:\n');
      
      for (const table of knownTables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            console.log(`✅ ${table}: ${count || 0} records`);
          }
        } catch (e) {
          // Table doesn't exist, skip
        }
      }
    } else if (error) {
      console.error('Error fetching tables:', error);
    } else {
      console.log('Tables in database:', tables);
    }

    // Check transactions table specifically
    console.log('\n📊 Checking main transactions table:');
    const { count: transCount, error: transError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    
    if (!transError) {
      console.log(`Transactions table has ${transCount || 0} records`);
      
      if (transCount > 0) {
        // Get a sample record to see the structure
        const { data: sample } = await supabase
          .from('transactions')
          .select('*')
          .limit(1);
        
        if (sample && sample[0]) {
          console.log('\nSample record columns:', Object.keys(sample[0]).join(', '));
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
listAllTables();