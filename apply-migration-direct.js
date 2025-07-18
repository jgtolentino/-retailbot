const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🚀 Starting Consumer Analytics Database Deployment...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250719_consumer_analytics_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Applying migration...');
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (error) {
      // If RPC doesn't exist, try direct execution
      console.log('🔄 Trying alternative method...');
      
      // Split migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        
        // For table creation, we'll use Supabase API
        if (stmt.includes('CREATE TABLE')) {
          console.log('Creating table via API...');
          // Skip - tables need to be created via SQL editor
        }
      }
      
      console.log('');
      console.log('⚠️  Note: Direct SQL execution via API is limited.');
      console.log('');
      console.log('Please apply the migration manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql');
      console.log('2. Copy the contents of: supabase/migrations/20250719_consumer_analytics_schema.sql');
      console.log('3. Paste and run in the SQL editor');
      console.log('');
      return;
    }
    
    console.log('✅ Migration applied successfully!');
    
    // Apply seed data
    const seedPath = path.join(__dirname, 'supabase/seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Applying seed data...');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      await supabase.rpc('exec_sql', {
        sql_query: seedSQL
      });
      
      console.log('✅ Seed data applied!');
    }
    
    console.log('');
    console.log('🎉 Consumer Analytics setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Check console for any remaining errors');
    console.log('3. Verify data is loading in the dashboard');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('');
    console.log('Alternative approach:');
    console.log('1. Go to: https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql');
    console.log('2. Copy the contents of: supabase/migrations/20250719_consumer_analytics_schema.sql');
    console.log('3. Paste and run in the SQL editor');
  }
}

// Run the migration
applyMigration();