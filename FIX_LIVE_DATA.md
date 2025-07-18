# 🚨 Fix Production Live Data Issues

## Quick Fix Steps

### 1️⃣ Run the SQL Fix Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `SUPABASE_FIX.sql`
4. Paste and click **Run**

This will:
- ✅ Create all 7 required tables
- ✅ Enable Row Level Security (RLS)
- ✅ Add read policies for `anon` role
- ✅ Enable Realtime on all tables
- ✅ Insert sample data

### 2️⃣ Alternative: Use Supabase UI

If you prefer the UI approach:

#### Enable Realtime:
1. Go to **Database** → **Replication**
2. Find each table and toggle **Realtime** ON

#### Enable RLS:
1. Go to **Authentication** → **Policies**
2. For each table:
   - Click **Enable RLS**
   - Add Policy → **For full access** → **Review** → **Save**

### 3️⃣ Verify in Production

After running the fixes, your production app should:
- ✅ Load data without 404 errors
- ✅ Connect to WebSocket successfully
- ✅ Show real-time updates

## 🔍 Debugging Commands

Run these in SQL Editor to verify:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check realtime status
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

## 🚀 Quick Test

Visit your production URL and check:
- Network tab should show 200 OK for REST queries
- WebSocket should show "101 Switching Protocols"
- Data should load in all 4 dashboard modules

---

**Need help?** The issue is that your Supabase tables either don't exist or don't have proper permissions for the `anon` role that your frontend is using.