#!/bin/bash

echo "🚀 SCOUT DATABANK MCP INITIALIZATION"
echo "===================================="
echo ""

# Step 1: Execute schema fix
echo "📊 Step 1: Fixing Supabase schema..."
chmod +x quick-fix.sh
./quick-fix.sh

if [ $? -eq 0 ]; then
    echo "✅ Schema fix completed successfully"
else
    echo "❌ Schema fix failed - please run manually"
    echo "   psql connection or copy SUPABASE_FIX.sql to Supabase SQL Editor"
fi

echo ""

# Step 2: Test MCP connection
echo "🔧 Step 2: Testing MCP connection..."
npx -y @supabase/mcp-server-supabase@latest --project-ref=cxzllzyxwpyptfretryc --help

echo ""

# Step 3: Configuration instructions
echo "🎯 Step 3: Add MCP to your AI client"
echo "======================================"
echo ""
echo "For Claude Desktop:"
echo "1. Open Settings → Developer → Edit Config"
echo "2. Add this configuration:"
echo ""
cat claude-mcp-config.json
echo ""
echo "For Cursor:"
echo "1. Create .cursor/mcp.json in your project"
echo "2. Add the same configuration"
echo ""

# Step 4: Verification
echo "🔍 Step 4: Verify setup"
echo "======================"
echo ""
echo "✅ Dashboard: https://scout-databank-clone-4gi581czs-scout-db.vercel.app"
echo "✅ MCP Config: claude-mcp-config.json"
echo "✅ Read-only mode: Enabled for AI safety"
echo ""

echo "🎉 MCP INITIALIZATION COMPLETE!"
echo "Restart your AI client to connect to the MCP server"
