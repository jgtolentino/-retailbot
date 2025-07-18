const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cxzllzyxwpyptfretryc.supabase.co',
  'sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64'
);

async function checkAgentRepository() {
  try {
    // Check if agent_repository schema exists
    const { data, error } = await supabase
      .from('agent_repository.agents')
      .select('agent_name')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ Agent repository schema not found.');
      console.log('📝 Need to apply schema/agent_repository.sql');
      process.exit(1);
    } else if (error) {
      console.log('❌ Error checking agent repository:', error.message);
      console.log('📝 May need to create the schema');
      process.exit(1);
    } else {
      console.log('✅ Agent repository schema exists');
      console.log('📊 Found agents:', data);
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Failed to check agent repository:', err);
    process.exit(1);
  }
}

checkAgentRepository();