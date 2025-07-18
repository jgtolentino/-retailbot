#!/bin/bash

echo "🚀 Applying Supabase Schema Fixes"
echo "================================="

# Supabase connection details
SUPABASE_DB_URL="postgresql://postgres.cxzllzyxwpyptfretryc:$SUPABASE_SERVICE_ROLE_KEY@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Check if we have psql
if command -v psql &> /dev/null; then
    echo "✅ Using psql to apply fixes..."
    
    # Apply the SQL fix script
    psql "$SUPABASE_DB_URL" -f SUPABASE_FIX.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Schema fixes applied successfully!"
    else
        echo "❌ Error applying schema fixes"
        exit 1
    fi
else
    echo "❌ psql not found. Please install PostgreSQL client tools."
    echo ""
    echo "Alternative: Copy SUPABASE_FIX.sql contents to Supabase SQL Editor"
    exit 1
fi

echo ""
echo "✅ Fix complete! Your production dashboard should now work:"
echo "   https://scout-databank-clone-4gi581czs-scout-db.vercel.app"
echo ""
echo "🔍 Verify by checking:"
echo "   - No more 404 errors on API calls"
echo "   - WebSocket connects successfully"
echo "   - Data loads in all modules"