#!/bin/bash
# Stop Master Toggle Agent for Scout Dash

set -e

echo "🛑 Stopping Master Toggle Agent..."

# Check if PID file exists
if [ ! -f "logs/master-toggle-agent.pid" ]; then
    echo "❌ No PID file found. Agent may not be running."
    exit 1
fi

# Read PID from file
AGENT_PID=$(cat logs/master-toggle-agent.pid)

# Check if process is running
if ! ps -p $AGENT_PID > /dev/null 2>&1; then
    echo "❌ Process with PID $AGENT_PID is not running."
    rm -f logs/master-toggle-agent.pid
    exit 1
fi

echo "📄 Found Agent PID: $AGENT_PID"

# Send SIGTERM for graceful shutdown
echo "🔄 Sending SIGTERM for graceful shutdown..."
kill -TERM $AGENT_PID

# Wait for process to exit
echo "⏳ Waiting for process to exit..."
for i in {1..30}; do
    if ! ps -p $AGENT_PID > /dev/null 2>&1; then
        echo "✅ Agent stopped gracefully"
        break
    fi
    sleep 1
    echo -n "."
done

# Force kill if still running
if ps -p $AGENT_PID > /dev/null 2>&1; then
    echo "⚠️  Process still running, forcing termination..."
    kill -KILL $AGENT_PID
    sleep 2
    
    if ps -p $AGENT_PID > /dev/null 2>&1; then
        echo "❌ Failed to stop the process"
        exit 1
    else
        echo "✅ Agent force-stopped"
    fi
fi

# Clean up PID file
rm -f logs/master-toggle-agent.pid

echo "🎉 Master Toggle Agent stopped successfully!"