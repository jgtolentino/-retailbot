#!/bin/bash
# Quick Supabase fix execution

echo "🚀 Executing Supabase Schema Fix"
echo "================================"

# Load environment
source .env.local

# Execute fix
psql "postgresql://postgres.cxzllzyxwpyptfretryc:$SUPABASE_SERVICE_ROLE_KEY@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -f SUPABASE_FIX.sql

if [ $? -eq 0 ]; then
    echo "✅ Fix applied successfully!"
    echo "🔍 Check dashboard: https://scout-databank-clone-4gi581czs-scout-db.vercel.app"
else
    echo "❌ Error - use Supabase SQL Editor instead"
    echo "📋 Copy SUPABASE_FIX.sql to SQL Editor"
fi
