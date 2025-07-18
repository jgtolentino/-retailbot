import { MasterToggleAgent } from './masterToggleAgent'
import { getMasterToggleConfig } from '../config/masterToggleConfig'
import { createClient } from '@supabase/supabase-js'

// MCP Server configuration for Master Toggle Agent
export interface MCPConfig {
  projectRef: string
  accessToken: string
  role?: 'anon' | 'service_role'
  readOnly?: boolean
}

// Agent Repository Integration
export interface AgentRegistration {
  agentName: string
  agentType: string
  version: string
  capabilities: string[]
  configuration: any
}

export class MasterToggleAgentMCP extends MasterToggleAgent {
  private mcpConfig: MCPConfig
  private agentId?: string
  private isRegistered: boolean = false

  constructor(mcpConfig: MCPConfig) {
    // Initialize Supabase client with MCP credentials
    const supabase = createClient(
      `https://${mcpConfig.projectRef}.supabase.co`,
      mcpConfig.accessToken,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    // Get agent configuration
    const agentConfig = getMasterToggleConfig(process.env.NODE_ENV || 'development')

    // Initialize parent class
    super(supabase, agentConfig)

    this.mcpConfig = mcpConfig
  }

  // Register agent in the unified agent repository
  async registerAgent(): Promise<void> {
    if (this.isRegistered) return

    try {
      const registration: AgentRegistration = {
        agentName: 'master-toggle-agent',
        agentType: 'filter_manager',
        version: '1.0.0',
        capabilities: [
          'real_time_filter_updates',
          'master_data_management',
          'dimension_auto_discovery',
          'stale_value_pruning',
          'websocket_broadcasting',
          'config_driven_dimensions'
        ],
        configuration: {
          mcp: {
            projectRef: this.mcpConfig.projectRef,
            role: this.mcpConfig.role || 'service_role',
            readOnly: this.mcpConfig.readOnly || false
          },
          dimensions: Object.keys(this.config.dimensions).filter(
            dim => this.config.dimensions[dim].enabled
          ),
          websocketPort: this.config.websocketPort,
          pruneInterval: this.config.pruneInterval
        }
      }

      // Register in agent repository
      const { data, error } = await this.supabase
        .from('agent_repository.agents')
        .upsert({
          agent_name: registration.agentName,
          agent_type: registration.agentType,
          version: registration.version,
          capabilities: registration.capabilities,
          configuration: registration.configuration
        }, {
          onConflict: 'agent_name'
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to register agent:', error)
        throw error
      }

      this.agentId = data.id
      this.isRegistered = true
      console.log(`✅ Master Toggle Agent registered with ID: ${this.agentId}`)
    } catch (error) {
      console.error('Agent registration failed:', error)
      throw error
    }
  }

  // Log task with verification in agent repository
  async logTask(taskType: string, status: 'pending' | 'running' | 'completed' | 'failed', data?: any): Promise<void> {
    if (!this.agentId) {
      console.warn('Agent not registered, skipping task logging')
      return
    }

    try {
      await this.supabase
        .from('agent_repository.tasks')
        .insert({
          agent_id: this.agentId,
          task_type: taskType,
          status: status,
          input_data: data?.input || null,
          output_data: data?.output || null,
          error_logs: data?.error || null,
          verification_results: data?.verification || null
        })
    } catch (error) {
      console.error('Failed to log task:', error)
    }
  }

  // Share knowledge with other agents
  async shareKnowledge(category: string, key: string, value: any): Promise<void> {
    if (!this.agentId) {
      console.warn('Agent not registered, skipping knowledge sharing')
      return
    }

    try {
      await this.supabase
        .from('agent_repository.knowledge')
        .upsert({
          category: category,
          key: key,
          value: value,
          agent_id: this.agentId
        }, {
          onConflict: 'category,key'
        })
    } catch (error) {
      console.error('Failed to share knowledge:', error)
    }
  }

  // Get knowledge from other agents
  async getSharedKnowledge(category: string, key?: string): Promise<any> {
    try {
      let query = this.supabase
        .from('agent_repository.knowledge')
        .select('*')
        .eq('category', category)

      if (key) {
        query = query.eq('key', key)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to get shared knowledge:', error)
      return null
    }
  }

  // Communicate with other agents
  async sendMessageToAgent(toAgentName: string, interactionType: string, payload: any): Promise<any> {
    if (!this.agentId) {
      console.warn('Agent not registered, skipping message')
      return null
    }

    try {
      // Get target agent ID
      const { data: targetAgent } = await this.supabase
        .from('agent_repository.agents')
        .select('id')
        .eq('agent_name', toAgentName)
        .single()

      if (!targetAgent) {
        console.warn(`Target agent ${toAgentName} not found`)
        return null
      }

      // Send interaction
      const { data, error } = await this.supabase
        .from('agent_repository.interactions')
        .insert({
          from_agent_id: this.agentId,
          to_agent_id: targetAgent.id,
          interaction_type: interactionType,
          payload: payload
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to send message to agent:', error)
      return null
    }
  }

  // Override start method to include registration
  async start(): Promise<void> {
    // Register agent first
    await this.registerAgent()

    // Log task start
    await this.logTask('agent_startup', 'running', {
      input: { dimensions: Object.keys(this.config.dimensions) }
    })

    try {
      // Call parent start method
      await super.start()

      // Share initial dimension configuration
      await this.shareKnowledge('filter_dimensions', 'available_dimensions', {
        dimensions: Object.entries(this.config.dimensions)
          .filter(([_, config]) => config.enabled)
          .map(([name, config]) => ({
            name,
            sourceTable: config.sourceTable,
            sourceColumn: config.sourceColumn,
            masterTable: config.masterTable
          }))
      })

      // Log successful startup
      await this.logTask('agent_startup', 'completed', {
        output: { status: 'running', dimensions: Object.keys(this.config.dimensions) }
      })

      console.log('✅ Master Toggle Agent MCP started successfully')
    } catch (error) {
      // Log failed startup
      await this.logTask('agent_startup', 'failed', {
        error: error.message
      })
      throw error
    }
  }

  // Override dimension sync to log tasks
  async syncAllDimensions(): Promise<void> {
    await this.logTask('dimension_sync', 'running', {
      input: { dimensions: Object.keys(this.config.dimensions) }
    })

    try {
      await super.syncAllDimensions()

      await this.logTask('dimension_sync', 'completed', {
        output: { synced: Object.keys(this.config.dimensions).length }
      })
    } catch (error) {
      await this.logTask('dimension_sync', 'failed', {
        error: error.message
      })
      throw error
    }
  }

  // Override pruning to log tasks
  async pruneDimension(dimension: string): Promise<void> {
    await this.logTask('dimension_prune', 'running', {
      input: { dimension }
    })

    try {
      await super.pruneDimension(dimension)

      await this.logTask('dimension_prune', 'completed', {
        output: { dimension, status: 'pruned' }
      })
    } catch (error) {
      await this.logTask('dimension_prune', 'failed', {
        error: error.message,
        input: { dimension }
      })
      throw error
    }
  }

  // Collaborate with Lyra Agent
  async notifyLyraAgent(eventType: string, data: any): Promise<void> {
    await this.sendMessageToAgent('lyra-agent', eventType, {
      source: 'master-toggle-agent',
      timestamp: new Date().toISOString(),
      data: data
    })
  }

  // Get status from other agents
  async getAgentStatuses(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('agent_repository.agents')
        .select('agent_name, agent_type, version, configuration, updated_at')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get agent statuses:', error)
      return []
    }
  }

  // Override handleDataChange to notify other agents
  protected async handleDataChange(dimension: string, payload: any): Promise<void> {
    await super.handleDataChange(dimension, payload)

    // Notify Lyra Agent about filter updates
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      await this.notifyLyraAgent('filter_dimension_updated', {
        dimension,
        eventType: payload.eventType,
        value: payload.new?.[this.config.dimensions[dimension].sourceColumn]
      })
    }
  }

  // Get health status including MCP connection
  getHealth(): any {
    const baseHealth = super.getHealth()
    return {
      ...baseHealth,
      mcp: {
        projectRef: this.mcpConfig.projectRef,
        role: this.mcpConfig.role || 'service_role',
        readOnly: this.mcpConfig.readOnly || false,
        isRegistered: this.isRegistered,
        agentId: this.agentId
      }
    }
  }
}

// Factory function to create MCP-enabled agent
export function createMasterToggleAgentMCP(config?: MCPConfig): MasterToggleAgentMCP {
  // Use environment variables if config not provided
  const mcpConfig = config || {
    projectRef: 'cxzllzyxwpyptfretryc',
    accessToken: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ACCESS_TOKEN!,
    role: 'service_role' as const,
    readOnly: false
  }

  return new MasterToggleAgentMCP(mcpConfig)
}