const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')
// Remove csv requirement - using JSON instead

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cxzllzyxwpyptfretryc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g'
)

// Path to synthetic data
const SYNTHETIC_DATA_PATH = '/Users/tbwa/Library/CloudStorage/GoogleDrive-jgtolentino.rn@gmail.com/My Drive/GitHub/GitHub/pulser-mcp-server/synthetic_data_mcp/output'

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Step 1: Create tables if they don't exist
    await createTables()
    
    // Step 2: Load and parse CSV data
    const scoutData = await loadScoutDashboardData()
    
    // Step 3: Seed transactions table
    await seedTransactions(scoutData)
    
    // Step 4: Seed other tables
    await seedMasterData(scoutData)
    
    // Step 5: Generate IoT telemetry
    await seedIoTTelemetry()
    
    console.log('✅ Database seeding complete!')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

async function createTables() {
  console.log('📋 Checking/creating tables...')
  
  // Check if transactions table exists by trying to query it
  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .limit(1)
  
  if (error && error.code === '42P01') {
    console.log('⚠️  Tables need to be created via SQL migration')
    console.log('   Please run the SQL scripts in the Supabase dashboard')
  } else if (!error) {
    console.log('✅ Transactions table exists')
  }
}

async function loadScoutDashboardData() {
  console.log('📂 Loading Scout Dashboard data from JSON...')
  
  try {
    // Load JSON files directly
    const jsonFiles = [
      'consumer_behavior_15000_records.json',
      'consumer_profiles_15000_records.json',
      'product_mix_15000_records.json',
      'transaction_patterns_15000_records.json'
    ]
    
    let allRecords = []
    
    for (const file of jsonFiles) {
      try {
        const jsonPath = path.join(SYNTHETIC_DATA_PATH, file)
        const jsonContent = await fs.readFile(jsonPath, 'utf-8')
        const data = JSON.parse(jsonContent)
        allRecords = allRecords.concat(data)
        console.log(`✅ Loaded ${data.length} records from ${file}`)
      } catch (e) {
        console.log(`⚠️  Could not load ${file}:`, e.message)
      }
    }
    
    if (allRecords.length > 0) {
      return transformJsonToTransactions(allRecords)
    } else {
      console.log('⚠️  No data files found, generating mock data...')
      return generateMockData()
    }
    
  } catch (error) {
    console.log('⚠️  Error loading data, generating mock data...')
    return generateMockData()
  }
}

function transformJsonToTransactions(records) {
  console.log('🔄 Transforming JSON data to transaction format...')
  
  const transactions = []
  
  records.forEach((record, index) => {
    // Transform based on record type
    if (record.transaction_id) {
      // Already in transaction format
      transactions.push(record)
    } else if (record.behavior_type) {
      // Consumer behavior record
      transactions.push({
        transaction_id: `TX_CB_${Date.now()}_${index}`,
        timestamp: record.timestamp || new Date().toISOString(),
        store_id: record.store_id,
        location: record.location,
        product_category: record.product_category,
        amount: Math.random() * 1000,
        quantity: Math.floor(1 + Math.random() * 5),
        payment_method: record.payment_preference || 'cash',
        customer_id: record.consumer_id,
        age_bracket: record.age_group,
        gender: record.gender
      })
    } else if (record.profile_id) {
      // Consumer profile record
      transactions.push({
        transaction_id: `TX_CP_${Date.now()}_${index}`,
        timestamp: new Date().toISOString(),
        customer_id: record.profile_id,
        customer_economic_class: record.economic_class,
        age_bracket: record.age_group,
        gender: record.gender,
        location: record.location
      })
    } else if (record.product_id) {
      // Product mix record
      transactions.push({
        transaction_id: `TX_PM_${Date.now()}_${index}`,
        timestamp: record.date || new Date().toISOString(),
        product_name: record.product_name,
        product_category: record.category,
        product_subcategory: record.subcategory,
        brand: record.brand,
        amount: record.price * (record.quantity || 1),
        quantity: record.quantity || 1
      })
    }
  })
  
  console.log(`✅ Transformed ${transactions.length} transactions`)
  return transactions
}

function generateMockData() {
  console.log('🎲 Generating mock data...')
  
  const stores = [
    { id: 'S001', name: 'Aling Rosa Store', location: 'Quezon City', region: 'NCR', type: 'sari-sari' },
    { id: 'S002', name: 'Mang Juan Sari-Sari', location: 'Makati', region: 'NCR', type: 'sari-sari' },
    { id: 'S003', name: 'Tindahan ni Ate', location: 'Pasig', region: 'NCR', type: 'convenience' },
    { id: 'S004', name: 'Ka Pedro Store', location: 'Taguig', region: 'NCR', type: 'sari-sari' },
    { id: 'S005', name: 'Mely\'s Store', location: 'Cebu City', region: 'Region VII', type: 'sari-sari' }
  ]
  
  const products = [
    { name: 'Rice 5kg', category: 'Food', subcategory: 'Staples', brand: 'Jasmine', price: 250 },
    { name: 'Cooking Oil 1L', category: 'Food', subcategory: 'Cooking', brand: 'Golden', price: 85 },
    { name: 'Instant Noodles', category: 'Food', subcategory: 'Instant', brand: 'Lucky Me', price: 15 },
    { name: 'Coke 1.5L', category: 'Beverages', subcategory: 'Soft Drinks', brand: 'Coca-Cola', price: 45 },
    { name: 'Shampoo Sachet', category: 'Personal Care', subcategory: 'Hair Care', brand: 'Head & Shoulders', price: 8 }
  ]
  
  const paymentMethods = ['cash', 'gcash', 'maya', 'credit_card']
  const weatherConditions = ['sunny', 'cloudy', 'rainy']
  const handshakeTypes = ['direct', 'agent', 'digital', 'hybrid']
  const handshakeResults = ['success', 'partial', 'failed']
  
  const records = []
  const now = new Date()
  
  // Generate 1000 sample transactions
  for (let i = 0; i < 1000; i++) {
    const store = stores[Math.floor(Math.random() * stores.length)]
    const product = products[Math.floor(Math.random() * products.length)]
    const timestamp = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
    
    records.push({
      transaction_id: `TX${Date.now()}${i}`,
      timestamp: timestamp.toISOString(),
      store_id: store.id,
      store_name: store.name,
      location: store.location,
      region: store.region,
      province: store.region,
      city_municipality: store.location,
      barangay: `Brgy ${Math.floor(Math.random() * 100)}`,
      store_type: store.type,
      store_economic_class: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
      product_name: product.name,
      product_category: product.category,
      product_subcategory: product.subcategory,
      brand: product.brand,
      amount: product.price * (1 + Math.random() * 2),
      quantity: Math.floor(1 + Math.random() * 5),
      payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      customer_id: `CUST${Math.floor(Math.random() * 500)}`,
      customer_economic_class: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
      age_bracket: ['18-24', '25-34', '35-44', '45-54', '55+'][Math.floor(Math.random() * 5)],
      gender: ['M', 'F'][Math.floor(Math.random() * 2)],
      handshake_type: handshakeTypes[Math.floor(Math.random() * handshakeTypes.length)],
      handshake_result: handshakeResults[Math.floor(Math.random() * handshakeResults.length)],
      weather_condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
      day_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][timestamp.getDay()],
      hour_of_day: timestamp.getHours()
    })
  }
  
  return records
}

async function seedTransactions(data) {
  console.log('💰 Seeding transactions table...')
  
  // Process in batches of 100
  const batchSize = 100
  let processed = 0
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('transactions')
      .upsert(batch, { 
        onConflict: 'transaction_id',
        ignoreDuplicates: true 
      })
    
    if (error) {
      console.error('Batch insert error:', error)
    } else {
      processed += batch.length
      console.log(`  Processed ${processed}/${data.length} records...`)
    }
  }
  
  console.log('✅ Transactions seeded!')
}

async function seedMasterData(data) {
  console.log('🏪 Processing master data...')
  
  // Extract unique values for master tables
  const locations = [...new Set(data.map(r => r.location).filter(Boolean))]
  const brands = [...new Set(data.map(r => r.brand).filter(Boolean))]
  const categories = [...new Set(data.map(r => r.product_category).filter(Boolean))]
  const storeTypes = [...new Set(data.map(r => r.store_type).filter(Boolean))]
  
  console.log(`  Found ${locations.length} unique locations`)
  console.log(`  Found ${brands.length} unique brands`)
  console.log(`  Found ${categories.length} unique categories`)
  console.log(`  Found ${storeTypes.length} unique store types`)
  
  // Note: Master tables would be populated by the Master Toggle Agent
  console.log('  ℹ️  Master tables are managed by the Master Toggle Agent')
}

async function seedIoTTelemetry() {
  console.log('📡 Preparing IoT telemetry data...')
  
  // IoT telemetry would be ingested through the Lyra Bronze layer
  console.log('  ℹ️  IoT telemetry should be ingested via Lyra Data Lakehouse')
  console.log('     Bronze → Silver → Gold pipeline')
}

// Run seeding
seedDatabase().catch(console.error)