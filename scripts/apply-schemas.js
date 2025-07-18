const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applySchema(schemaPath, schemaName) {
  try {
    console.log(`📝 Applying ${schemaName}...`);
    
    // Read SQL file
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements (basic split, might need refinement)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        // Skip comments
        if (statement.startsWith('--') || statement.startsWith('/*')) {
          continue;
        }
        
        // Execute statement
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.error(`❌ Error: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Failed statement: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`✅ ${schemaName} applied: ${successCount} successful, ${errorCount} errors`);
    return errorCount === 0;
    
  } catch (error) {
    console.error(`❌ Failed to apply ${schemaName}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Applying Master Toggle Agent schemas...\n');
  
  // Check connection
  const { data, error } = await supabase.from('_prisma_migrations').select('id').limit(1);
  if (error && error.code !== '42P01') {
    console.error('❌ Cannot connect to database:', error.message);
    process.exit(1);
  }
  
  // Apply schemas in order
  const schemas = [
    {
      path: path.join(__dirname, '..', 'schema', 'agent_repository.sql'),
      name: 'Agent Repository'
    },
    {
      path: path.join(__dirname, '..', 'schema', 'master_data_tables.sql'),
      name: 'Master Data Tables'
    }
  ];
  
  let allSuccess = true;
  
  for (const schema of schemas) {
    if (fs.existsSync(schema.path)) {
      const success = await applySchema(schema.path, schema.name);
      allSuccess = allSuccess && success;
    } else {
      console.error(`❌ Schema file not found: ${schema.path}`);
      allSuccess = false;
    }
  }
  
  if (allSuccess) {
    console.log('\n✅ All schemas applied successfully!');
    console.log('🎉 Master Toggle Agent database is ready!');
  } else {
    console.log('\n⚠️  Some schemas had errors. Check the output above.');
    process.exit(1);
  }
}

// Direct SQL execution function (if RPC not available)
async function executeSQL(sql) {
  // This is a fallback - Supabase JS client doesn't directly support raw SQL
  // You might need to use the Supabase CLI or REST API directly
  console.log('📋 SQL to execute:', sql.substring(0, 100) + '...');
  
  // Alternative: Use fetch to call Supabase REST API directly
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

main().catch(console.error);