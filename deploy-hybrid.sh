#!/bin/bash

# Deploy Scout RetailBot Hybrid Architecture

set -e

echo "🚀 Deploying Scout RetailBot Hybrid Architecture"
echo "=============================================="

# Configuration
PROJECT_NAME="scout-retailbot"
ENVIRONMENT=${1:-development}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"

# Step 1: Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install
cd api/retailbot && pip install -r requirements.txt && cd ../..

# Step 2: Setup environment variables
echo -e "\n${YELLOW}🔧 Setting up environment...${NC}"
if [ ! -f .env.local ]; then
  cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://cxzllzyxwpyptfretryc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
RETAILBOT_API_URL=http://localhost:8000
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
EOF
  echo "Created .env.local - Please add your API keys"
fi

# Step 3: Start services based on environment
if [ "$ENVIRONMENT" = "development" ]; then
  echo -e "\n${YELLOW}🏃 Starting development servers...${NC}"
  
  # Start RetailBot API
  echo "Starting RetailBot API..."
  cd api/retailbot
  uvicorn main:app --reload --port 8000 &
  RETAILBOT_PID=$!
  cd ../..
  
  # Start Next.js
  echo "Starting Next.js dashboard..."
  npm run dev &
  NEXT_PID=$!
  
  echo -e "\n${GREEN}✅ Development servers started!${NC}"
  echo "Dashboard: http://localhost:3000/dashboard"
  echo "RetailBot API: http://localhost:8000"
  echo "AI Analytics: http://localhost:3000/dashboard/ai"
  
elif [ "$ENVIRONMENT" = "production" ]; then
  echo -e "\n${YELLOW}🚀 Deploying to production...${NC}"
  
  # Build Next.js
  npm run build
  
  # Deploy to Vercel
  vercel --prod
  
  # Deploy RetailBot API (example with Docker)
  docker build -t $PROJECT_NAME-retailbot ./api/retailbot
  docker push $PROJECT_NAME-retailbot
  
  echo -e "\n${GREEN}✅ Production deployment complete!${NC}"
fi

# Step 4: Run tests
echo -e "\n${YELLOW}🧪 Running tests...${NC}"
npm run type-check
# npm run test

echo -e "\n${GREEN}🎉 Scout RetailBot Hybrid deployment complete!${NC}"
echo ""
echo "Key Features:"
echo "✅ Natural language analytics with Groq LLM"
echo "✅ Real-time IoT telemetry monitoring"
echo "✅ Predictive sales analytics"
echo "✅ Bronze → Silver → Gold data pipeline"
echo "✅ Master Toggle Agent for dynamic filters"
echo ""
echo "Next Steps:"
echo "1. Add your GROQ_API_KEY to .env.local"
echo "2. Set up database with: npm run db:migrate"
echo "3. Seed data with: node seed-database.js"
echo "4. Visit http://localhost:3000/dashboard/ai"
echo ""

# Keep process running in development
if [ "$ENVIRONMENT" = "development" ]; then
  echo "Press Ctrl+C to stop all services"
  wait
fi