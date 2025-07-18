#!/bin/bash

echo "🚀 Quick Fix for 404 Errors"
echo ""
echo "Opening Supabase SQL Editor..."
echo ""

# Open the SQL editor
open "https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql"

echo "📋 Instructions:"
echo ""
echo "1. The SQL editor is now open in your browser"
echo "2. Copy ALL the SQL from: supabase/migrations/20250719_consumer_analytics_schema.sql"
echo "3. Paste it in the SQL editor"
echo "4. Click 'Run' to execute"
echo ""
echo "This will create all missing tables and fix the 404 errors!"
echo ""
echo "After running the SQL, start your app with: npm run dev"
echo ""

# Also copy the migration to clipboard for convenience
if command -v pbcopy &> /dev/null; then
    cat supabase/migrations/20250719_consumer_analytics_schema.sql | pbcopy
    echo "✅ Migration SQL has been copied to your clipboard!"
    echo "   Just paste it in the SQL editor and click Run."
fi