#!/bin/bash

# Quick deployment script for Consumer Analytics Database
# This script will deploy the entire consumer analytics schema

echo "🚀 Consumer Analytics Database Quick Deploy"
echo "=========================================="

# Make sure we're in the right directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js and npm first."
    exit 1
fi

# Check if the project has the necessary scripts
if ! grep -q "analytics:deploy" package.json; then
    echo "❌ Analytics deployment script not found in package.json"
    echo "Please ensure the package.json has been updated with the new scripts."
    exit 1
fi

echo "🔧 Installing dependencies..."
npm install

echo "📦 Deploying Consumer Analytics Database..."
npm run analytics:deploy

echo "✅ Deployment complete! Your database is ready."
echo ""
echo "Next steps:"
echo "1. Start your dev server: npm run dev"
echo "2. Check your application - no more 404 errors!"
echo "3. Review the generated data services in lib/consumer-analytics-service.ts"
echo ""
echo "For more information, see CONSUMER_ANALYTICS_SETUP.md"