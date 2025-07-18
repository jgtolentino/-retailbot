#!/bin/bash

# Deploy Lyra Data Lakehouse
# Bronze -> Silver -> Gold Architecture

set -e

echo "🏗️  Deploying Lyra Data Lakehouse"
echo "=================================="

# Configuration
PROJECT_DIR="/Users/tbwa/Desktop/scout-databank-clone"
SUPABASE_URL="https://cxzllzyxwpyptfretryc.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g"

cd "$PROJECT_DIR"

# Step 1: Create Lyra service starter
echo "📝 Creating Lyra service starter..."

cat > start-lyra-lakehouse.js << 'EOF'
const { LyraDataLakehouse } = require('./services/lyraDataLakehouse');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Create Lyra instance
const lyra = new LyraDataLakehouse(supabase);

// Handle events
lyra.on('bronze_ingested', (data) => {
  console.log('📥 Bronze ingested:', data);
});

lyra.on('silver_processed', (data) => {
  console.log('🥈 Silver processed:', data);
});

lyra.on('gold_calculated', (data) => {
  console.log('🏆 Gold calculated:', data);
});

// Start processing loop
async function startProcessing() {
  console.log('🚀 Lyra Data Lakehouse started');
  
  // Process bronze batch every 30 seconds
  setInterval(async () => {
    try {
      await lyra.processBronzeBatch();
    } catch (error) {
      console.error('Bronze batch error:', error);
    }
  }, 30000);
  
  // Calculate gold metrics every 5 minutes
  setInterval(async () => {
    try {
      await lyra.processToGold('store_performance');
      await lyra.processToGold('iot_health');
    } catch (error) {
      console.error('Gold processing error:', error);
    }
  }, 300000);
  
  // Show layer stats every minute
  setInterval(async () => {
    const stats = await lyra.getLayerStats();
    console.log('📊 Layer Stats:', JSON.stringify(stats, null, 2));
  }, 60000);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down Lyra...');
  process.exit(0);
});

// Start
startProcessing();

// Keep process alive
process.stdin.resume();
EOF

# Step 2: Create test data ingestion script
echo "📝 Creating test data script..."

cat > ingest-test-data.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
const { LyraDataLakehouse } = require('./services/lyraDataLakehouse');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const lyra = new LyraDataLakehouse(supabase);

async function ingestTestData() {
  console.log('🧪 Ingesting test data to Bronze layer...');
  
  // IoT telemetry samples
  const iotSamples = [
    {
      device_id: 'S001_TEMP_01',
      device_type: 'temperature',
      timestamp: new Date().toISOString(),
      telemetry: {
        temperature: 24.5 + Math.random() * 5,
        humidity: 60 + Math.random() * 20,
        battery_level: 80 + Math.random() * 20,
        signal_strength: -50 - Math.random() * 30
      },
      metadata: {
        firmware_version: '2.1.0',
        uptime_seconds: 86400
      }
    },
    {
      device_id: 'S002_POS_01',
      device_type: 'pos_terminal',
      timestamp: new Date().toISOString(),
      telemetry: {
        transaction_count: Math.floor(Math.random() * 100),
        uptime_hours: Math.floor(Math.random() * 720),
        network_latency: Math.floor(Math.random() * 100),
        printer_status: ['ok', 'low_paper', 'error'][Math.floor(Math.random() * 3)]
      }
    }
  ];
  
  // Transaction samples
  const transactionSamples = [
    {
      transaction_id: 'TX_' + Date.now(),
      store_id: 'S001',
      timestamp: new Date().toISOString(),
      amount: (Math.random() * 1000).toFixed(2),
      items: [
        { name: 'Rice 5kg', quantity: 1, price: 250 },
        { name: 'Cooking Oil 1L', quantity: 2, price: 85 }
      ],
      payment_method: 'cash',
      customer_id: 'CUST_' + Math.floor(Math.random() * 1000)
    }
  ];
  
  // Ingest to Bronze
  for (const iot of iotSamples) {
    try {
      const result = await lyra.ingestToBronze('iot_' + iot.device_type, iot);
      console.log('✅ IoT ingested:', result.id);
    } catch (error) {
      console.error('❌ IoT ingestion failed:', error);
    }
  }
  
  for (const tx of transactionSamples) {
    try {
      const result = await lyra.ingestToBronze('pos_transactions', tx);
      console.log('✅ Transaction ingested:', result.id);
    } catch (error) {
      console.error('❌ Transaction ingestion failed:', error);
    }
  }
  
  console.log('📊 Test data ingestion complete!');
}

ingestTestData();
EOF

# Step 3: Create dashboard API endpoint
echo "📝 Creating API endpoint..."

cat > app/api/lyra/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get layer statistics
    const [bronze, silver, gold] = await Promise.all([
      supabase.from('bronze_raw_events').select('*', { count: 'exact', head: true }),
      supabase.from('silver_iot_telemetry').select('*', { count: 'exact', head: true }),
      supabase.from('gold_store_performance').select('*', { count: 'exact', head: true })
    ])
    
    return NextResponse.json({
      layers: {
        bronze: { count: bronze.count || 0 },
        silver: { count: silver.count || 0 },
        gold: { count: gold.count || 0 }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source, payload } = body
    
    // Ingest to bronze
    const { data, error } = await supabase
      .from('bronze_raw_events')
      .insert({
        source,
        event_type: payload.type || 'unknown',
        raw_payload: payload,
        schema_version: '1.0'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    return NextResponse.json({ error: 'Ingestion failed' }, { status: 500 })
  }
}
EOF

# Step 4: Environment setup
echo "🔧 Setting up environment..."

export NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"

# Step 5: Summary
echo ""
echo "✅ Lyra Data Lakehouse deployment ready!"
echo "========================================"
echo ""
echo "📚 Architecture:"
echo "  Bronze Layer: Raw JSONB ingestion"
echo "  Silver Layer: Cleaned & validated data"
echo "  Gold Layer: Business-ready aggregates"
echo ""
echo "🚀 To start Lyra:"
echo "  1. Apply schema: psql < schema/lakehouse_layers.sql"
echo "  2. Start service: node start-lyra-lakehouse.js"
echo "  3. Ingest test data: node ingest-test-data.js"
echo ""
echo "📊 Dashboard: http://localhost:3000/dashboard/iot"
echo "🔌 API Endpoint: http://localhost:3000/api/lyra"
echo ""
echo "📡 Data flows:"
echo "  JSONB → Bronze → Silver → Gold → Dashboard"
echo ""