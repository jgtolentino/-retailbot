# Deploy to Supabase Cloud - Quick Guide

## Your Project Details
- **Project:** tbwa-databank
- **Reference:** cxzllzyxwpyptfretryc
- **Dashboard:** https://app.supabase.com/project/cxzllzyxwpyptfretryc

## Step 1: Apply the Migration

1. Go to your [Supabase SQL Editor](https://app.supabase.com/project/cxzllzyxwpyptfretryc/sql/new)

2. Copy and paste the contents of `supabase/migrations/20250117_websocket_fix_and_normalization.sql`

3. Click **Run** to execute

This will:
- ✅ Fix WebSocket 404 errors immediately
- ✅ Create normalized tables (optional but recommended)
- ✅ Enable real-time on all tables
- ✅ Set up indexes for performance

## Step 2: Verify Success

Run this query to confirm:
```sql
SELECT 
    tablename 
FROM 
    pg_publication_tables 
WHERE 
    pubname = 'supabase_realtime';
```

You should see `transactions` (and optionally the new normalized tables).

## Step 3: (Optional) Migrate Existing Data

If you want to move your existing data to the normalized schema:

```sql
SELECT migrate_transactions_to_normalized();
```

## What This Fixes

1. **WebSocket 404 Errors** - Realtime is now enabled on your tables
2. **Performance** - Normalized schema with proper indexes
3. **Scalability** - Better structure for growing data
4. **Real-time Updates** - All tables support live updates

## Next Steps

Your app should now connect without WebSocket errors. The changes are backward compatible - your existing queries will continue to work.