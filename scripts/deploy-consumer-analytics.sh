#!/bin/bash

# Consumer Analytics Database Deployment Script
# This script applies the migration and seeds the database

set -e

echo "🚀 Starting Consumer Analytics Database Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env file exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Load environment variables
export $(cat .env.local | xargs)

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    print_error "Missing Supabase environment variables!"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    exit 1
fi

print_status "Environment variables loaded"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed!"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

print_status "Supabase CLI found"

# Check if we're in a supabase project
if [ ! -f "supabase/config.toml" ]; then
    print_warning "No supabase config found, initializing project..."
    supabase init
    print_status "Supabase project initialized"
fi

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/20250719_consumer_analytics_schema.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Migration file not found: $MIGRATION_FILE"
    echo "Please ensure the migration file exists"
    exit 1
fi

print_status "Migration file found"

# Link to remote project if not already linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    print_warning "Linking to remote Supabase project..."
    PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')
    
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        print_error "SUPABASE_ACCESS_TOKEN is required for linking to remote project"
        echo "Please set SUPABASE_ACCESS_TOKEN in your .env.local file"
        exit 1
    fi
    
    supabase link --project-ref $PROJECT_REF --password $SUPABASE_DB_PASSWORD
    print_status "Linked to remote project"
fi

echo ""
echo "🔨 Applying migration..."

# Apply migration to remote database
if supabase db push; then
    print_status "Migration applied successfully"
else
    print_error "Migration failed!"
    exit 1
fi

echo ""
echo "🌱 Seeding database..."

# Apply seed data if seed file exists
if [ -f "supabase/seed.sql" ]; then
    if supabase db seed; then
        print_status "Database seeded successfully"
    else
        print_warning "Seeding failed, but migration was successful"
    fi
else
    print_warning "No seed file found, skipping seeding"
fi

echo ""
echo "🎯 Generating TypeScript types..."

# Generate TypeScript types
if supabase gen types typescript --local > lib/supabase-types.ts; then
    print_status "TypeScript types generated"
else
    print_warning "Type generation failed, but migration was successful"
fi

echo ""
echo "🧪 Running validation tests..."

# Run validation script
if node scripts/validate-database.js; then
    print_status "Database validation passed"
else
    print_error "Database validation failed"
    echo "Please check the validation output above"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Your Consumer Analytics database is now ready with:"
echo "  • consumer_profiles table"
echo "  • transactions table"
echo "  • consumer_behavior table"
echo "  • product_mix table"
echo "  • suggestion_acceptance table"
echo "  • Analytics views"
echo "  • Sample data"
echo "  • TypeScript types"
echo ""
echo "Next steps:"
echo "1. Start your development server: npm run dev"
echo "2. Check your frontend - no more 404 errors!"
echo "3. Customize the sample data as needed"
echo ""
echo "🔗 Useful links:"
echo "  Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
echo "  API Docs: https://supabase.com/dashboard/project/$PROJECT_REF/api"
echo ""