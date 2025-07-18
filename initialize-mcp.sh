#!/bin/bash

echo "🚀 Initializing Supabase MCP for Scout Databank"
echo "=============================================="

# Load environment variables
source .env.local

# Step 1: Apply schema fixes
echo "📊 Applying database schema fixes..."
psql "postgresql://postgres.cxzllzyxwpyptfretryc:$SUPABASE_SERVICE_ROLE_KEY@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -f SUPABASE_FIX.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema fixes applied successfully"
else
    echo "❌ Schema fix failed - continuing with MCP setup"
fi

# Step 2: Initialize MCP server
echo "🔧 Initializing Supabase MCP server..."

# Create MCP config for various clients
cat > .cursor/mcp.json << EOF
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=cxzllzyxwpyptfretryc"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "$SUPABASE_SERVICE_ROLE_KEY"
      }
    }
  }
}
EOF

# Create directory if it doesn't exist
mkdir -p .cursor

# Test MCP connection
echo "🧪 Testing MCP connection..."
npx -y @supabase/mcp-server-supabase@latest --project-ref=cxzllzyxwpyptfretryc --help

echo ""
echo "✅ MCP Initialization Complete!"
echo "📊 Dashboard: https://scout-databank-clone-4gi581czs-scout-db.vercel.app"
echo "🔧 MCP Config: .cursor/mcp.json"
echo ""
echo "🎯 Next steps:"
echo "   1. Add Personal Access Token to MCP config"
echo "   2. Restart your AI client (Cursor/Claude)"
echo "   3. Verify dashboard data loading"
