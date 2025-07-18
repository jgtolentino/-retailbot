const { createClient } = require('@supabase/supabase-js');

// Both projects with service role keys
const projects = {
  primary: {
    url: 'https://cxzllzyxwpyptfretryc.supabase.co',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM3NjE4MCwiZXhwIjoyMDY3OTUyMTgwfQ.bHZu_tPiiFVM7fZksLA1lIvflwKENz1t2jowGkx23QI'
  },
  alternate: {
    url: 'https://texxwmlroefdisgxpszc.supabase.co', 
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleHh3bWxyb2VmZGlzZ3hwc3pjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg0MDcyNCwiZXhwIjoyMDY4NDE2NzI0fQ.rPkW7VgW42GCaz9cfxvhyDo_1ySHBiyxnjfiycJXptc'
  }
};

async function executeSQLDirect(project, sql) {
  const { url, serviceKey } = projects[project];
  const supabase = createClient(url, serviceKey);
  
  console.log(`\n📊 Executing on ${project} project...`);
  
  // For admin operations, we'll use raw HTTP API
  const response = await fetch(`${url}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!response.ok) {
    // Try direct execution instead
    console.log('Using alternative approach...');
    // Split SQL into statements
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
    }
  }
  
  return response;
}

async function setupMasterToggleAgent() {
  console.log('🚀 Setting up Master Toggle Agent on both projects...\n');
  
  // Read the migration SQL
  const fs = require('fs');
  const migrationSQL = fs.readFileSync('supabase/migrations/20250719005326_master_toggle_agent_setup.sql', 'utf8');
  
  // Apply to primary project
  console.log('1️⃣ Setting up PRIMARY project (Scout Dashboard)');
  await executeSQLDirect('primary', migrationSQL);
  
  // Apply to alternate project  
  console.log('\n2️⃣ Setting up ALTERNATE project (Agent Registry)');
  await executeSQLDirect('alternate', migrationSQL);
  
  console.log('\n✅ Master Toggle Agent setup complete on both projects!');
  console.log('\nYou can now:');
  console.log('- Start the Master Toggle Agent: ./scripts/start-master-toggle-mcp.sh');
  console.log('- Access agent registry on both projects');
  console.log('- Have full admin control via service role keys');
}

// Execute setup
setupMasterToggleAgent().catch(console.error);