#!/bin/bash
# Start Master Toggle Agent for Scout Dash
# This script initializes the Master Toggle Agent with proper configuration

set -e

echo "🚀 Starting Master Toggle Agent..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Set environment
export NODE_ENV=${NODE_ENV:-development}
export MASTER_TOGGLE_PORT=${MASTER_TOGGLE_PORT:-8080}

echo "📝 Configuration:"
echo "  - Environment: $NODE_ENV"
echo "  - WebSocket Port: $MASTER_TOGGLE_PORT"
echo "  - Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory
mkdir -p logs

# Apply database schema if needed
echo "🗄️  Applying database schema..."
if [ -f "schema/master_data_tables.sql" ]; then
    echo "Schema file found, applying to database..."
    # Note: This would typically use a tool like psql or Supabase CLI
    # For now, we'll just log that it should be applied
    echo "⚠️  Please manually apply schema/master_data_tables.sql to your database"
fi

# Start the Master Toggle Agent
echo "🎯 Starting Master Toggle Agent..."

# Create a simple Node.js script to start the agent
cat > start-agent.js << 'EOF'
const { MasterToggleAgent } = require('./services/masterToggleAgent');
const { getMasterToggleConfig } = require('./config/masterToggleConfig');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get configuration
const config = getMasterToggleConfig(process.env.NODE_ENV);

// Initialize and start the agent
const agent = new MasterToggleAgent(supabase, config);

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
agent.start().then(() => {
  console.log('✅ Master Toggle Agent is running');
  console.log(`🌐 WebSocket server listening on port ${config.websocketPort}`);
  console.log('📊 Monitoring the following dimensions:');
  
  Object.entries(config.dimensions).forEach(([name, conf]) => {
    if (conf.enabled) {
      console.log(`  - ${name}: ${conf.sourceTable}.${conf.sourceColumn} -> ${conf.masterTable}`);
    }
  });
  
  console.log('👁️  Watching for data changes...');
}).catch(error => {
  console.error('❌ Failed to start Master Toggle Agent:', error);
  process.exit(1);
});
EOF

# Start the agent in the background
nohup node start-agent.js > logs/master-toggle-agent.log 2>&1 &
AGENT_PID=$!

echo "✅ Master Toggle Agent started successfully!"
echo "📄 Process ID: $AGENT_PID"
echo "📋 Log file: logs/master-toggle-agent.log"
echo "🌐 WebSocket endpoint: ws://localhost:$MASTER_TOGGLE_PORT"

# Save PID for later use
echo $AGENT_PID > logs/master-toggle-agent.pid

echo ""
echo "🔧 Management commands:"
echo "  - View logs: tail -f logs/master-toggle-agent.log"
echo "  - Stop agent: kill $AGENT_PID"
echo "  - Health check: curl http://localhost:3000/api/master-toggle/health"
echo ""

# Display recent logs
echo "📝 Recent logs:"
sleep 2
tail -20 logs/master-toggle-agent.log

echo ""
echo "🎉 Master Toggle Agent is now running and monitoring for data changes!"
echo "🔄 Filter options will be automatically updated as new data arrives."