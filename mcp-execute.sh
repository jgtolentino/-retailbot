#!/bin/bash
# MCP Supabase Fix Execution Script

echo "🚀 Scout Databank MCP Supabase Fix"
echo "=================================="

# Set environment variables
export SUPABASE_URL="https://cxzllzyxwpyptfretryc.supabase.co"
export SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$SUPABASE_SERVICE_KEY}"

# Check if MCP CLI is available
if command -v mcp &> /dev/null; then
    echo "✅ MCP CLI detected"
    
    # Execute the orchestration
    mcp run mcp-supabase-fix.yaml \
        --env SUPABASE_URL="$SUPABASE_URL" \
        --env SUPABASE_KEY="$SUPABASE_SERVICE_KEY" \
        --log-level info \
        --output json
else
    echo "⚠️  MCP CLI not found, using direct execution"
    
    # Fallback to direct psql execution
    psql "$SUPABASE_URL" -f SUPABASE_FIX.sql
fi

echo ""
echo "✅ Fix complete! Check your production dashboard:"
echo "   https://scout-databank-clone-4gi581czs-scout-db.vercel.app"