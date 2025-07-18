# 🎯 MCP Supabase Orchestration Guide

## Overview

This MCP orchestration automatically fixes your Supabase live data issues by:
- Creating missing tables
- Enabling Row Level Security (RLS)
- Adding anon role policies
- Enabling Realtime subscriptions
- Inserting sample data

## 🚀 Quick Execution

### Option 1: MCP CLI Command
```bash
:clodrep supabase.mcp("apply_fixes", script="SUPABASE_FIX.sql")
```

### Option 2: Shell Script
```bash
chmod +x mcp-execute.sh
./mcp-execute.sh
```

### Option 3: Direct YAML Execution
```bash
mcp run mcp-supabase-fix.yaml
```

## 📋 Orchestration Tasks

1. **verify-connection** - Test Supabase connectivity
2. **create-tables** - Create all 7 required tables
3. **enable-rls** - Enable Row Level Security
4. **create-policies** - Add anon read policies
5. **enable-realtime** - Configure WebSocket support
6. **insert-sample-data** - Add demo records
7. **verify-setup** - Validate configuration

## 🔧 Configuration

The orchestration uses these environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key (for schema changes)

## 📊 Monitoring

### Check Execution Status
```bash
mcp status supabase-fix-orchestrator
```

### View Logs
```bash
mcp logs mcp_logs.supabase_patches
```

### Audit Trail
```sql
SELECT * FROM mcp_audit_log 
WHERE task_id LIKE 'supabase-fix%' 
ORDER BY created_at DESC;
```

## 🛡️ Error Handling

The orchestration includes:
- **Automatic rollback** on failure
- **3 retry attempts** with 5s delays
- **Webhook notifications** for errors
- **Detailed audit logging**

## ✅ Success Indicators

After execution, verify:
1. No more 404 errors on API calls
2. WebSocket connects successfully
3. Data loads in all dashboard modules
4. Real-time updates work

## 🔍 Troubleshooting

### Manual Verification
```sql
-- Check table status
SELECT table_name, row_security 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public';

-- Check realtime
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### Force Re-run
```bash
mcp run mcp-supabase-fix.yaml --force --skip-cache
```

## 🎉 Result

Your production Scout Databank at:
https://scout-databank-clone-4gi581czs-scout-db.vercel.app

Will now have:
- ✅ Live data connection
- ✅ Real-time updates
- ✅ No authentication errors
- ✅ Full dashboard functionality