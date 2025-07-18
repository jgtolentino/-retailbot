#!/bin/bash

# Test script to verify Consumer Analytics Database deployment
# This script runs a comprehensive test of the entire setup

echo "🧪 Consumer Analytics Database Test Suite"
echo "=========================================="

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

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_status "$test_name passed"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "$test_name failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run from the project root."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
fi

# Check environment variables
if [ ! -f ".env.local" ]; then
    print_error ".env.local not found. Please create it with your Supabase credentials."
    exit 1
fi

# Load environment variables
set -a
source .env.local
set +a

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    print_error "Missing required environment variables in .env.local"
    echo "Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

print_status "Prerequisites check passed"

# Test 1: Check if migration files exist
run_test "Migration files exist" "[ -f 'supabase/migrations/20250719_consumer_analytics_schema.sql' ]"

# Test 2: Check if TypeScript types exist
run_test "TypeScript types exist" "[ -f 'lib/consumer-analytics-types.ts' ]"

# Test 3: Check if data service exists
run_test "Data service exists" "[ -f 'lib/consumer-analytics-service.ts' ]"

# Test 4: Check if scripts exist
run_test "Deployment script exists" "[ -f 'scripts/deploy-consumer-analytics.sh' ]"
run_test "Validation script exists" "[ -f 'scripts/validate-database.js' ]"

# Test 5: Check if package.json has new scripts
run_test "Package.json has analytics scripts" "grep -q 'analytics:deploy' package.json"

# Test 6: Check if documentation exists
run_test "Setup documentation exists" "[ -f 'CONSUMER_ANALYTICS_SETUP.md' ]"

# Test 7: TypeScript compilation
if command -v tsc &> /dev/null; then
    run_test "TypeScript compilation" "npx tsc --noEmit"
else
    print_warning "TypeScript not available, skipping compilation test"
fi

# Test 8: Run database validation
if [ -f "scripts/validate-database.js" ]; then
    echo -e "\n${BLUE}Running database validation...${NC}"
    if node scripts/validate-database.js; then
        print_status "Database validation passed"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_error "Database validation failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

# Test 9: Check for potential issues
echo -e "\n${BLUE}Checking for potential issues...${NC}"

# Check for common issues
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI not installed - some features may not work"
fi

if [ ! -f "supabase/config.toml" ]; then
    print_warning "Supabase project not initialized - run 'supabase init' if needed"
fi

# Test 10: Lint check (if available)
if grep -q "\"lint\"" package.json; then
    run_test "Lint check" "npm run lint"
fi

# Summary
echo -e "\n${'='*60}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${'='*60}"
echo "Total tests: $TOTAL_TESTS"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Your Consumer Analytics Database is ready.${NC}"
    echo -e "\nNext steps:"
    echo "1. Start your dev server: npm run dev"
    echo "2. Visit http://localhost:3000 to see your dashboard"
    echo "3. Check the browser console - should be no 404 errors"
    echo "4. Review the sample data in your dashboard"
    
    echo -e "\n${BLUE}📊 Your database includes:${NC}"
    echo "• Consumer profiles"
    echo "• Transaction data"
    echo "• Consumer behavior tracking"
    echo "• Product mix analytics"
    echo "• Suggestion acceptance data"
    echo "• Real-time subscriptions"
    echo "• TypeScript types"
    echo "• Data service layer"
    
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the output above.${NC}"
    
    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "\n${YELLOW}Common solutions:${NC}"
        echo "• Run 'npm run analytics:deploy' to deploy the database"
        echo "• Check your .env.local file for correct Supabase credentials"
        echo "• Ensure you have proper network access to Supabase"
        echo "• Review the setup documentation: CONSUMER_ANALYTICS_SETUP.md"
    fi
    
    exit 1
fi