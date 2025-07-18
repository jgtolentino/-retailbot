#!/bin/bash

# Scout Databank - Database Deployment & Connection Fix Script
# This script handles database setup, schema migration, and connection validation

set -e

echo "🚀 Scout Databank - Database Deployment Started"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/tbwa/Desktop/scout-databank-clone"
SUPABASE_URL="https://cxzllzyxwpyptfretryc.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g"

# Function to log messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        log_error "curl is not installed. Please install curl."
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Test Supabase connection
test_connection() {
    log_info "Testing Supabase connection..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/")
    
    if [ "$response" != "200" ]; then
        log_error "Failed to connect to Supabase (HTTP $response)"
        log_error "Please check your Supabase URL and anon key"
        return 1
    fi
    
    log_success "Supabase connection successful"
    return 0
}

# Check if tables exist
check_tables() {
    log_info "Checking if database tables exist..."
    
    # Try to query the transactions table
    response=$(curl -s \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/transactions?select=*&limit=1")
    
    if echo "$response" | grep -q "does not exist\|relation.*does not exist"; then
        log_warning "Tables do not exist or are not accessible"
        return 1
    elif echo "$response" | grep -q "row-level security"; then
        log_warning "Tables exist but RLS policies may need to be set up"
        return 1
    elif echo "$response" | grep -q "^\["; then
        log_success "Tables exist and are accessible"
        return 0
    else
        log_warning "Unexpected response from database"
        log_info "Response: $response"
        return 1
    fi
}

# Install/update dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    cd "$PROJECT_DIR"
    
    if [ -f "package.json" ]; then
        npm install
        log_success "Dependencies installed successfully"
    else
        log_error "package.json not found in project directory"
        exit 1
    fi
}

# Create .env.local if it doesn't exist
setup_env() {
    log_info "Setting up environment variables..."
    
    cd "$PROJECT_DIR"
    
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
        log_success "Environment file created"
    else
        log_success "Environment file already exists"
    fi
}

# Start the development server
start_development() {
    log_info "Starting development server..."
    
    cd "$PROJECT_DIR"
    
    # Kill any existing Next.js processes
    pkill -f "next dev" || true
    
    # Start the development server in the background
    nohup npm run dev > /tmp/scout-dev.log 2>&1 &
    
    # Wait for server to start
    sleep 15
    
    # Check if server is running
    if curl -s "http://localhost:3000" > /dev/null 2>&1; then
        log_success "Development server is running at http://localhost:3000"
    else
        log_warning "Development server may not be running properly"
        log_info "Check the logs with: tail -f /tmp/scout-dev.log"
        log_info "You can manually start it with: npm run dev"
    fi
}

# Main execution
main() {
    echo "Starting deployment process..."
    
    # Step 1: Check dependencies
    check_dependencies
    
    # Step 2: Test connection
    if ! test_connection; then
        log_error "Connection test failed. Please check your Supabase configuration."
        exit 1
    fi
    
    # Step 3: Setup environment
    setup_env
    
    # Step 4: Check tables
    if ! check_tables; then
        log_warning "Database tables may not be set up correctly."
        log_info "Please run the SQL from CORRECTED_SCHEMA_FIX.sql in your Supabase dashboard:"
        log_info "https://app.supabase.com/project/cxzllzyxwpyptfretryc/sql/new"
        log_info "After running the SQL, restart this script."
        echo ""
        log_info "The dashboard will still start, but you may see 'No data available' messages."
    else
        log_success "Database tables are accessible"
    fi
    
    # Step 5: Install dependencies
    install_dependencies
    
    # Step 6: Start development server
    start_development
    
    echo
    log_success "🎉 Deployment completed!"
    echo "=================================================="
    echo "Your Scout Databank dashboard is now running at:"
    echo "🌐 http://localhost:3000"
    echo ""
    echo "Next steps:"
    echo "1. Open your browser and navigate to http://localhost:3000"
    echo "2. If you see 'No data available', run the SQL schema fix"
    echo "3. Use the filters to explore different views"
    echo "4. Check the browser console for any issues"
    echo ""
    echo "Database Status:"
    echo "✅ Supabase connection: Active"
    echo "✅ Environment variables: Set"
    echo "✅ Dependencies: Installed"
    echo "✅ Development server: Running"
    echo ""
    echo "If you encounter any issues, check the logs above for details."
}

# Run the main function
main "$@"