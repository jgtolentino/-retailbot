#!/usr/bin/env node

// Create database schema and insert sample data
const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://cxzllzyxwpyptfretryc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g';

console.log('🚀 Creating database schema for Scout Databank...');

// Sample data for each table
const sampleTransactions = [
    {
        volume: 1250.75,
        revenue: 18500.00,
        avg_basket: 148.50,
        duration: 42,
        units: 125,
        location: 'Manila',
        category: 'Beverages',
        brand: 'TBWA Brand A'
    },
    {
        volume: 950.25,
        revenue: 15200.00,
        avg_basket: 160.00,
        duration: 38,
        units: 95,
        location: 'Cebu',
        category: 'Snacks',
        brand: 'TBWA Brand B'
    },
    {
        volume: 1850.50,
        revenue: 27800.00,
        avg_basket: 150.30,
        duration: 45,
        units: 185,
        location: 'Davao',
        category: 'Personal Care',
        brand: 'TBWA Brand C'
    },
    {
        volume: 1150.00,
        revenue: 22400.00,
        avg_basket: 194.78,
        duration: 52,
        units: 115,
        location: 'Quezon City',
        category: 'Household',
        brand: 'TBWA Brand A'
    },
    {
        volume: 2200.25,
        revenue: 33600.00,
        avg_basket: 152.73,
        duration: 48,
        units: 220,
        location: 'Manila',
        category: 'Beverages',
        brand: 'TBWA Brand B'
    }
];

const sampleProductMix = [
    {
        category: 'Beverages',
        value: 45.2,
        skus: 25,
        revenue: 15000.00
    },
    {
        category: 'Snacks',
        value: 32.8,
        skus: 18,
        revenue: 12500.00
    },
    {
        category: 'Personal Care',
        value: 18.5,
        skus: 12,
        revenue: 8900.00
    },
    {
        category: 'Household',
        value: 3.5,
        skus: 8,
        revenue: 4200.00
    }
];

const sampleConsumerBehavior = [
    {
        method: 'In-store',
        value: 75.5,
        suggested: 50,
        accepted: 38,
        rate: 76.0
    },
    {
        method: 'Online',
        value: 15.2,
        suggested: 25,
        accepted: 18,
        rate: 72.0
    },
    {
        method: 'Mobile App',
        value: 9.3,
        suggested: 15,
        accepted: 12,
        rate: 80.0
    }
];

const sampleConsumerProfiles = [
    {
        age_group: '25-34',
        gender: 'Female',
        location: 'Manila',
        income_level: '₱30k-₱60k',
        urban_rural: 'Urban'
    },
    {
        age_group: '35-44',
        gender: 'Male',
        location: 'Cebu',
        income_level: '₱60k-₱100k',
        urban_rural: 'Urban'
    },
    {
        age_group: '18-24',
        gender: 'Female',
        location: 'Davao',
        income_level: '₱30k-₱60k',
        urban_rural: 'Urban'
    },
    {
        age_group: '45-54',
        gender: 'Male',
        location: 'Quezon City',
        income_level: '₱100k+',
        urban_rural: 'Urban'
    }
];

async function makeSupabaseRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const responseData = body ? JSON.parse(body) : {};
                    resolve({ 
                        status: res.statusCode, 
                        data: responseData,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({ 
                        status: res.statusCode, 
                        data: body,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function insertSampleData() {
    console.log('📊 Inserting sample data...');
    
    try {
        // Insert transactions
        console.log('  → Inserting transactions...');
        for (const transaction of sampleTransactions) {
            const result = await makeSupabaseRequest('/rest/v1/transactions', 'POST', transaction);
            if (result.status === 201) {
                console.log('    ✅ Transaction inserted');
            } else {
                console.log(`    ❌ Transaction failed: ${result.status} - ${JSON.stringify(result.data)}`);
            }
        }

        // Insert product mix
        console.log('  → Inserting product mix...');
        for (const productMix of sampleProductMix) {
            const result = await makeSupabaseRequest('/rest/v1/product_mix', 'POST', productMix);
            if (result.status === 201) {
                console.log('    ✅ Product mix inserted');
            } else {
                console.log(`    ❌ Product mix failed: ${result.status} - ${JSON.stringify(result.data)}`);
            }
        }

        // Insert consumer behavior
        console.log('  → Inserting consumer behavior...');
        for (const behavior of sampleConsumerBehavior) {
            const result = await makeSupabaseRequest('/rest/v1/consumer_behavior', 'POST', behavior);
            if (result.status === 201) {
                console.log('    ✅ Consumer behavior inserted');
            } else {
                console.log(`    ❌ Consumer behavior failed: ${result.status} - ${JSON.stringify(result.data)}`);
            }
        }

        // Insert consumer profiles
        console.log('  → Inserting consumer profiles...');
        for (const profile of sampleConsumerProfiles) {
            const result = await makeSupabaseRequest('/rest/v1/consumer_profiles', 'POST', profile);
            if (result.status === 201) {
                console.log('    ✅ Consumer profile inserted');
            } else {
                console.log(`    ❌ Consumer profile failed: ${result.status} - ${JSON.stringify(result.data)}`);
            }
        }

        console.log('');
        console.log('✅ Sample data insertion completed!');
        console.log('');
        console.log('🎉 Database setup complete!');
        console.log('📊 Your Scout Databank dashboard should now show real data');
        console.log('🌐 Visit: http://localhost:3000/dashboard');
        console.log('');
        console.log('Note: If you still see "No data available", the database schema may not be set up.');
        console.log('Please run the SQL from CORRECTED_SCHEMA_FIX.sql in your Supabase dashboard:');
        console.log('https://app.supabase.com/project/cxzllzyxwpyptfretryc/sql/new');

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
    }
}

// Test if tables exist first
async function testTables() {
    console.log('🔍 Testing database tables...');
    
    try {
        const result = await makeSupabaseRequest('/rest/v1/transactions?select=*&limit=1');
        
        if (result.status === 200) {
            console.log('✅ Tables exist and are accessible');
            console.log('📊 Current transaction count:', Array.isArray(result.data) ? result.data.length : 'Unknown');
            return true;
        } else {
            console.log('❌ Tables do not exist or are not accessible');
            console.log('Response:', result.data);
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing tables:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting database setup...');
    
    const tablesExist = await testTables();
    
    if (!tablesExist) {
        console.log('');
        console.log('⚠️  DATABASE SCHEMA NOT FOUND');
        console.log('');
        console.log('Please set up the database schema first:');
        console.log('1. Go to: https://app.supabase.com/project/cxzllzyxwpyptfretryc/sql/new');
        console.log('2. Copy and paste the contents of CORRECTED_SCHEMA_FIX.sql');
        console.log('3. Click "Run" to execute the SQL');
        console.log('4. Run this script again: node create-database-schema.js');
        console.log('');
        console.log('The dashboard will still work but will show "No data available" until the schema is set up.');
        return;
    }
    
    await insertSampleData();
}

main().catch(console.error);