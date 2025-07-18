import { SupabaseClient } from '@supabase/supabase-js'
import { EventEmitter } from 'events'

export interface LyraConfig {
  agentId: string
  role: 'primary' | 'secondary'
  heartbeatInterval: number
  failoverTimeout: number
  pullQueueInterval: number
}

export interface PullQueueItem {
  id: number
  source: string
  payload: any
  status: 'pending' | 'processing' | 'done' | 'failed'
  agent_claimed: string | null
  created_at: string
  updated_at: string
}

export class LyraAgent extends EventEmitter {
  private supabase: SupabaseClient
  private config: LyraConfig
  private isActive = false
  private heartbeatTimer?: NodeJS.Timeout
  private pullTimer?: NodeJS.Timeout
  private lastHeartbeat: Date = new Date()

  constructor(supabase: SupabaseClient, config: LyraConfig) {
    super()
    this.supabase = supabase
    this.config = config
  }

  async start() {
    console.log(`🚀 Starting Lyra Agent ${this.config.agentId} as ${this.config.role}`)
    
    // Start heartbeat
    this.startHeartbeat()
    
    // Start monitoring if secondary
    if (this.config.role === 'secondary') {
      this.startMonitoring()
    } else {
      this.activate()
    }
  }

  async stop() {
    console.log(`🛑 Stopping Lyra Agent ${this.config.agentId}`)
    this.isActive = false
    
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    if (this.pullTimer) clearInterval(this.pullTimer)
    
    await this.auditLog('agent_stopped', { reason: 'manual_stop' })
  }

  private async activate() {
    if (this.isActive) return
    
    console.log(`✅ Activating Lyra Agent ${this.config.agentId}`)
    this.isActive = true
    
    await this.auditLog('agent_activated', { role: this.config.role })
    
    // Start processing pull queue
    this.startPullProcessor()
  }

  private async deactivate() {
    if (!this.isActive) return
    
    console.log(`⏸️  Deactivating Lyra Agent ${this.config.agentId}`)
    this.isActive = false
    
    if (this.pullTimer) {
      clearInterval(this.pullTimer)
      this.pullTimer = undefined
    }
    
    await this.auditLog('agent_deactivated', { role: this.config.role })
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.supabase
          .from('lyra_heartbeats')
          .upsert({
            agent_id: this.config.agentId,
            role: this.config.role,
            is_active: this.isActive,
            last_heartbeat: new Date().toISOString()
          })
        
        this.lastHeartbeat = new Date()
      } catch (error) {
        console.error('Heartbeat failed:', error)
      }
    }, this.config.heartbeatInterval)
  }

  private startMonitoring() {
    console.log('👁️  Starting primary agent monitoring')
    
    setInterval(async () => {
      try {
        // Check primary agent heartbeat
        const { data: primary } = await this.supabase
          .from('lyra_heartbeats')
          .select('*')
          .eq('role', 'primary')
          .single()
        
        if (!primary || !primary.last_heartbeat) {
          await this.handleFailover()
          return
        }
        
        const lastBeat = new Date(primary.last_heartbeat)
        const now = new Date()
        const diff = now.getTime() - lastBeat.getTime()
        
        if (diff > this.config.failoverTimeout) {
          await this.handleFailover()
        }
      } catch (error) {
        console.error('Monitoring error:', error)
      }
    }, 2000) // Check every 2 seconds
  }

  private async handleFailover() {
    if (this.isActive) return // Already active
    
    console.log('🔄 Initiating failover to secondary agent')
    
    await this.auditLog('failover_initiated', {
      from: 'primary',
      to: this.config.agentId,
      reason: 'heartbeat_timeout'
    })
    
    // Promote secondary to active
    await this.activate()
    
    this.emit('failover', {
      agent: this.config.agentId,
      timestamp: new Date()
    })
  }

  private startPullProcessor() {
    this.pullTimer = setInterval(async () => {
      if (!this.isActive) return
      
      try {
        await this.processPullQueue()
      } catch (error) {
        console.error('Pull processor error:', error)
      }
    }, this.config.pullQueueInterval)
  }

  private async processPullQueue() {
    // Claim a pending item
    const { data: item, error } = await this.supabase
      .from('pull_queue')
      .select('*')
      .eq('status', 'pending')
      .is('agent_claimed', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    
    if (error || !item) return
    
    // Try to claim it
    const { error: claimError } = await this.supabase
      .from('pull_queue')
      .update({
        status: 'processing',
        agent_claimed: this.config.agentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id)
      .eq('status', 'pending') // Double check
      .is('agent_claimed', null)
    
    if (claimError) {
      console.log('Failed to claim item, likely taken by other agent')
      return
    }
    
    // Process the item
    try {
      await this.processItem(item)
      
      // Mark as done
      await this.supabase
        .from('pull_queue')
        .update({
          status: 'done',
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
      
      await this.auditLog('item_processed', {
        item_id: item.id,
        source: item.source
      })
      
    } catch (error) {
      console.error('Processing error:', error)
      
      // Mark as failed
      await this.supabase
        .from('pull_queue')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
      
      await this.auditLog('item_failed', {
        item_id: item.id,
        error: error.message
      })
    }
  }

  private async processItem(item: PullQueueItem) {
    console.log(`Processing item ${item.id} from ${item.source}`)
    
    // Schema inference and ingestion logic
    const payload = item.payload
    
    // Infer schema
    const schema = this.inferSchema(payload)
    
    // Update master registry
    await this.updateMasterRegistry(schema)
    
    // Ingest data
    await this.ingestData(payload, schema)
  }

  private inferSchema(payload: any): any {
    // Simple schema inference
    const schema = {
      fields: {},
      source: payload.source || 'unknown',
      inferred_at: new Date().toISOString()
    }
    
    // Analyze payload structure
    for (const [key, value] of Object.entries(payload)) {
      schema.fields[key] = {
        type: typeof value,
        nullable: value === null,
        sample: value
      }
    }
    
    return schema
  }

  private async updateMasterRegistry(schema: any) {
    await this.supabase
      .from('master_schemas')
      .upsert({
        source: schema.source,
        schema: schema,
        updated_by: this.config.agentId,
        updated_at: new Date().toISOString()
      })
  }

  private async ingestData(payload: any, schema: any) {
    // Transform and ingest based on schema
    const table = `data_${schema.source.toLowerCase()}`
    
    await this.supabase
      .from(table)
      .insert({
        ...payload,
        ingested_by: this.config.agentId,
        ingested_at: new Date().toISOString()
      })
  }

  private async auditLog(event_type: string, payload: any) {
    try {
      await this.supabase
        .from('lyra_audit')
        .insert({
          agent_id: this.config.agentId,
          event_type,
          event_time: new Date().toISOString(),
          payload,
          notes: `${this.config.role} agent`
        })
    } catch (error) {
      console.error('Audit log error:', error)
    }
  }

  // Health check
  getHealth() {
    return {
      agent_id: this.config.agentId,
      role: this.config.role,
      is_active: this.isActive,
      last_heartbeat: this.lastHeartbeat,
      uptime: process.uptime()
    }
  }
}