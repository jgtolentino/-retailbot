#!/bin/bash
# Automated setup script for Master Toggle Agent
# No manual SQL copy-paste required!

set -e

echo "🚀 Setting up Master Toggle Agent automatically..."

# Load environment
source .env.local

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Generate timestamp for migration
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Create migration files
echo "📝 Creating migration files..."

# Combine both schemas into one migration
cat > supabase/migrations/${TIMESTAMP}_master_toggle_agent_setup.sql << 'EOF'
-- Master Toggle Agent Complete Setup
-- This migration sets up both agent repository and master data tables

-- =====================================================
-- AGENT REPOSITORY SCHEMA
-- =====================================================

CREATE SCHEMA IF NOT EXISTS agent_repository;

-- Master agent registry
CREATE TABLE IF NOT EXISTS agent_repository.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT UNIQUE NOT NULL,
  agent_type TEXT NOT NULL,
  version TEXT NOT NULL,
  capabilities JSONB NOT NULL,
  configuration JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent tasks and history
CREATE TABLE IF NOT EXISTS agent_repository.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_repository.agents(id),
  task_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input_data JSONB,
  output_data JSONB,
  error_logs TEXT,
  verification_results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Shared knowledge base
CREATE TABLE IF NOT EXISTS agent_repository.knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  agent_id UUID REFERENCES agent_repository.agents(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Agent interactions
CREATE TABLE IF NOT EXISTS agent_repository.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent_id UUID REFERENCES agent_repository.agents(id),
  to_agent_id UUID REFERENCES agent_repository.agents(id),
  interaction_type TEXT NOT NULL,
  payload JSONB,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MASTER DATA SCHEMA
-- =====================================================

CREATE SCHEMA IF NOT EXISTS master_data;

-- Master Regions
CREATE TABLE IF NOT EXISTS master_data.master_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT UNIQUE NOT NULL,
    display_name TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Brands
CREATE TABLE IF NOT EXISTS master_data.master_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT UNIQUE NOT NULL,
    display_name TEXT,
    parent_company TEXT,
    is_tbwa_client BOOLEAN DEFAULT false,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Categories
CREATE TABLE IF NOT EXISTS master_data.master_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_category TEXT UNIQUE NOT NULL,
    display_name TEXT,
    parent_category TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Payment Methods
CREATE TABLE IF NOT EXISTS master_data.master_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method TEXT UNIQUE NOT NULL,
    display_name TEXT,
    is_digital BOOLEAN DEFAULT false,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add more master tables as needed...

-- =====================================================
-- INITIAL AGENT REGISTRATION
-- =====================================================

INSERT INTO agent_repository.agents (agent_name, agent_type, version, capabilities, configuration) VALUES
('master-toggle-agent', 'filter_manager', '1.0.0', 
  '["real_time_filter_updates", "master_data_management", "dimension_auto_discovery"]'::jsonb,
  '{"description": "Manages dynamic filter options and master data"}'::jsonb
),
('lyra-agent', 'orchestrator', '1.0.0',
  '["task_orchestration", "agent_coordination", "workflow_management"]'::jsonb,
  '{"description": "Orchestrates tasks across multiple agents"}'::jsonb
),
('pulser-agent', 'analytics_engine', '1.0.0',
  '["data_analysis", "report_generation", "trend_detection"]'::jsonb,
  '{"description": "Performs advanced analytics on transaction data"}'::jsonb
)
ON CONFLICT (agent_name) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_agents_name ON agent_repository.agents(agent_name);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON agent_repository.tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON agent_repository.knowledge(category);

CREATE INDEX IF NOT EXISTS idx_master_regions_name ON master_data.master_regions(region);
CREATE INDEX IF NOT EXISTS idx_master_brands_name ON master_data.master_brands(brand);
CREATE INDEX IF NOT EXISTS idx_master_categories_name ON master_data.master_categories(product_category);
CREATE INDEX IF NOT EXISTS idx_master_payment_methods_name ON master_data.master_payment_methods(payment_method);
EOF

echo "✅ Migration file created"

# Apply migration using Supabase CLI
echo "📤 Applying migration to database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Apply the migration
if command -v supabase &> /dev/null; then
    # Using Supabase CLI
    supabase db push --db-url "postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.${SUPABASE_PROJECT_REF:-cxzllzyxwpyptfretryc}.supabase.co:5432/postgres"
else
    echo "⚠️  Supabase CLI not available. Migration file created at:"
    echo "   supabase/migrations/${TIMESTAMP}_master_toggle_agent_setup.sql"
    echo ""
    echo "To apply manually, run:"
    echo "   supabase db push"
fi

echo ""
echo "🎉 Setup complete! Now you can start the Master Toggle Agent:"
echo "   ./scripts/start-master-toggle-mcp.sh"