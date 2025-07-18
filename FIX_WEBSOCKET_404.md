# 🚨 Fix Supabase WebSocket 404 Errors

## Problem
Your Scout Databank dashboard is showing repeated 404 errors for WebSocket connections:
- `wss://cxzllzyxwpyptfretryc.supabase.co/realtime/v1/websocket?...` → 404 Not Found

## Root Causes
1. **Missing tables** - The required tables don't exist in your Supabase project
2. **Realtime not enabled** - Even if tables exist, Realtime must be explicitly enabled
3. **Client configuration** - The Supabase client needs proper Realtime configuration

## Quick Fix (2 Methods)

### Method 1: Automated Script (Recommended)
```bash
# Run this in your project directory
node scripts/deploy-supabase-fix.js
```

### Method 2: Manual via Supabase Dashboard
1. Go to https://app.supabase.com/project/cxzllzyxwpyptfretryc
2. Navigate to **SQL Editor**
3. Copy the entire contents of `scripts/fix-supabase-realtime.sql`
4. Paste and click **Run**

## What This Fixes

### 1. Creates All Required Tables
- `consumer_profiles` - User demographic data
- `consumer_behavior` - User behavior tracking
- `consumer_preferences` - User preference data
- `product_mix` - Product catalog
- `transactions` - Purchase history

### 2. Enables Realtime on All Tables
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_behavior;
-- etc for all tables
```

### 3. Sets Up Proper Security
- Row Level Security (RLS) enabled
- Read policies for anonymous users
- Proper indexes for performance

### 4. Updates Supabase Client
The `lib/supabaseClient.ts` has been updated with proper Realtime configuration:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
```

## Verification Steps

After running the fix:

1. **Restart your Next.js server**
   ```bash
   npm run dev
   ```

2. **Check browser console**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Filter by "WS" (WebSocket)
   - You should see successful WebSocket connections (101 status)

3. **Test Realtime updates**
   ```javascript
   // In browser console
   const channel = supabase.channel('test')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'consumer_profiles' }, 
       payload => console.log('Change:', payload)
     )
     .subscribe()
   ```

## If Issues Persist

1. **Verify credentials in `.env.local`**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://cxzllzyxwpyptfretryc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   ```

2. **Check Supabase Dashboard**
   - Go to Settings → API
   - Verify project URL matches
   - Ensure anon key is correct

3. **Enable Realtime manually**
   - Go to Table Editor
   - Click each table
   - Toggle "Enable Realtime" ON

## Expected Result
Once fixed, your dashboard will:
- ✅ No more 404 WebSocket errors
- ✅ Live data updates without page refresh
- ✅ Real-time synchronization across tabs
- ✅ Smooth, responsive user experience

## Need Help?
If you still see 404 errors after following these steps:
1. Check the Supabase project status
2. Verify the project hasn't been paused
3. Ensure you're using the correct project reference