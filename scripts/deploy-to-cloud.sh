#!/bin/bash

# Deploy Local to Cloud Script
# This script deploys your local Supabase instance to the cloud

set -e

echo "🚀 Deploying Local Supabase to Cloud"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we have cloud credentials
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    print_error "SUPABASE_ACCESS_TOKEN not found in environment"
    echo "Please set your Supabase access token:"
    echo "  export SUPABASE_ACCESS_TOKEN=your_token_here"
    echo "  Or add it to your .env.local file"
    exit 1
fi

# Check if we have a project reference
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    print_error "SUPABASE_PROJECT_REF not found in environment"
    echo "Please set your Supabase project reference:"
    echo "  export SUPABASE_PROJECT_REF=your_project_ref_here"
    echo "  Or add it to your .env.local file"
    exit 1
fi

print_status "Environment variables found"

# Check if local instance is running
if ! supabase status > /dev/null 2>&1; then
    print_error "Local Supabase instance is not running"
    echo "Please start it first: npm run local:start"
    exit 1
fi

print_status "Local Supabase instance is running"

# Generate migration from local database
print_info "Generating migration from local database..."
supabase db diff --use-migra -f cloud_deployment_$(date +%Y%m%d_%H%M%S)

# Link to cloud project
print_info "Linking to cloud project..."
supabase link --project-ref "$SUPABASE_PROJECT_REF"

# Push migrations to cloud
print_info "Pushing migrations to cloud..."
supabase db push

# Generate cloud types
print_info "Generating TypeScript types from cloud..."
supabase gen types typescript > lib/supabase-cloud-types.ts

# Update environment variables for cloud
print_info "Creating cloud environment variables..."
cat > .env.cloud << EOF
# Cloud Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://$SUPABASE_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=cloud

EOF

print_status "Cloud environment variables created in .env.cloud"

# Test cloud connection
print_info "Testing cloud connection..."
if supabase projects list > /dev/null 2>&1; then
    print_status "Cloud connection successful"
else
    print_warning "Cloud connection test failed - please check manually"
fi

echo ""
echo "🎉 Deployment to Cloud Complete!"
echo ""
echo "Your local database has been deployed to:"
echo "  🌍 Cloud URL: https://$SUPABASE_PROJECT_REF.supabase.co"
echo "  📊 Dashboard: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with cloud credentials from .env.cloud"
echo "2. Get your anon key and service role key from the Supabase dashboard"
echo "3. Update your production environment variables"
echo "4. Deploy your Next.js app to production"
echo ""
echo "Files created:"
echo "  - .env.cloud (cloud environment variables)"
echo "  - lib/supabase-cloud-types.ts (cloud TypeScript types)"
echo "  - New migration file with your schema"
echo ""
echo "🛠️  To switch back to local: npm run local:start"