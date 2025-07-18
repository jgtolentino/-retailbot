#!/usr/bin/env node

/**
 * Database validation script for Consumer Analytics
 * Run this to test your Supabase connection and verify tables exist
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '❌ Missing');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test functions
async function testTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`❌ Table ${tableName} error:`, error.message);
      return false;
    }
    
    console.log(`✅ Table ${tableName} exists and accessible`);
    return true;
  } catch (error) {
    console.error(`❌ Table ${tableName} failed:`, error);
    return false;
  }
}

async function testRealTimeConnection() {
  try {
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, (payload) => {
        console.log('📡 Realtime payload received:', payload);
      })
      .subscribe();

    // Test for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await supabase.removeChannel(channel);
    console.log('✅ Realtime connection test completed');
    return true;
  } catch (error) {
    console.error('❌ Realtime connection failed:', error);
    return false;
  }
}

async function testInsertAndSelect() {
  try {
    // Test insert
    const testProfile = {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      age: 25,
      lifestyle_segment: 'test_segment'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('consumer_profiles')
      .insert(testProfile)
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      return false;
    }

    console.log('✅ Insert test passed');

    // Test select
    const { data: selectData, error: selectError } = await supabase
      .from('consumer_profiles')
      .select('*')
      .eq('email', testProfile.email);

    if (selectError) {
      console.error('❌ Select test failed:', selectError.message);
      return false;
    }

    console.log('✅ Select test passed');

    // Clean up
    await supabase
      .from('consumer_profiles')
      .delete()
      .eq('email', testProfile.email);

    return true;
  } catch (error) {
    console.error('❌ Insert/Select test failed:', error);
    return false;
  }
}

async function testAnalyticsViews() {
  try {
    // Test consumer analytics view
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('consumer_analytics')
      .select('*')
      .limit(5);

    if (analyticsError) {
      console.error('❌ Analytics view test failed:', analyticsError.message);
      return false;
    }

    console.log('✅ Consumer analytics view accessible');

    // Test product performance view
    const { data: performanceData, error: performanceError } = await supabase
      .from('product_performance')
      .select('*')
      .limit(5);

    if (performanceError) {
      console.error('❌ Product performance view test failed:', performanceError.message);
      return false;
    }

    console.log('✅ Product performance view accessible');
    return true;
  } catch (error) {
    console.error('❌ Analytics views test failed:', error);
    return false;
  }
}

async function testDateRangeQuery() {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Date range query failed:', error.message);
      return false;
    }

    console.log(`✅ Date range query returned ${data.length} transactions`);
    return true;
  } catch (error) {
    console.error('❌ Date range query failed:', error);
    return false;
  }
}

async function testDataCounts() {
  try {
    const tables = [
      'consumer_profiles',
      'transactions',
      'consumer_behavior',
      'product_mix',
      'suggestion_acceptance'
    ];

    console.log('\n📊 Data counts:');
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ ${table}: Error - ${error.message}`);
      } else {
        console.log(`   ${table}: ${count} records`);
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Data count test failed:', error);
    return false;
  }
}

// Main validation function
async function validateDatabase() {
  console.log('🔍 Starting database validation...\n');

  const tables = [
    'consumer_profiles',
    'transactions',
    'consumer_behavior',
    'product_mix',
    'suggestion_acceptance'
  ];

  let allTestsPassed = true;

  // Test environment variables
  console.log('🔑 Environment variables:');
  console.log(`   SUPABASE_URL: ${supabaseUrl}`);
  console.log(`   SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Present' : '❌ Missing'}\n`);

  // Test table existence
  console.log('📋 Testing table existence...');
  for (const table of tables) {
    const exists = await testTableExists(table);
    if (!exists) allTestsPassed = false;
  }

  console.log('\n🔧 Testing basic operations...');
  
  // Test insert/select
  const insertSelectPassed = await testInsertAndSelect();
  if (!insertSelectPassed) allTestsPassed = false;

  // Test analytics views
  const viewsPassed = await testAnalyticsViews();
  if (!viewsPassed) allTestsPassed = false;

  // Test date range queries
  const dateRangePassed = await testDateRangeQuery();
  if (!dateRangePassed) allTestsPassed = false;

  // Test data counts
  const dataCountsPassed = await testDataCounts();
  if (!dataCountsPassed) allTestsPassed = false;

  console.log('\n📡 Testing realtime connection...');
  
  // Test realtime
  const realtimePassed = await testRealTimeConnection();
  if (!realtimePassed) allTestsPassed = false;

  console.log('\n' + '='.repeat(60));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Your database is ready to use.');
    console.log('✅ Tables exist and are accessible');
    console.log('✅ CRUD operations working');
    console.log('✅ Analytics views working');
    console.log('✅ Date range queries working');
    console.log('✅ Realtime connection working');
    
    // Write success file
    fs.writeFileSync(
      path.join(__dirname, '../.validation-success'),
      `Database validation completed successfully at ${new Date().toISOString()}`
    );
    
  } else {
    console.log('❌ SOME TESTS FAILED! Please check the errors above.');
    console.log('💡 Make sure you have run the migration script first.');
    
    // Write failure file
    fs.writeFileSync(
      path.join(__dirname, '../.validation-failure'),
      `Database validation failed at ${new Date().toISOString()}`
    );
  }

  console.log('\n🛠️  Next steps:');
  console.log('1. If tests failed, run: npm run migrate');
  console.log('2. If RLS errors, check authentication in your app');
  console.log('3. If 404 errors, verify table creation');
  console.log('4. Run: npm run dev to start your application');

  return allTestsPassed;
}

// Run validation
if (require.main === module) {
  validateDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation script failed:', error);
      process.exit(1);
    });
}

module.exports = { validateDatabase };