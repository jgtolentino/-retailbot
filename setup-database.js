#!/usr/bin/env node

// Setup database schema using Supabase API
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://cxzllzyxwpyptfretryc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g';

// Read the SQL file
const sqlFile = path.join(__dirname, 'CORRECTED_SCHEMA_FIX.sql');

if (!fs.existsSync(sqlFile)) {
    console.error('❌ SQL file not found:', sqlFile);
    process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('🚀 Setting up database schema...');
console.log('📁 SQL file:', sqlFile);

// Note: Direct SQL execution via REST API requires service role key
// For now, we'll create a simple data insertion script using the REST API

async function createSampleData() {
    console.log('📊 Creating sample data via REST API...');
    
    try {
        // First, let's test if we can create tables (this will likely fail with anon key)
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        if (!testResponse.ok) {
            const errorText = await testResponse.text();
            console.log('⚠️  Tables may not exist. Response:', errorText);
            
            if (errorText.includes('does not exist')) {
                console.log('');
                console.log('🔧 MANUAL SETUP REQUIRED:');
                console.log('1. Go to: https://app.supabase.com/project/cxzllzyxwpyptfretryc/sql/new');
                console.log('2. Copy and paste the contents of CORRECTED_SCHEMA_FIX.sql');
                console.log('3. Click "Run" to execute the SQL');
                console.log('4. After successful execution, restart the dashboard');
                console.log('');
                console.log('✅ Dashboard is still running at: http://localhost:3000');
                console.log('💡 The dashboard will show "No data available" until tables are created');
                return;
            }
        }
        
        console.log('✅ Database connection successful!');
        
        // Try to insert sample data
        const sampleData = {
            volume: 1500.50,
            revenue: 25000.00,
            avg_basket: 125.75,
            duration: 45,
            units: 150,
            location: 'Manila',
            category: 'Beverages',
            brand: 'TBWA Brand A'
        };
        
        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sampleData)
        });
        
        if (insertResponse.ok) {
            console.log('✅ Sample data inserted successfully!');
        } else {
            const errorText = await insertResponse.text();
            console.log('⚠️  Could not insert sample data:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createSampleData();