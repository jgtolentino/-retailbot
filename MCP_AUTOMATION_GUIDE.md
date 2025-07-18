# 🤖 MCP Full Automation Guide - No Manual Steps

## Overview

This setup completely automates Supabase schema repairs without ANY manual dashboard interaction.

## 🚀 One-Line Execution

```bash
:clodrep supabase.mcp("apply_fixes", script="SUPABASE_FIX.sql", log_tag="live-data-repair", dry_run=False)
```

## 📁 Automation Structure

```
scout-databank-clone/
├── mcp_tasks/
│   └── supabase_repair.yaml    # MCP task definition
├── scripts/
│   └── apply_supabase_fix.sh   # CLI wrapper
├── mcp_logs/                    # Audit trail
│   └── .gitkeep
└── SUPABASE_FIX.sql            # SQL commands
```

## ✅ What Gets Automated

1. **Schema Creation**
   - All 7 tables created with proper types
   - Idempotent (safe to run multiple times)

2. **Security Setup**
   - Row Level Security enabled
   - Anon role policies created
   - No manual policy configuration

3. **Realtime Configuration**
   - Publication created/updated
   - All tables added to realtime
   - WebSocket support enabled

4. **Data Seeding**
   - Sample data inserted (if tables empty)
   - Configurable via `INSERT_SAMPLE_DATA` flag

5. **Verification**
   - Automatic validation of setup
   - Detailed audit logging
   - Success/failure notifications

## 🛡️ Safety Features

- **Pre-flight Checks**: Verifies schema before changes
- **Idempotent Operations**: Safe to run multiple times
- **Dry Run Mode**: Test without making changes
- **Rollback Support**: Can undo changes if needed
- **Audit Trail**: Complete log of all operations

## 🔧 Configuration Options

### Environment Variables
```bash
export SUPABASE_URL="https://cxzllzyxwpyptfretryc.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"
export MCP_WEBHOOK_URL="https://your-webhook.com/alerts"
export INSERT_SAMPLE_DATA=true
export DRY_RUN=false
```

### Dry Run Test
```bash
DRY_RUN=true ./scripts/apply_supabase_fix.sh
```

### Full Execution
```bash
./scripts/apply_supabase_fix.sh
```

## 📊 Monitoring

### Check Logs
```bash
cat mcp_logs/supabase_patches/live-data-repair-*.log
```

### Verify in Database
```sql
-- Run this query to verify all fixes applied
SELECT * FROM mcp_audit_log 
WHERE task_name = 'supabase-repair' 
ORDER BY created_at DESC;
```

## 🚨 Troubleshooting

### If MCP CLI Not Available
The script automatically falls back to:
1. Direct SQL execution via psql
2. Supabase CLI commands
3. Environment-based execution

### Force Re-run
```bash
# Force re-application of all fixes
MCP_FORCE=true ./scripts/apply_supabase_fix.sh
```

## ✅ Success Indicators

After running, verify:
- ✅ No 404 errors at https://scout-databank-clone-4gi581czs-scout-db.vercel.app
- ✅ WebSocket connections established
- ✅ All 4 dashboard modules show data
- ✅ Logs show successful completion

## 🎯 Result

**Zero manual steps required!** The entire Supabase configuration is handled automatically through MCP orchestration.

---

### Quick Reference

| Command | Purpose |
|---------|---------|
| `:clodrep supabase.mcp("apply_fixes", ...)` | Full automated fix |
| `DRY_RUN=true ./scripts/apply_supabase_fix.sh` | Test without changes |
| `./scripts/apply_supabase_fix.sh` | Execute fixes |
| `cat mcp_logs/*.log` | Check execution logs |