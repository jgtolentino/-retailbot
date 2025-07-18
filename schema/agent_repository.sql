-- Agent Repository Schema for Master Toggle Agent Integration
-- This schema is shared across all agents in the ecosystem

CREATE SCHEMA IF NOT EXISTS agent_repository;

-- Master agent registry
CREATE TABLE IF NOT EXISTS agent_repository.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT UNIQUE NOT NULL,
  agent_type TEXT NOT NULL, -- 'filter_manager', 'analytics', 'orchestrator', etc.
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
  status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  input_data JSONB,
  output_data JSONB,
  error_logs TEXT,
  verification_results JSONB, -- Screenshots, console logs, etc.
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

-- Agent interactions and coordination
CREATE TABLE IF NOT EXISTS agent_repository.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent_id UUID REFERENCES agent_repository.agents(id),
  to_agent_id UUID REFERENCES agent_repository.agents(id),
  interaction_type TEXT NOT NULL,
  payload JSONB,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verification logs
CREATE TABLE IF NOT EXISTS agent_repository.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_repository.tasks(id),
  verification_type TEXT NOT NULL, -- 'console', 'screenshot', 'api_test', 'ui_test'
  status TEXT NOT NULL, -- 'pass', 'fail'
  evidence JSONB NOT NULL, -- Screenshots, logs, test results
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_name ON agent_repository.agents(agent_name);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agent_repository.agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON agent_repository.tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON agent_repository.tasks(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON agent_repository.knowledge(category);
CREATE INDEX IF NOT EXISTS idx_interactions_from ON agent_repository.interactions(from_agent_id);
CREATE INDEX IF NOT EXISTS idx_interactions_to ON agent_repository.interactions(to_agent_id);

-- Enable RLS
ALTER TABLE agent_repository.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_repository.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_repository.knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_repository.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_repository.verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your security requirements)
CREATE POLICY "Agents are readable by all authenticated users"
  ON agent_repository.agents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tasks are readable by all authenticated users"
  ON agent_repository.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Knowledge is readable by all authenticated users"
  ON agent_repository.knowledge FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role has full access"
  ON agent_repository.agents FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role has full task access"
  ON agent_repository.tasks FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role has full knowledge access"
  ON agent_repository.knowledge FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role has full interaction access"
  ON agent_repository.interactions FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role has full verification access"
  ON agent_repository.verifications FOR ALL
  TO service_role
  USING (true);

-- Helper functions
CREATE OR REPLACE FUNCTION agent_repository.update_agent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_timestamp
  BEFORE UPDATE ON agent_repository.agents
  FOR EACH ROW
  EXECUTE FUNCTION agent_repository.update_agent_timestamp();

-- Initial seed data for known agents
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
),
('bruno-agent', 'api_tester', '1.0.0',
  '["api_testing", "endpoint_monitoring", "performance_testing"]'::jsonb,
  '{"description": "Tests and monitors API endpoints"}'::jsonb
)
ON CONFLICT (agent_name) DO UPDATE SET
  version = EXCLUDED.version,
  capabilities = EXCLUDED.capabilities,
  configuration = EXCLUDED.configuration,
  updated_at = NOW();

-- Comments for documentation
COMMENT ON SCHEMA agent_repository IS 'Unified repository for all agents in the ecosystem';
COMMENT ON TABLE agent_repository.agents IS 'Registry of all active agents with their capabilities';
COMMENT ON TABLE agent_repository.tasks IS 'Task execution history and status tracking';
COMMENT ON TABLE agent_repository.knowledge IS 'Shared knowledge base for inter-agent communication';
COMMENT ON TABLE agent_repository.interactions IS 'Agent-to-agent message history';
COMMENT ON TABLE agent_repository.verifications IS 'Task verification and evidence storage';