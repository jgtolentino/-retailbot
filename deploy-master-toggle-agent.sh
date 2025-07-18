#!/bin/bash

# Deploy Master Toggle Agent for Scout Databank
# This script deploys the Master Toggle Agent with proper configuration and verification

set -e

echo "🚀 Deploying Master Toggle Agent for Scout Databank"
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
SUPABASE_SERVICE_ROLE_KEY="sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64"

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

# Check dependencies
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
    
    log_success "All dependencies are installed"
}

# Set up environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    cd "$PROJECT_DIR"
    
    # Create or update .env.local with agent configuration
    cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
NODE_ENV=production
MASTER_TOGGLE_PORT=8080
EOF
    
    # Export environment variables for current session
    export NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
    export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
    export NODE_ENV="production"
    export MASTER_TOGGLE_PORT="8080"
    
    log_success "Environment variables configured"
}

# Create the configuration file
create_config_file() {
    log_info "Creating master toggle configuration..."
    
    # Check if config file exists
    if [ ! -f "config/masterToggleConfig.ts" ]; then
        log_warning "Configuration file not found, creating default configuration..."
        
        mkdir -p config
        
        cat > config/masterToggleConfig.ts << 'EOF'
import { MasterToggleConfig } from '../services/masterToggleAgent'

export const defaultMasterToggleConfig: MasterToggleConfig = {
  dimensions: {
    // Geographic dimensions
    location: {
      sourceTable: 'transactions',
      sourceColumn: 'location',
      masterTable: 'master_locations',
      enabled: true
    },
    // Product dimensions
    category: {
      sourceTable: 'transactions',
      sourceColumn: 'category',
      masterTable: 'master_categories',
      enabled: true
    },
    brand: {
      sourceTable: 'transactions',
      sourceColumn: 'brand',
      masterTable: 'master_brands',
      enabled: true
    },
    // Product mix dimensions
    productCategory: {
      sourceTable: 'product_mix',
      sourceColumn: 'category',
      masterTable: 'master_product_categories',
      enabled: true
    },
    // Consumer behavior dimensions
    behaviorMethod: {
      sourceTable: 'consumer_behavior',
      sourceColumn: 'method',
      masterTable: 'master_behavior_methods',
      enabled: true
    },
    // Consumer profile dimensions
    ageGroup: {
      sourceTable: 'consumer_profiles',
      sourceColumn: 'age_group',
      masterTable: 'master_age_groups',
      enabled: true
    },
    gender: {
      sourceTable: 'consumer_profiles',
      sourceColumn: 'gender',
      masterTable: 'master_genders',
      enabled: true
    },
    incomeLevel: {
      sourceTable: 'consumer_profiles',
      sourceColumn: 'income_level',
      masterTable: 'master_income_levels',
      enabled: true
    },
    urbanRural: {
      sourceTable: 'consumer_profiles',
      sourceColumn: 'urban_rural',
      masterTable: 'master_urban_rural',
      enabled: true
    }
  },
  websocketPort: 8080,
  pruneInterval: 3600000 // 1 hour
}

export function getMasterToggleConfig(environment: string = 'development'): MasterToggleConfig {
  const config = { ...defaultMasterToggleConfig }
  
  if (environment === 'production') {
    // Production-specific adjustments
    config.pruneInterval = 7200000 // 2 hours
  }
  
  return config
}
EOF
    fi
    
    log_success "Configuration file ready"
}

# Create the agent starter script
create_starter_script() {
    log_info "Creating agent starter script..."
    
    cat > start-master-toggle-agent.js << 'EOF'
const { MasterToggleAgent } = require('./services/masterToggleAgent');
const { getMasterToggleConfig } = require('./config/masterToggleConfig');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get configuration
const config = getMasterToggleConfig(process.env.NODE_ENV || 'development');

// Initialize and start the agent
const agent = new MasterToggleAgent(supabase, config);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  await agent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  await agent.stop();
  process.exit(0);
});

// Start the agent
agent.start().then(() => {
  console.log('✅ Master Toggle Agent is running');
  console.log(`🌐 WebSocket server listening on port ${config.websocketPort}`);
  console.log('📊 Monitoring the following dimensions:');
  
  Object.entries(config.dimensions).forEach(([name, conf]) => {
    if (conf.enabled) {
      console.log(`  - ${name}: ${conf.sourceTable}.${conf.sourceColumn} -> ${conf.masterTable}`);
    }
  });
  
  console.log('👁️  Watching for data changes...');
}).catch(error => {
  console.error('❌ Failed to start Master Toggle Agent:', error);
  process.exit(1);
});
EOF
    
    log_success "Agent starter script created"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Dependencies installed"
    else
        log_success "Dependencies already installed"
    fi
}

# Create logs directory
setup_logging() {
    log_info "Setting up logging..."
    
    mkdir -p logs
    
    log_success "Logging directory created"
}

# Build the TypeScript files
build_project() {
    log_info "Building TypeScript files..."
    
    # Check if TypeScript is available
    if command -v npx &> /dev/null && [ -f "tsconfig.json" ]; then
        npx tsc --noEmit
        log_success "TypeScript compilation check passed"
    else
        log_warning "TypeScript not available or no tsconfig.json found"
    fi
}

# Start the agent
start_agent() {
    log_info "Starting Master Toggle Agent..."
    
    # Kill any existing agent process
    if [ -f "logs/master-toggle-agent.pid" ]; then
        OLD_PID=$(cat logs/master-toggle-agent.pid)
        if ps -p $OLD_PID > /dev/null 2>&1; then
            log_warning "Stopping existing agent process (PID: $OLD_PID)"
            kill $OLD_PID
            sleep 2
        fi
    fi
    
    # Start the agent in the background
    nohup node start-master-toggle-agent.js > logs/master-toggle-agent.log 2>&1 &
    AGENT_PID=$!
    
    # Save PID for later use
    echo $AGENT_PID > logs/master-toggle-agent.pid
    
    log_success "Master Toggle Agent started (PID: $AGENT_PID)"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    sleep 5
    
    # Check if process is still running
    if [ -f "logs/master-toggle-agent.pid" ]; then
        AGENT_PID=$(cat logs/master-toggle-agent.pid)
        if ps -p $AGENT_PID > /dev/null 2>&1; then
            log_success "Agent process is running (PID: $AGENT_PID)"
        else
            log_error "Agent process is not running"
            log_error "Check logs for errors: tail -f logs/master-toggle-agent.log"
            return 1
        fi
    else
        log_error "PID file not found"
        return 1
    fi
    
    # Check logs for errors
    if [ -f "logs/master-toggle-agent.log" ]; then
        if grep -q "Master Toggle Agent is running" logs/master-toggle-agent.log; then
            log_success "Agent started successfully"
        else
            log_warning "Agent may not have started properly"
            log_info "Recent logs:"
            tail -10 logs/master-toggle-agent.log
        fi
    fi
    
    return 0
}

# Main deployment function
main() {
    log_info "Starting Master Toggle Agent deployment..."
    
    # Step 1: Check dependencies
    check_dependencies
    
    # Step 2: Setup environment
    setup_environment
    
    # Step 3: Create configuration
    create_config_file
    
    # Step 4: Install dependencies
    install_dependencies
    
    # Step 5: Setup logging
    setup_logging
    
    # Step 6: Build project
    build_project
    
    # Step 7: Create starter script
    create_starter_script
    
    # Step 8: Start agent
    start_agent
    
    # Step 9: Verify deployment
    if verify_deployment; then
        echo
        log_success "🎉 Master Toggle Agent deployment completed successfully!"
        echo "=================================================="
        echo "📊 Agent Status: Running"
        echo "🌐 WebSocket Port: 8080"
        echo "📄 Log File: logs/master-toggle-agent.log"
        echo "🔧 PID File: logs/master-toggle-agent.pid"
        echo ""
        echo "📋 Management Commands:"
        echo "  - View logs: tail -f logs/master-toggle-agent.log"
        echo "  - Stop agent: kill \$(cat logs/master-toggle-agent.pid)"
        echo "  - Restart: ./deploy-master-toggle-agent.sh"
        echo ""
        echo "🔄 The agent is now monitoring database changes and will automatically"
        echo "   update filter options as new data arrives in the Scout Dashboard."
        echo ""
        echo "📊 Dashboard is still running at: http://localhost:3000/dashboard"
        echo "🔗 The agent will enhance the dashboard with real-time filter updates."
    else
        log_error "Deployment verification failed"
        exit 1
    fi
}

# Run the main function
main "$@"