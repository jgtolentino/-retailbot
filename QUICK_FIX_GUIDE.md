# 🚨 QUICK FIX: Supabase Live Data Issues

## The Problem
Your production app at https://scout-databank-clone-4gi581czs-scout-db.vercel.app is getting:
- ❌ 404 errors on table queries 
- ❌ WebSocket connection failures

## The Solution (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project `cxzllzyxwpyptfretryc`
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Copy ALL contents from `SUPABASE_FIX.sql`
2. Paste into the SQL Editor
3. Click **Run** button

### Step 3: Verify It Worked
1. Refresh your production app
2. Check Network tab - should see 200 OK responses
3. Data should load in all 4 dashboard modules

## What This Fixes
- ✅ Creates missing tables
- ✅ Enables Row Level Security
- ✅ Adds anon role permissions
- ✅ Enables Realtime WebSockets
- ✅ Inserts sample data

## Alternative: Command Line
If you prefer CLI:
```bash
# Set your service role key
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run with psql
psql "postgresql://postgres.cxzllzyxwpyptfretryc:$SUPABASE_SERVICE_ROLE_KEY@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -f SUPABASE_FIX.sql
```

## Success Indicators
- Network tab shows 200 OK for `/rest/v1/` endpoints
- WebSocket shows "101 Switching Protocols"
- All 4 dashboard modules display data
- No console errors

---

**Need help?** The fix script is idempotent - safe to run multiple times.