const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use the service role key for admin access
const supabaseUrl = 'https://cxzllzyxwpyptfretryc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenlvd3B5dHRmcmV0cnljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE1MjczMCwiZXhwIjoyMDQ4NzI4NzMwfQ.fdRT1MhejO_L0P9OVH3LXSdAmJZDQoYqTKMKkR93A5o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile() {
  try {
    console.log('🚀 Starting Supabase table creation...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(__dirname, 'SUPABASE_FIX.sql'), 'utf8');
    
    // Split SQL statements by semicolon and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip if it's just a comment
      if (statement.trim().startsWith('--')) continue;
      
      try {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        // Extract first few words to identify the operation
        const operation = statement.trim().substring(0, 50).replace(/\n/g, ' ');
        console.log(`   Operation: ${operation}...`);
        
        // Execute using Supabase's rpc function
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        });
        
        if (error) {
          // Try direct execution as fallback
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        
        console.log(`   ✅ Success`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
        
        // Continue with next statement
        continue;
      }
    }
    
    console.log('\n📊 Execution Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📋 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All tables created successfully!');
    } else {
      console.log('\n⚠️  Some statements failed. Check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Execute the fix
executeSQLFile();