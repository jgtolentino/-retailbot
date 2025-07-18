# Apply Master Toggle Agent Migration

The migration file has been created at:
`supabase/migrations/20250719005326_master_toggle_agent_setup.sql`

## Option 1: Supabase Dashboard (Easiest)

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql/new)
2. The migration file is already in your project at:
   `supabase/migrations/20250719005326_master_toggle_agent_setup.sql`
3. Copy its contents and run in the SQL editor

## Option 2: Using Supabase CLI (When Network Works)

```bash
# If you have IPv4 connectivity
supabase db push

# Or with explicit connection
supabase db push --db-url "postgresql://postgres:[password]@db.cxzllzyxwpyptfretryc.supabase.co:5432/postgres"
```

## Option 3: Alternative Connection

If you're having IPv6 issues, try:
```bash
# Force IPv4
export SUPABASE_DB_URL="postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.cxzllzyxwpyptfretryc.supabase.co:5432/postgres?sslmode=require"
supabase db push
```

## What This Migration Does

✅ Creates `agent_repository` schema with:
- `agents` table - Registry of all agents
- `tasks` table - Task tracking
- `knowledge` table - Shared knowledge
- `interactions` table - Agent communication

✅ Creates `master_data` schema with:
- `master_regions` - Geographic regions
- `master_brands` - Product brands  
- `master_categories` - Product categories
- `master_payment_methods` - Payment types

✅ Registers initial agents:
- master-toggle-agent
- lyra-agent
- pulser-agent

## After Migration is Applied

Start the Master Toggle Agent:
```bash
./scripts/start-master-toggle-mcp.sh
```

The agent will then:
- Connect to the database
- Register itself
- Start monitoring for filter changes
- Collaborate with other agents