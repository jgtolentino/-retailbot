#!/usr/bin/env node

// Using the Supabase MCP-aware approach to inspect database
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxzllzyxwpyptfretryc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class DatabaseInspector {
  async inspectLiveDatabase() {
    console.log('🔍 Live Database Inspection using MCP approach\n');
    
    try {
      // 1. Get all schemas
      const { data: schemas } = await supabase.rpc('get_database_schemas', {});
      
      // 2. Get detailed table information
      const { data: tableInfo } = await supabase.rpc('get_table_details', {});
      
      // 3. Check for any data in storage
      const { data: buckets } = await supabase.storage.listBuckets();
      
      console.log('📊 Database Analysis:');
      
      // Check each table for data
      const tables = [
        'transactions', 'stores', 'customers', 'products', 
        'transactions_normalized', 'users', 'profiles',
        '_seed_data', 'sample_data', 'test_data'
      ];
      
      for (const table of tables) {
        try {
          const { count, data, error } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(5);
            
          if (!error) {
            console.log(`\n📋 Table: ${table}`);
            console.log(`   Records: ${count || 0}`);
            if (data && data.length > 0) {
              console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
              console.log(`   Sample: ${JSON.stringify(data[0], null, 2).substring(0, 200)}...`);
            }
          }
        } catch (e) {
          // Table doesn't exist
        }
      }
      
      // Check storage buckets
      console.log('\n💾 Storage Buckets:');
      if (buckets && buckets.length > 0) {
        for (const bucket of buckets) {
          console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
          
          // List files in bucket
          const { data: files } = await supabase.storage
            .from(bucket.name)
            .list('', { limit: 10 });
            
          if (files && files.length > 0) {
            console.log(`     Files: ${files.map(f => f.name).join(', ')}`);
          }
        }
      }
      
      // Look for CSV or data files
      console.log('\n📁 Searching for data files in storage...');
      const dataExtensions = ['.csv', '.json', '.sql', '.xlsx'];
      
      if (buckets) {
        for (const bucket of buckets) {
          const { data: files } = await supabase.storage
            .from(bucket.name)
            .list('', { limit: 100 });
            
          if (files) {
            const dataFiles = files.filter(f => 
              dataExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
            );
            
            if (dataFiles.length > 0) {
              console.log(`\n   Found in ${bucket.name}:`);
              dataFiles.forEach(f => {
                console.log(`   - ${f.name} (${f.metadata?.size || 'unknown'} bytes)`);
              });
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error during inspection:', error.message);
      
      // Fallback: Try direct RPC calls if functions exist
      console.log('\n🔄 Attempting alternative inspection methods...');
      
      // Try to find seed data or migrations with data
      const seedTables = ['seed_transactions', 'import_data', 'staging_data'];
      for (const table of seedTables) {
        try {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          if (count > 0) {
            console.log(`✅ Found data in ${table}: ${count} records`);
          }
        } catch (e) {
          // Continue checking
        }
      }
    }
  }
}

// Run inspection
const inspector = new DatabaseInspector();
inspector.inspectLiveDatabase();