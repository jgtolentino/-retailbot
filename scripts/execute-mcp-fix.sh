#!/bin/bash

# Execute Supabase fix using MCP server
# This script uses the official Supabase MCP server to deploy schema fixes

echo "🚀 Executing Supabase schema fix via MCP server..."
echo ""

# Check if SQL file exists
if [ ! -f "scripts/fix-supabase-realtime-mcp.sql" ]; then
    echo "❌ Error: SQL file not found at scripts/fix-supabase-realtime-mcp.sql"
    exit 1
fi

# Read SQL content
SQL_CONTENT=$(cat scripts/fix-supabase-realtime-mcp.sql)

echo "📋 Using MCP server configuration from .mcp/servers.json"
echo "🔗 Target: https://cxzllzyxwpyptfretryc.supabase.co"
echo ""

# Execute via MCP
echo "⚡ Executing SQL via Supabase MCP server..."

# Create a temporary file with the MCP command
cat > /tmp/mcp-execute.json << EOF
{
  "method": "supabase/query",
  "params": {
    "query": $(echo "$SQL_CONTENT" | jq -Rs .)
  }
}
EOF

# Use the MCP server to execute
npx -y @modelcontextprotocol/server-supabase execute < /tmp/mcp-execute.json

# Check result
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Schema deployed successfully!"
    echo ""
    echo "🎉 WebSocket 404 errors should now be fixed!"
    echo ""
    echo "Next steps:"
    echo "1. Restart your Next.js development server: npm run dev"
    echo "2. Check browser console - WebSocket connections should work"
    echo "3. Your dashboard will show live data updates"
else
    echo ""
    echo "❌ Deployment failed. Please check the error above."
    echo ""
    echo "Alternative: Run the SQL manually in Supabase Dashboard:"
    echo "1. Go to https://app.supabase.com/project/cxzllzyxwpyptfretryc"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy contents of scripts/fix-supabase-realtime-mcp.sql"
    echo "4. Paste and click Run"
fi

# Cleanup
rm -f /tmp/mcp-execute.json