# 🚨 Deploy WebSocket Fix for Scout Databank

## Quick Fix Instructions

Since you already have the Supabase MCP server configured, here are the steps to fix the WebSocket 404 errors:

### Option 1: Direct SQL Execution (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/project/cxzllzyxwpyptfretryc
   - Navigate to **SQL Editor**

2. **Copy and Run SQL**
   - Copy the entire contents of `scripts/fix-supabase-realtime-mcp.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify Success**
   - You should see "Success. No rows returned" 
   - Check Table Editor - you'll see all 7 new tables

### Option 2: Via Terminal (if MCP is configured)

```bash
# Execute the fix
./scripts/execute-mcp-fix.sh
```

## What This Fixes

✅ **Creates 7 Required Tables:**
- `consumer_profiles` - User demographics
- `consumer_behavior` - Behavior tracking
- `consumer_preferences` - User preferences
- `product_mix` - Product catalog
- `transactions` - Purchase history
- `suggestion_acceptance` - AI suggestion tracking
- `ingestion_logs` - Data ingestion logs

✅ **Enables Realtime on All Tables:**
- Fixes the WebSocket 404 errors
- Enables live data updates
- Allows real-time dashboard refresh

✅ **Sets Up Security:**
- Row Level Security enabled
- Anonymous read access configured
- Proper indexes for performance

## Verification

After running the fix:

1. **Restart Next.js**
   ```bash
   npm run dev
   ```

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Network tab → WS
   - You should see active WebSocket connections (101 status)
   - No more 404 errors!

3. **Test Live Updates**
   - Open your dashboard
   - In another tab, go to Supabase Table Editor
   - Add a row to any table
   - See it appear instantly in your dashboard!

## Troubleshooting

If you still see 404 errors:

1. **Clear browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

2. **Check Realtime is enabled**
   - In Supabase Dashboard → Database → Replication
   - Ensure all tables show "Realtime enabled"

3. **Verify environment variables**
   ```bash
   cat .env.local
   ```
   Should show:
   - `NEXT_PUBLIC_SUPABASE_URL=https://cxzllzyxwpyptfretryc.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...`

## Success Indicators

When everything is working:
- ✅ No WebSocket 404 errors in console
- ✅ Dashboard shows "Connected" status
- ✅ Data updates without page refresh
- ✅ Multiple browser tabs stay in sync

## MCP Server Info

Your Supabase MCP server is configured at:
- **URL**: https://cxzllzyxwpyptfretryc.supabase.co
- **Token**: sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64 (stored securely)

The MCP server handles all database operations automatically.