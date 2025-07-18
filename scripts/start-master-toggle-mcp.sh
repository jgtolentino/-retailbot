#!/bin/bash
# Start Master Toggle Agent with MCP Integration
# This script initializes the agent with official MCP server credentials

set -e

echo "🚀 Starting Master Toggle Agent with MCP Integration..."

# Load configuration from .env.local
if [ -f ".env.local" ]; then
    echo "📝 Loading configuration from .env.local"
    source .env.local
fi

# Use service role key as access token
export SUPABASE_ACCESS_TOKEN=${SUPABASE_SERVICE_ROLE_KEY}
export SUPABASE_PROJECT_REF="cxzllzyxwpyptfretryc"

# Check required credentials
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing SUPABASE_SERVICE_ROLE_KEY in .env.local"
    exit 1
fi

# Set default values
export NODE_ENV=${NODE_ENV:-development}
export MASTER_TOGGLE_PORT=${MASTER_TOGGLE_PORT:-8080}
export SUPABASE_ROLE=${SUPABASE_ROLE:-service_role}
export MCP_READ_ONLY=${MCP_READ_ONLY:-false}

# Set derived values
export NEXT_PUBLIC_SUPABASE_URL="https://${SUPABASE_PROJECT_REF}.supabase.co"

echo "📝 MCP Configuration:"
echo "  - Project Ref: $SUPABASE_PROJECT_REF"
echo "  - Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "  - Role: $SUPABASE_ROLE"
echo "  - Read Only: $MCP_READ_ONLY"
echo "  - Environment: $NODE_ENV"
echo "  - WebSocket Port: $MASTER_TOGGLE_PORT"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory
mkdir -p logs

# Check if agent repository schema exists
echo "🗄️  Checking agent repository schema..."
cat > check-agent-repo.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ACCESS_TOKEN
);

async function checkAgentRepository() {
  try {
    // Check if agent_repository schema exists
    const { data, error } = await supabase
      .from('agent_repository.agents')
      .select('agent_name')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('⚠️  Agent repository schema not found. Please apply the schema first.');
      console.log('Run: psql -h your-host -d your-db -f schema/agent_repository.sql');
      process.exit(1);
    } else if (error) {
      console.log('❌ Error checking agent repository:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Agent repository schema found');
    }
  } catch (err) {
    console.error('❌ Failed to check agent repository:', err);
    process.exit(1);
  }
}

checkAgentRepository();
EOF

node check-agent-repo.js
rm check-agent-repo.js

# Create the MCP-enabled agent startup script
cat > start-agent-mcp.js << 'EOF'
const { createMasterToggleAgentMCP } = require('./services/masterToggleAgentMCP');

// Create MCP-enabled agent
const agent = createMasterToggleAgentMCP({
  projectRef: process.env.SUPABASE_PROJECT_REF,
  accessToken: process.env.SUPABASE_ACCESS_TOKEN,
  role: process.env.SUPABASE_ROLE || 'service_role',
  readOnly: process.env.MCP_READ_ONLY === 'true'
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  await agent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  await agent.stop();
  process.exit(0);
});

// Start the agent
agent.start().then(async () => {
  console.log('✅ Master Toggle Agent MCP is running');
  console.log(`🌐 WebSocket server listening on port ${process.env.MASTER_TOGGLE_PORT || 8080}`);
  console.log('🤖 Agent registered in unified repository');
  
  // Get and display agent status
  const health = agent.getHealth();
  console.log('📊 Agent Status:', JSON.stringify(health, null, 2));
  
  // Check for other agents
  const otherAgents = await agent.getAgentStatuses();
  console.log(`\n🤝 Other agents in the ecosystem: ${otherAgents.length}`);
  otherAgents.forEach(a => {
    console.log(`  - ${a.agent_name} (${a.agent_type}) v${a.version}`);
  });
  
  console.log('\n👁️  Watching for data changes...');
}).catch(error => {
  console.error('❌ Failed to start Master Toggle Agent MCP:', error);
  process.exit(1);
});

// Periodic health check and agent sync
setInterval(async () => {
  try {
    // Share current filter statistics
    const health = agent.getHealth();
    await agent.shareKnowledge('agent_health', 'master-toggle-agent', {
      status: health.status,
      dimensions: health.dimensions,
      uptime: health.uptime,
      timestamp: new Date().toISOString()
    });
    
    // Check for messages from other agents
    const messages = await agent.getSharedKnowledge('agent_messages', 'master-toggle-agent');
    if (messages && messages.length > 0) {
      console.log(`📨 Received ${messages.length} messages from other agents`);
    }
  } catch (error) {
    console.error('❌ Health check error:', error);
  }
}, 60000); // Every minute
EOF

# Start the agent
echo "🎯 Starting Master Toggle Agent with MCP..."
nohup node start-agent-mcp.js > logs/master-toggle-agent-mcp.log 2>&1 &
AGENT_PID=$!

echo "✅ Master Toggle Agent MCP started successfully!"
echo "📄 Process ID: $AGENT_PID"
echo "📋 Log file: logs/master-toggle-agent-mcp.log"
echo "🌐 WebSocket endpoint: ws://localhost:$MASTER_TOGGLE_PORT"

# Save PID
echo $AGENT_PID > logs/master-toggle-agent-mcp.pid

# Wait a moment for startup
sleep 3

# Display initial logs
echo ""
echo "📝 Initial logs:"
tail -30 logs/master-toggle-agent-mcp.log

echo ""
echo "🔧 Management commands:"
echo "  - View logs: tail -f logs/master-toggle-agent-mcp.log"
echo "  - Stop agent: ./scripts/stop-master-toggle-agent.sh"
echo "  - Health check: curl http://localhost:3000/api/master-toggle/health"
echo ""

echo "🎉 Master Toggle Agent is now integrated with the MCP ecosystem!"
echo "🤝 Working alongside other agents like Lyra, Bruno, and Pulser"