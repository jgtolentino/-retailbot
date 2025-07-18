#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://cxzllzyxwpyptfretryc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function importTransactions() {
  console.log('📊 Starting Supabase import...\n');
  
  try {
    // Read the JSON file
    const jsonFile = path.join(process.cwd(), 'synthetic_transactions_15k.json');
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    
    console.log(`📁 Loaded ${data.length} transactions from JSON file`);
    
    // Batch size for imports
    const BATCH_SIZE = 500;
    const batches = [];
    
    // Split into batches
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      batches.push(data.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`📦 Split into ${batches.length} batches of ${BATCH_SIZE} records each\n`);
    
    // Import each batch
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`⏳ Importing batch ${i + 1}/${batches.length}...`);
      
      const { data: result, error } = await supabase
        .from('transactions')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error in batch ${i + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`✅ Batch ${i + 1} imported successfully`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📈 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} records`);
    console.log(`❌ Failed: ${errorCount} records`);
    console.log(`📊 Total processed: ${data.length} records`);
    
    // Verify the import
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n🔍 Verification: ${count} total records in database`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Alternative: Import using SQL statements
async function generateSQLImport() {
  console.log('\n📝 Generating SQL import file...');
  
  const jsonFile = path.join(process.cwd(), 'synthetic_transactions_15k.json');
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  
  let sql = '-- Import 15,000 synthetic transactions\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';
  sql += 'INSERT INTO transactions (\n';
  sql += '  transaction_id, order_id, order_date, ship_date, ship_mode,\n';
  sql += '  customer_id, customer_name, customer_email, customer_phone,\n';
  sql += '  store_id, store_name, store_location, region, country,\n';
  sql += '  product_id, product_name, product_category, product_subcategory,\n';
  sql += '  brand, sku, unit_price, quantity, discount, sales, profit,\n';
  sql += '  created_at, updated_at\n';
  sql += ') VALUES\n';
  
  const values = data.map((t, i) => {
    const isLast = i === data.length - 1;
    return `(
  '${t.transaction_id}', '${t.order_id}', '${t.order_date}', '${t.ship_date}', '${t.ship_mode}',
  '${t.customer_id}', '${t.customer_name.replace(/'/g, "''")}', '${t.customer_email}', '${t.customer_phone}',
  '${t.store_id}', '${t.store_name.replace(/'/g, "''")}', '${t.store_location}', '${t.region}', '${t.country}',
  '${t.product_id}', '${t.product_name.replace(/'/g, "''")}', '${t.product_category}', '${t.product_subcategory}',
  '${t.brand}', '${t.sku}', ${t.unit_price}, ${t.quantity}, ${t.discount}, ${t.sales}, ${t.profit},
  '${t.created_at}', '${t.updated_at}'
)${isLast ? ';' : ','}`;
  }).join('\n');
  
  sql += values;
  
  // Write to file
  const sqlFile = 'import_15k_transactions.sql';
  fs.writeFileSync(sqlFile, sql);
  
  console.log(`✅ SQL file generated: ${sqlFile}`);
  console.log(`📏 File size: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);
  console.log('\n📋 To import, run this SQL in your Supabase SQL Editor');
}

// Run both methods
async function main() {
  console.log('🚀 Scout Databank - Import 15k Transactions\n');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--sql')) {
    await generateSQLImport();
  } else {
    await importTransactions();
    console.log('\n💡 Tip: Use --sql flag to generate SQL file instead');
  }
}

main();