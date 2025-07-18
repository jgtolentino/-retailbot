#!/bin/bash

# Local Development Status Check
# Quick script to check if local Supabase is running and ready

echo "🔍 Local Development Status Check"
echo "================================="

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

# Check Docker
if docker info > /dev/null 2>&1; then
    print_status "Docker is running"
else
    print_error "Docker is not running"
    echo "Please start Docker/Colima first"
    exit 1
fi

# Check Supabase CLI
if command -v supabase &> /dev/null; then
    print_status "Supabase CLI is installed"
else
    print_error "Supabase CLI is not installed"
    echo "Please install it: brew install supabase/tap/supabase"
    exit 1
fi

# Check if local Supabase is running
if supabase status > /dev/null 2>&1; then
    print_status "Local Supabase is running"
    echo ""
    print_info "Service Status:"
    supabase status
else
    print_warning "Local Supabase is not running"
    echo ""
    echo "To start local Supabase:"
    echo "  npm run local:setup   # First time setup"
    echo "  npm run local:start   # Start services"
    echo ""
    exit 1
fi

# Check environment variables
if [ -f ".env.local" ]; then
    print_status ".env.local exists"
    
    # Check if it has the correct local URLs
    if grep -q "localhost:54321" .env.local; then
        print_status "Environment configured for local development"
    else
        print_warning "Environment might not be configured for local development"
        echo "Expected: NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
    fi
else
    print_warning ".env.local not found"
    echo "Please copy .env.local.example to .env.local"
fi

# Check if migrations exist
if [ -f "supabase/migrations/20250719_consumer_analytics_schema.sql" ]; then
    print_status "Consumer analytics migration exists"
else
    print_warning "Consumer analytics migration not found"
    echo "Run npm run analytics:deploy to create the schema"
fi

# Check if tables exist in local database
print_info "Checking database tables..."
if supabase db seed list > /dev/null 2>&1; then
    print_status "Database is accessible"
else
    print_warning "Database connection issues"
fi

# Test API endpoint
print_info "Testing API endpoint..."
if curl -s "http://localhost:54321/rest/v1/" > /dev/null 2>&1; then
    print_status "API endpoint is responsive"
else
    print_warning "API endpoint not responding"
fi

# Check if Next.js is configured correctly
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    print_status "Next.js config exists"
else
    print_warning "Next.js config not found"
fi

echo ""
echo "🎯 Quick Commands:"
echo "  npm run local:studio   # Open Supabase Studio"
echo "  npm run local:status   # Check service status"
echo "  npm run local:reset    # Reset database"
echo "  npm run dev            # Start Next.js dev server"
echo ""

# Final status
local_supabase_running=$(supabase status > /dev/null 2>&1 && echo "true" || echo "false")
env_configured=$([ -f ".env.local" ] && echo "true" || echo "false")
migrations_exist=$([ -f "supabase/migrations/20250719_consumer_analytics_schema.sql" ] && echo "true" || echo "false")

if [ "$local_supabase_running" = "true" ] && [ "$env_configured" = "true" ] && [ "$migrations_exist" = "true" ]; then
    print_status "🎉 Local development environment is ready!"
    echo "You can now run: npm run dev"
else
    print_warning "⚠️  Local development environment needs setup"
    echo "Run: npm run local:setup"
fi