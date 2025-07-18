#!/bin/bash
# Sync Local Supabase to Cloud - Scout Databank
# Direct, safe, and repeatable Supabase local-to-cloud sync

set -e

# Configuration with actual values
CLOUD_PROJECT_REF="cxzllzyxwpyptfretryc"
LOCAL_DB_PORT="54322"
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g"
CLOUD_DB_HOST="db.cxzllzyxwpyptfretryc.supabase.co"

echo "🚀 Scout Databank - Supabase Local to Cloud Sync"
echo "================================================"
echo ""

# 1. Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# 2. Login to Supabase (using token)
echo "📝 Logging into Supabase..."
supabase login --token "$ACCESS_TOKEN"

# 3. Link to cloud project
echo "🔗 Linking to cloud project: $CLOUD_PROJECT_REF"
supabase link --project-ref "$CLOUD_PROJECT_REF"

# 4. Check for local migrations
echo "📋 Checking for migrations..."
if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations)" ]; then
    echo "✅ Found migrations to push"
else
    echo "⚠️  No migrations found. Creating migration from current state..."
    supabase db diff --local > supabase/migrations/$(date +%Y%m%d%H%M%S)_sync_changes.sql
fi

# 5. Push schema migrations to cloud
echo "⬆️  Pushing schema to cloud..."
supabase db push

# 6. Optional: Export local data
echo ""
echo "💾 Data Export Options:"
echo "======================"
read -p "Do you want to export local data? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Exporting local data..."
    pg_dump --data-only --inserts -h localhost -p $LOCAL_DB_PORT -U postgres -d postgres > seed_$(date +%Y%m%d_%H%M%S).sql
    echo "✅ Data exported to: seed_$(date +%Y%m%d_%H%M%S).sql"
    
    echo ""
    echo "⚠️  WARNING: Importing data to cloud will OVERWRITE existing data!"
    read -p "Import this data to cloud? (DANGEROUS!) (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔴 IMPORTING DATA TO CLOUD..."
        psql -h $CLOUD_DB_HOST -U postgres -d postgres -f seed_$(date +%Y%m%d_%H%M%S).sql
        echo "✅ Data imported to cloud"
    else
        echo "⏭️  Skipped data import"
    fi
fi

echo ""
echo "✅ Sync Complete!"
echo ""
echo "📊 Summary:"
echo "- Project: $CLOUD_PROJECT_REF"
echo "- Schema: Pushed to cloud"
echo "- Data: Check seed_*.sql files for exports"
echo ""
echo "🔗 View your project at: https://app.supabase.com/project/$CLOUD_PROJECT_REF"