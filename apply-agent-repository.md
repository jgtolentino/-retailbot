# Apply Agent Repository Schema

Since the MCP tools aren't available in this session, you need to apply the agent repository schema manually:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to the [Supabase SQL Editor](https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql/new)
2. Copy the contents of `schema/agent_repository.sql`
3. Paste and run in the SQL editor

## Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm i -g supabase

# Login to Supabase
supabase login

# Apply the schema
supabase db push --db-url postgresql://postgres:[your-password]@db.cxzllzyxwpyptfretryc.supabase.co:5432/postgres --file schema/agent_repository.sql
```

## Option 3: Using psql

```bash
psql postgresql://postgres:[your-password]@db.cxzllzyxwpyptfretryc.supabase.co:5432/postgres -f schema/agent_repository.sql
```

## Schema Contents

The agent repository schema includes:
- `agent_repository.agents` - Registry of all agents
- `agent_repository.tasks` - Task execution history
- `agent_repository.knowledge` - Shared knowledge base
- `agent_repository.interactions` - Inter-agent messages
- `agent_repository.verifications` - Task verification logs

Once applied, the Master Toggle Agent will be able to:
- Register itself in the agent ecosystem
- Share knowledge with other agents
- Collaborate with Lyra, Pulser, and Bruno agents