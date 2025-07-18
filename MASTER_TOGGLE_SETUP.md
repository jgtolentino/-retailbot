# Master Toggle Agent Setup Summary

## ✅ Configuration Status

### Environment Variables (from .env.local)
- **NEXT_PUBLIC_SUPABASE_URL**: `https://cxzllzyxwpyptfretryc.supabase.co`
- **SUPABASE_SERVICE_ROLE_KEY**: `sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64`
- **Project Ref**: `cxzllzyxwpyptfretryc`

### Files Created
1. **Core Agent Service**: `services/masterToggleAgent.ts`
2. **MCP Integration**: `services/masterToggleAgentMCP.ts`
3. **Configuration**: `config/masterToggleConfig.ts`
4. **API Routes**: `api/routes/masterToggle.ts`
5. **React Hooks**: `hooks/useMasterToggleAgent.ts`
6. **Database Schemas**:
   - `schema/master_data_tables.sql`
   - `schema/agent_repository.sql`

### Scripts Ready
- `scripts/start-master-toggle-mcp.sh` - Start with MCP integration
- `scripts/stop-master-toggle-agent.sh` - Stop the agent

## 📋 Next Steps

### 1. Apply Database Schemas

You need to apply two schemas to your Supabase database:

#### Option A: Using Supabase Dashboard (Easiest)
1. Go to [SQL Editor](https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql/new)
2. Copy and paste contents of:
   - First: `schema/agent_repository.sql`
   - Then: `schema/master_data_tables.sql`
3. Run each one

#### Option B: Using Supabase CLI
```bash
supabase db push --db-url $DATABASE_URL --file schema/agent_repository.sql
supabase db push --db-url $DATABASE_URL --file schema/master_data_tables.sql
```

### 2. Start the Agent

Once schemas are applied:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Start Master Toggle Agent with MCP
./scripts/start-master-toggle-mcp.sh
```

## 🔍 What the Agent Does

1. **Monitors Transaction Data**: Watches for new values in dimensions like region, brand, category
2. **Updates Master Tables**: Automatically populates master_data.* tables
3. **Provides Real-time Updates**: WebSocket server on port 8080 pushes changes to UI
4. **Collaborates with Other Agents**: Registers with Lyra, Pulser, Bruno via agent repository
5. **Maintains Filter Accuracy**: Prunes stale values that no longer exist

## 🚀 Integration Points

### With Your Dashboard
The `DashboardFilters.tsx` component is already updated to use dynamic filters from the Master Toggle Agent.

### With Other Agents
- **Lyra**: Receives schema updates and orchestration requests
- **Pulser**: Provides dimension data for analytics
- **Bruno**: Exposes API endpoints for testing

## 📊 Monitoring

After starting, you can:
- Check health: `curl http://localhost:3000/api/master-toggle/health`
- View logs: `tail -f logs/master-toggle-agent-mcp.log`
- See filter options: `curl http://localhost:3000/api/master-toggle?dimension=region`

## 🎯 Success Indicators

When running correctly, you'll see:
- ✅ Agent registered in ecosystem
- ✅ WebSocket server active on port 8080
- ✅ Real-time filter updates in dashboard
- ✅ Other agents visible in logs
- ✅ Zero stale filter options