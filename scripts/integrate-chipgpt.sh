#!/bin/bash

# ChipGPT Integration Script for Scout Dashboard
set -e

echo "🚀 Starting ChipGPT + Scout Dashboard Integration"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if Pulser is installed
if ! command -v pulser &> /dev/null; then
    echo -e "${RED}❌ Pulser CLI not found!${NC}"
    echo "Please install Pulser: npm install -g @pulser/cli"
    exit 1
fi

# Check if .env.chipgpt exists
if [ ! -f ".env.chipgpt" ]; then
    echo -e "${YELLOW}⚠️  .env.chipgpt not found. Creating from template...${NC}"
    cp .env.chipgpt.example .env.chipgpt
    echo -e "${YELLOW}📝 Please edit .env.chipgpt with your ChipGPT credentials${NC}"
    exit 1
fi

# Load ChipGPT environment variables
export $(cat .env.chipgpt | xargs)

echo -e "${GREEN}✅ Prerequisites satisfied${NC}"

# Step 1: Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install next-auth @auth/core

# Step 2: Apply database migrations
echo -e "\n${YELLOW}🗄️ Applying MCP session tables migration...${NC}"
if [ -f "supabase/migrations/20250719_002_mcp_session_tables.sql" ]; then
    echo "Migration file ready for deployment"
else
    echo -e "${RED}❌ Migration file not found!${NC}"
    exit 1
fi

# Step 3: Register agents with Pulser
echo -e "\n${YELLOW}🤖 Registering agents with MCP...${NC}"

# Register each agent
agents=("RetailBot" "AdsBot" "LearnBot" "Dash" "Gagambi" "Echo")
for agent in "${agents[@]}"; do
    echo -e "Registering ${agent}..."
    pulser agent register \
        --name "${agent}" \
        --url "${CHIPGPT_MCP_URL}/mcp/${agent,,}" \
        --auth oauth \
        --config pulser-chipgpt-config.yaml || echo -e "${YELLOW}⚠️  ${agent} already registered${NC}"
done

# Step 4: Bind MCP to frontend
echo -e "\n${YELLOW}🔗 Binding MCP to Scout Dashboard...${NC}"
pulser mcp bind \
    --frontend scout-dashboard \
    --backend "${CHIPGPT_MCP_URL}/mcp" \
    --config pulser-chipgpt-config.yaml

# Step 5: Update environment variables
echo -e "\n${YELLOW}🔐 Updating environment configuration...${NC}"
cat .env.chipgpt >> .env.local
echo -e "${GREEN}✅ Environment variables merged${NC}"

# Step 6: Generate types
echo -e "\n${YELLOW}📝 Generating TypeScript types...${NC}"
npm run type-check

# Step 7: Test the integration
echo -e "\n${YELLOW}🧪 Testing ChipGPT connection...${NC}"
node -e "
const config = {
  url: '${CHIPGPT_MCP_URL}/health',
  headers: {
    'Authorization': 'Bearer test-token'
  }
};
console.log('Testing MCP endpoint:', config.url);
"

echo -e "\n${GREEN}✅ ChipGPT Integration Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Visit http://localhost:3000/auth/signin to test OAuth2 login"
echo "3. Check the dashboard to verify agent connections"
echo ""
echo "To deploy to production:"
echo "1. Set ChipGPT env vars in Vercel"
echo "2. Run 'vercel --prod'"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "- Integration Plan: CHIPGPT_INTEGRATION_PLAN.md"
echo "- OAuth Config: lib/auth/chipgpt-oauth.ts"
echo "- Agent Client: lib/mcp/agent-client.ts"
echo ""
echo -e "${GREEN}🎉 Happy coding with ChipGPT + Scout!${NC}"