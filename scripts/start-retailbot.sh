#!/bin/bash

echo "🚀 Starting Scout RetailBot Services"
echo "==================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Create Python virtual environment if it doesn't exist
if [ ! -d "api/retailbot/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd api/retailbot
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ../..
else
    echo "✅ Virtual environment exists"
    cd api/retailbot
    source venv/bin/activate
    cd ../..
fi

# Export environment variables (load from .env.local)
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env.local not found. Please create it with your API keys."
    exit 1
fi

echo "✅ Environment configured"

# Start RetailBot API in background
echo "🤖 Starting RetailBot API..."
cd api/retailbot
python3 -m uvicorn main:app --reload --port 8000 &
RETAILBOT_PID=$!
cd ../..

# Wait for API to start
sleep 3

# Check if API is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ RetailBot API is running at http://localhost:8000"
else
    echo "⚠️  RetailBot API may not have started properly"
fi

# Start Next.js dashboard
echo "🎨 Starting Scout Dashboard..."
npm run dev &
NEXT_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Access points:"
echo "   Dashboard: http://localhost:3000/dashboard"
echo "   AI Analytics: http://localhost:3000/dashboard/ai"
echo "   RetailBot API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait