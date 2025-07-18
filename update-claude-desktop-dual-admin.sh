#!/bin/bash
# Update Claude Desktop with dual admin configuration

echo "🚀 Updating Claude Desktop with DUAL ADMIN ACCESS..."

# Create updated Claude Desktop config with both projects
cat > "$HOME/Library/Application Support/Claude/claude_desktop_config.json" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["/Users/tbwa/Library/Application Support/Claude/Claude Extensions/ant.dir.ant.anthropic.filesystem.disabled/server/index.js"],
      "env": {}
    },
    "supabase_primary": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=cxzllzyxwpyptfretryc"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM3NjE4MCwiZXhwIjoyMDY3OTUyMTgwfQ.bHZu_tPiiFVM7fZksLA1lIvflwKENz1t2jowGkx23QI"
      }
    },
    "supabase_alternate": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=texxwmlroefdisgxpszc"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleHh3bWxyb2VmZGlzZ3hwc3pjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg0MDcyNCwiZXhwIjoyMDY4NDE2NzI0fQ.rPkW7VgW42GCaz9cfxvhyDo_1ySHBiyxnjfiycJXptc"
      }
    }
  }
}
EOF

echo "✅ Claude Desktop configured with:"
echo "   - Primary project (Scout Dashboard) - ADMIN ACCESS"
echo "   - Alternate project (Agent Registry) - ADMIN ACCESS"
echo ""
echo "⚠️  RESTART Claude Desktop to activate the new configuration!"
echo ""
echo "After restart, you can use:"
echo "   mcp__supabase_primary__execute_sql"
echo "   mcp__supabase_alternate__execute_sql"
echo ""
echo "With FULL ADMIN PRIVILEGES on both projects!"