#!/bin/bash

# Local Supabase Setup Script
# This script sets up a local Supabase instance with Docker

set -e

echo "🚀 Setting up Local Supabase Instance for Scout Databank"
echo "========================================================"

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker/Colima first."
    exit 1
fi

print_status "Docker is running"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI not found. Installing..."
    
    # Install Supabase CLI
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    elif command -v npm &> /dev/null; then
        npm install -g supabase
    else
        print_error "Please install Supabase CLI manually: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    
    print_status "Supabase CLI installed"
fi

print_status "Supabase CLI found"

# Stop any existing Supabase instance
print_info "Stopping any existing Supabase instance..."
supabase stop || true

# Copy environment variables
if [ ! -f ".env.local" ]; then
    print_info "Creating .env.local from example..."
    cp .env.local.example .env.local
    print_status ".env.local created"
else
    print_info ".env.local already exists"
fi

# Initialize Supabase project if needed
if [ ! -f "supabase/config.toml" ]; then
    print_info "Initializing Supabase project..."
    supabase init
    print_status "Supabase project initialized"
fi

# Start local Supabase
print_info "Starting local Supabase instance..."
supabase start

print_status "Local Supabase instance started"

# Apply migrations
print_info "Applying database migrations..."
if [ -f "supabase/migrations/20250719_consumer_analytics_schema.sql" ]; then
    supabase db push
    print_status "Migrations applied"
else
    print_warning "No migrations found. Creating sample migration..."
    supabase migration new consumer_analytics_schema
    print_info "Please add your schema to the new migration file and run: supabase db push"
fi

# Seed database
print_info "Seeding database with sample data..."
if [ -f "supabase/seed.sql" ]; then
    supabase db seed
    print_status "Database seeded"
else
    print_warning "No seed file found. Creating sample seed file..."
    touch supabase/seed.sql
    print_info "Please add your seed data to supabase/seed.sql and run: supabase db seed"
fi

# Generate TypeScript types
print_info "Generating TypeScript types..."
supabase gen types typescript --local > lib/supabase-types.ts
print_status "TypeScript types generated"

echo ""
echo "🎉 Local Supabase Setup Complete!"
echo ""
echo "Your local Supabase instance is running at:"
echo "  📊 Studio (Dashboard): http://localhost:54323"
echo "  🔗 API URL: http://localhost:54321"
echo "  🗄️ Database: postgresql://postgres:postgres@localhost:54322/postgres"
echo ""
echo "Environment variables have been set in .env.local"
echo ""
echo "Next steps:"
echo "1. Check the Studio dashboard: http://localhost:54323"
echo "2. Start your Next.js app: npm run dev"
echo "3. Your app will connect to the local Supabase instance"
echo ""
echo "Useful commands:"
echo "  supabase status    - Check service status"
echo "  supabase stop      - Stop all services"
echo "  supabase start     - Start all services"
echo "  supabase db reset  - Reset database"
echo ""
echo "🛠️  To stop the local instance: supabase stop"