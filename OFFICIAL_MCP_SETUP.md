# 🔧 Official Supabase MCP Setup Guide

## ❌ Current Status: NOT ACTIVE

The official Supabase MCP server is **NOT currently connected** despite having configuration files.

## 📊 What's Missing

### Expected Supabase MCP Tools:
- `execute_sql` - Execute raw SQL queries
- `apply_migration` - Apply database migrations  
- `list_tables` - List all database tables
- `list_extensions` - List database extensions
- `get_project_url` - Get project URL
- `get_anon_key` - Get anonymous key
- `create_branch` - Create development branches
- `search_docs` - Search Supabase documentation
- `list_projects` - List all projects

### Current Available Tools:
- ✅ Filesystem operations
- ✅ Web search/fetch
- ✅ Google Drive/Gmail
- ✅ Calendar operations  
- ✅ JavaScript execution
- ✅ Artifact creation
- ❌ **NO Supabase MCP tools**

## 🛠️ Setup Official Supabase MCP

### For Claude Desktop:

1. **Open Claude Desktop Settings**
   - Go to Settings → Developer → Edit Config

2. **Add Supabase MCP Configuration**
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--read-only",
           "--project-ref=cxzllzyxwpyptfretryc"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**
   - Close and reopen Claude Desktop completely
   - Look for green "active" status in MCP settings

### For Cursor:

1. **Create MCP Configuration**
   ```bash
   mkdir -p .cursor
   cp claude-mcp-config.json .cursor/mcp.json
   ```

2. **Restart Cursor**
   - Close and reopen Cursor
   - Check Settings → MCP for green status

### For VS Code (Cline):

1. **Install Cline Extension**
   
2. **Configure MCP Server**
   - Open Cline MCP settings
   - Add Supabase server configuration
   - Use same JSON config as above

## 🔍 Verification Steps

After setup, you should see these tools available:

### Database Operations:
- `execute_sql(sql: string)` - Run SQL queries
- `apply_migration(migration: string)` - Apply schema changes
- `list_tables(schema?: string)` - List database tables

### Project Management:
- `get_project_url()` - Get project dashboard URL
- `get_anon_key()` - Get anonymous API key
- `list_projects()` - List all Supabase projects

### Documentation:
- `search_docs(query: string)` - Search Supabase docs

## 🚀 Test MCP Connection

Once connected, try these commands:

```
1. List all tables in the database
2. Execute: SELECT * FROM transactions LIMIT 5;
3. Get project URL and anon key
4. Search docs for "row level security"
```

## ⚠️ Current Workaround

Since official MCP is not active, use manual execution:

```bash
# Execute schema fix directly
chmod +x execute-with-token.sh && ./execute-with-token.sh

# Or use Supabase SQL Editor
# Copy CORRECTED_SCHEMA_FIX.sql to:
# https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql
```

## 📝 Configuration Files

✅ **Updated configurations:**
- `claude-mcp-config.json` - For Claude Desktop
- `mcp-config.json` - Template version
- `.env.local` - Environment variables

## 🎯 Next Steps

1. **Enable MCP in your AI client** (Claude Desktop/Cursor/VS Code)
2. **Restart the application** completely
3. **Verify green MCP status** indicator
4. **Test with simple commands** like "list tables"
5. **Execute schema fix** via MCP tools

---

**Once official MCP is active, you'll have direct database access through natural language commands!**
