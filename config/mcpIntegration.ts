// MCP Integration Configuration for Master Toggle Agent
// Aligns with official Supabase MCP server settings

export interface MCPServerConfig {
  supabase: {
    command: string
    args: string[]
    env: {
      SUPABASE_ACCESS_TOKEN: string
      [key: string]: string
    }
  }
  [key: string]: any
}

// Get MCP configuration from environment
export function getMCPConfig(): MCPServerConfig {
  const projectRef = process.env.SUPABASE_PROJECT_REF || 'cxzllzyxwpyptfretryc'
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN || ''
  const readOnly = process.env.MCP_READ_ONLY === 'true'

  return {
    supabase: {
      command: 'npx',
      args: [
        '-y',
        '@supabase/mcp-server-supabase@latest',
        ...(readOnly ? ['--read-only'] : []),
        `--project-ref=${projectRef}`
      ],
      env: {
        SUPABASE_ACCESS_TOKEN: accessToken
      }
    }
  }
}

// Agent communication protocols
export const AGENT_PROTOCOLS = {
  // Master Toggle Agent events
  FILTER_UPDATE: 'filter_dimension_updated',
  MASTER_DATA_SYNC: 'master_data_synchronized',
  DIMENSION_ADDED: 'dimension_added',
  DIMENSION_PRUNED: 'dimension_pruned',
  
  // Lyra Agent orchestration
  TASK_REQUEST: 'task_request',
  TASK_COMPLETE: 'task_complete',
  WORKFLOW_START: 'workflow_start',
  WORKFLOW_COMPLETE: 'workflow_complete',
  
  // Pulser Agent analytics
  ANALYTICS_REQUEST: 'analytics_request',
  ANALYTICS_RESULT: 'analytics_result',
  TREND_DETECTED: 'trend_detected',
  
  // Bruno Agent API testing
  API_TEST_REQUEST: 'api_test_request',
  API_TEST_RESULT: 'api_test_result',
  ENDPOINT_STATUS: 'endpoint_status',
  
  // General agent communication
  AGENT_HELLO: 'agent_hello',
  AGENT_GOODBYE: 'agent_goodbye',
  AGENT_HEARTBEAT: 'agent_heartbeat',
  KNOWLEDGE_SHARE: 'knowledge_share'
}

// Knowledge categories for agent collaboration
export const KNOWLEDGE_CATEGORIES = {
  FILTER_DIMENSIONS: 'filter_dimensions',
  AGENT_HEALTH: 'agent_health',
  AGENT_MESSAGES: 'agent_messages',
  TASK_QUEUE: 'task_queue',
  ANALYTICS_RESULTS: 'analytics_results',
  API_STATUS: 'api_status',
  WORKFLOW_STATE: 'workflow_state',
  ERROR_LOGS: 'error_logs',
  PERFORMANCE_METRICS: 'performance_metrics'
}

// Agent collaboration patterns
export interface AgentCollaboration {
  // Request analytics from Pulser when new dimensions are added
  onDimensionAdded: {
    notifyAgents: ['pulser-agent', 'lyra-agent']
    protocol: typeof AGENT_PROTOCOLS.DIMENSION_ADDED
    payload: {
      dimension: string
      config: any
    }
  }
  
  // Notify Lyra when filter updates complete
  onFilterUpdate: {
    notifyAgents: ['lyra-agent']
    protocol: typeof AGENT_PROTOCOLS.FILTER_UPDATE
    payload: {
      dimension: string
      action: 'upsert' | 'delete'
      values: string[]
    }
  }
  
  // Request API testing from Bruno for new endpoints
  onAPIEndpointAdded: {
    notifyAgents: ['bruno-agent']
    protocol: typeof AGENT_PROTOCOLS.API_TEST_REQUEST
    payload: {
      endpoint: string
      method: string
      expectedStatus: number
    }
  }
}

// MCP Tool mappings for Master Toggle Agent
export const MCP_TOOLS = {
  // Database operations
  EXECUTE_SQL: 'mcp__supabase__execute_sql',
  LIST_TABLES: 'mcp__supabase__list_tables',
  APPLY_MIGRATION: 'mcp__supabase__apply_migration',
  
  // Real-time operations
  GET_LOGS: 'mcp__supabase__get_logs',
  
  // Documentation search
  SEARCH_DOCS: 'mcp__supabase__search_docs'
}

// Integration points with existing MCP ecosystem
export interface MCPIntegrationPoints {
  // Primary Supabase project
  primary: {
    projectRef: 'cxzllzyxwpyptfretryc'
    description: 'Main Scout Dash database'
    schemas: ['public', 'master_data', 'transactions', 'analytics']
  }
  
  // Agent repository project (if separate)
  agentRepo: {
    projectRef: 'texxwmlroefdisgxpszc'
    description: 'Unified agent repository'
    schemas: ['agent_repository']
  }
}

// Helper to validate MCP credentials
export function validateMCPCredentials(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!process.env.SUPABASE_PROJECT_REF) {
    errors.push('Missing SUPABASE_PROJECT_REF')
  }
  
  if (!process.env.SUPABASE_ACCESS_TOKEN && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('Missing SUPABASE_ACCESS_TOKEN or SUPABASE_SERVICE_ROLE_KEY')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Agent registry helper
export async function registerWithAgentEcosystem(
  agentName: string,
  agentType: string,
  capabilities: string[]
): Promise<boolean> {
  const validation = validateMCPCredentials()
  if (!validation.valid) {
    console.error('Invalid MCP credentials:', validation.errors)
    return false
  }
  
  // Registration will be handled by the MasterToggleAgentMCP class
  console.log(`Registering ${agentName} with ecosystem...`)
  return true
}