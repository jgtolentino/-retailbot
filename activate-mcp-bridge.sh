#!/bin/bash

echo "🔄 MCP Supabase Bridge Activation Script"
echo "========================================"

# Configuration variables
PROJECT_REF="cxzllzyxwpyptfretryc"
ACCESS_TOKEN="sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64"
PROXY_URL="https://mcp-supabase-clean.onrender.com"

echo "📊 Configuration:"
echo "- Project: $PROJECT_REF"
echo "- Token: ${ACCESS_TOKEN:0:15}..."
echo "- Proxy: $PROXY_URL"

# Test Supabase API endpoint
echo ""
echo "🧪 Testing Supabase API endpoint..."
SUPABASE_API="https://${PROJECT_REF}.supabase.co/rest/v1/?apikey=${ACCESS_TOKEN}"

if curl -s --connect-timeout 10 "$SUPABASE_API" > /dev/null 2>&1; then
    echo "✅ Supabase API: ACCESSIBLE"
else
    echo "❌ Supabase API: FAILED"
fi

# Test MCP Proxy endpoint
echo ""
echo "🔗 Testing MCP Proxy endpoint..."
if curl -s --connect-timeout 10 "$PROXY_URL" > /dev/null 2>&1; then
    echo "✅ MCP Proxy: ACCESSIBLE"
else
    echo "❌ MCP Proxy: FAILED"
fi

# Generate Claude Desktop MCP config
echo ""
echo "📝 Generating Claude Desktop MCP configurations..."

# Custom format config
cat > .claude-mcp-config.json << EOF
{
  "type": "supabase",
  "projectRef": "$PROJECT_REF",
  "accessToken": "$ACCESS_TOKEN",
  "proxyUrl": "$PROXY_URL",
  "readOnly": false
}
EOF

# Standard MCP format config
cat > claude-desktop-config.json << EOF
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=$PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "$ACCESS_TOKEN"
      }
    }
  }
}
EOF

echo "✅ Configuration files created:"
echo "   - .claude-mcp-config.json (Custom format)"
echo "   - claude-desktop-config.json (Standard MCP format)"

echo ""
echo "🎯 Next Steps:"
echo "1. Open Claude Desktop"
echo "2. Go to Settings → Developer → Edit Config"
echo "3. Paste contents from claude-desktop-config.json"
echo "4. Restart Claude Desktop completely"
echo "5. Test with: 'list tables in my database'"

echo ""
echo "🔍 Manual test command:"
echo "curl -s \"$SUPABASE_API\""

echo ""
echo "🚀 Once MCP is active, you'll have access to:"
echo "   - execute_sql()"
echo "   - apply_migration()"
echo "   - list_tables()"
echo "   - get_project_url()"
echo "   - create_branch()"
echo "   - And 15+ more Supabase tools!"
