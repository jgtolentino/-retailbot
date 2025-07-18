const { createClient } = require('@supabase/supabase-js')

// Supabase credentials from .env.local
const supabaseUrl = 'https://cxzllzyxwpyptfretryc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')
  
  try {
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('transactions')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message)
      console.log('   Error code:', testError.code)
      console.log('   Error details:', testError.details)
      
      if (testError.code === '42P01') {
        console.log('\n⚠️  Table "transactions" does not exist!')
      }
    } else {
      console.log('✅ Connected to Supabase successfully!')
    }

    // Test 2: Check each expected table
    console.log('\n2. Checking each expected table:')
    const expectedTables = [
      'transactions',
      'product_mix',
      'consumer_behavior',
      'suggestion_acceptance',
      'consumer_profiles'
    ]
    
    let tablesFound = 0
    let tablesMissing = 0
    
    for (const table of expectedTables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ Table "${table}" - NOT FOUND (${error.code}: ${error.message})`)
        tablesMissing++
      } else {
        console.log(`   ✅ Table "${table}" - EXISTS`)
        tablesFound++
      }
    }

    // Test 3: Check if we need authentication
    console.log('\n4. Checking authentication status...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('   ℹ️  No authentication required (using anon key)')
    } else if (user) {
      console.log('   ✅ Authenticated as:', user.email || user.id)
    }

    // Test 4: Try to query with a simple select
    console.log('\n5. Testing data query...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5)
    
    if (sampleError) {
      console.log('   ❌ Query failed:', sampleError.message)
    } else {
      console.log('   ✅ Query successful!')
      console.log('   Found', sampleData?.length || 0, 'records')
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
  }

  console.log('\n📊 Diagnosis Summary:')
  console.log('- Supabase URL:', supabaseUrl)
  console.log('- Using anonymous key: Yes')
  console.log(`- Tables found: ${tablesFound}/${expectedTables.length}`)
  console.log(`- Tables missing: ${tablesMissing}`)
  
  if (tablesMissing > 0) {
    console.log('\n🔧 Solution: The required tables need to be created in your Supabase database.')
    console.log('   You can create them using the Supabase SQL editor in your dashboard.')
  }
}

// Run the test
testConnection()