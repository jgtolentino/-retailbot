#!/bin/bash

echo "📤 Pushing Scout RetailBot to Remote Repository"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/
dist/

# Production
*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
api/retailbot/venv/

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
.cache/

# Test artifacts
test-results/
playwright-report/
cypress/videos/
cypress/screenshots/

# Build artifacts
.turbo
.vercel

# Supabase
supabase/.branches
supabase/.temp
EOF
fi

# Add all files
echo -e "${BLUE}Adding all files to git...${NC}"
git add .

# Show status
echo -e "${BLUE}Current git status:${NC}"
git status --short

# Commit
echo -e "${YELLOW}Creating commit...${NC}"
git commit -m "feat: Scout RetailBot with Groq AI Analytics

- Integrated Groq-powered natural language analytics
- Added RetailBot FastAPI backend service
- Created AI Analytics dashboard interface
- Implemented Lyra data lakehouse architecture
- Added Master Toggle Agent for dynamic filters
- Set up IoT telemetry monitoring dashboard
- Created hybrid architecture deployment configs
- Added comprehensive documentation

Tech stack:
- Frontend: Next.js 15, React 19, TypeScript
- AI: Groq SDK (Mixtral 8x7B)
- Backend: FastAPI, Supabase
- Data Pipeline: Bronze → Silver → Gold architecture
- Real-time: WebSocket for IoT telemetry

Co-Authored-By: Claude <claude@anthropic.com>"

# Check for existing remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo -e "${YELLOW}No remote repository configured.${NC}"
    echo -e "${BLUE}To add a remote repository:${NC}"
    echo ""
    echo "  1. Create a new repository on GitHub"
    echo "  2. Run: git remote add origin https://github.com/YOUR_USERNAME/scout-retailbot.git"
    echo "  3. Run: git push -u origin main"
    echo ""
    echo -e "${YELLOW}Or use the retailbot repository:${NC}"
    echo "  git remote add origin https://github.com/jgtolentino/-retailbot.git"
    echo "  git push -u origin main"
else
    echo -e "${GREEN}Remote repository found: $REMOTE_URL${NC}"
    
    # Get current branch
    BRANCH=$(git branch --show-current)
    echo -e "${BLUE}Current branch: $BRANCH${NC}"
    
    # Push to remote
    echo -e "${YELLOW}Pushing to remote...${NC}"
    git push -u origin $BRANCH
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to remote!${NC}"
        echo -e "${BLUE}Repository URL: $REMOTE_URL${NC}"
    else
        echo -e "${RED}❌ Push failed. You may need to:${NC}"
        echo "  1. Set up authentication (GitHub token/SSH key)"
        echo "  2. Force push if this is a new repo: git push -u origin $BRANCH --force"
    fi
fi

echo ""
echo -e "${GREEN}📊 Repository Statistics:${NC}"
echo "  Files: $(git ls-files | wc -l)"
echo "  Commits: $(git rev-list --count HEAD 2>/dev/null || echo 1)"
echo "  Size: $(du -sh .git | cut -f1)"

echo ""
echo -e "${BLUE}📁 Key Components:${NC}"
echo "  • RetailBot AI Service: /services/scoutRetailBot.ts"
echo "  • FastAPI Backend: /api/retailbot/"
echo "  • AI Dashboard: /app/dashboard/ai/"
echo "  • IoT Dashboard: /app/dashboard/iot/"
echo "  • Lyra Data Pipeline: /services/lyraDataLakehouse.ts"
echo "  • Master Toggle Agent: /services/masterToggleAgent.ts"

echo ""
echo -e "${GREEN}🚀 Next Steps:${NC}"
echo "  1. Share the repository URL with your team"
echo "  2. Set up CI/CD pipelines"
echo "  3. Configure production environment variables"
echo "  4. Deploy to Vercel/Railway/Render"