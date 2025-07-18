import { SupabaseClient } from '@supabase/supabase-js'
import { WebSocketServer } from 'ws'
import { EventEmitter } from 'events'

export interface MasterToggleConfig {
  dimensions: {
    [key: string]: {
      sourceTable: string
      sourceColumn: string
      masterTable: string
      enabled: boolean
      refreshInterval?: number
    }
  }
  websocketPort?: number
  pruneInterval?: number
}

export interface FilterUpdateEvent {
  dimension: string
  action: 'upsert' | 'delete'
  values: string[]
  timestamp: Date
}

export class MasterToggleAgent extends EventEmitter {
  private supabase: SupabaseClient
  private config: MasterToggleConfig
  private wsServer?: WebSocketServer
  private pruneInterval?: NodeJS.Timeout
  private changeListeners: Map<string, any> = new Map()
  private isRunning = false

  constructor(supabase: SupabaseClient, config: MasterToggleConfig) {
    super()
    this.supabase = supabase
    this.config = config
  }

  async start() {
    if (this.isRunning) return
    
    console.log('Starting Master Toggle Agent...')
    
    // Initialize WebSocket server
    if (this.config.websocketPort) {
      this.initializeWebSocket()
    }
    
    // Set up change listeners for each dimension
    await this.setupChangeListeners()
    
    // Start pruner service
    this.startPruner()
    
    // Initial sync of all dimensions
    await this.syncAllDimensions()
    
    this.isRunning = true
    console.log('Master Toggle Agent started successfully')
  }

  async stop() {
    if (!this.isRunning) return
    
    console.log('Stopping Master Toggle Agent...')
    
    // Stop WebSocket server
    if (this.wsServer) {
      this.wsServer.close()
    }
    
    // Stop pruner
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval)
    }
    
    // Stop change listeners
    this.changeListeners.forEach(listener => {
      if (listener.unsubscribe) {
        listener.unsubscribe()
      }
    })
    
    this.isRunning = false
    console.log('Master Toggle Agent stopped')
  }

  private initializeWebSocket() {
    this.wsServer = new WebSocketServer({ port: this.config.websocketPort })
    
    this.wsServer.on('connection', (ws) => {
      console.log('Client connected to Master Toggle Agent')
      
      ws.on('close', () => {
        console.log('Client disconnected from Master Toggle Agent')
      })
    })
    
    // Listen for filter updates and broadcast to all clients
    this.on('filter_updated', (event: FilterUpdateEvent) => {
      this.broadcastFilterUpdate(event)
    })
  }

  private async setupChangeListeners() {
    for (const [dimension, config] of Object.entries(this.config.dimensions)) {
      if (!config.enabled) continue
      
      try {
        // Subscribe to real-time changes on the source table
        const channel = this.supabase
          .channel(`${config.sourceTable}_changes`)
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: config.sourceTable 
            }, 
            (payload) => {
              this.handleDataChange(dimension, payload)
            }
          )
          .subscribe()
        
        this.changeListeners.set(dimension, channel)
        console.log(`Set up change listener for ${dimension}`)
      } catch (error) {
        console.error(`Failed to set up change listener for ${dimension}:`, error)
      }
    }
  }

  private async handleDataChange(dimension: string, payload: any) {
    const config = this.config.dimensions[dimension]
    if (!config) return
    
    console.log(`Data change detected for ${dimension}:`, payload.eventType)
    
    try {
      // Extract the changed value
      const newValue = payload.new?.[config.sourceColumn]
      const oldValue = payload.old?.[config.sourceColumn]
      
      switch (payload.eventType) {
        case 'INSERT':
        case 'UPDATE':
          if (newValue) {
            await this.upsertMasterData(dimension, [newValue])
          }
          break
        case 'DELETE':
          if (oldValue) {
            // Schedule pruning check
            setTimeout(() => this.pruneDimension(dimension), 1000)
          }
          break
      }
    } catch (error) {
      console.error(`Error handling data change for ${dimension}:`, error)
    }
  }

  private async upsertMasterData(dimension: string, values: string[]) {
    const config = this.config.dimensions[dimension]
    if (!config || !values.length) return
    
    try {
      // Deduplicate values
      const uniqueValues = [...new Set(values.filter(v => v && v.trim()))]
      
      if (uniqueValues.length === 0) return
      
      // Upsert into master table
      const upsertData = uniqueValues.map(value => ({
        [config.sourceColumn]: value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      const { error } = await this.supabase
        .from(config.masterTable)
        .upsert(upsertData, { 
          onConflict: config.sourceColumn,
          ignoreDuplicates: true 
        })
      
      if (error) {
        console.error(`Error upserting master data for ${dimension}:`, error)
        return
      }
      
      console.log(`Upserted ${uniqueValues.length} values for ${dimension}`)
      
      // Emit filter update event
      this.emit('filter_updated', {
        dimension,
        action: 'upsert',
        values: uniqueValues,
        timestamp: new Date()
      })
      
    } catch (error) {
      console.error(`Error in upsertMasterData for ${dimension}:`, error)
    }
  }

  private async pruneDimension(dimension: string) {
    const config = this.config.dimensions[dimension]
    if (!config) return
    
    try {
      // Get all values currently in the source table
      const { data: sourceData, error: sourceError } = await this.supabase
        .from(config.sourceTable)
        .select(config.sourceColumn)
        .not(config.sourceColumn, 'is', null)
      
      if (sourceError) {
        console.error(`Error fetching source data for ${dimension}:`, sourceError)
        return
      }
      
      const activeValues = new Set(
        sourceData.map(row => row[config.sourceColumn]).filter(v => v)
      )
      
      // Get all values in the master table
      const { data: masterData, error: masterError } = await this.supabase
        .from(config.masterTable)
        .select(config.sourceColumn)
      
      if (masterError) {
        console.error(`Error fetching master data for ${dimension}:`, masterError)
        return
      }
      
      // Find orphaned values
      const orphanedValues = masterData
        .map(row => row[config.sourceColumn])
        .filter(value => !activeValues.has(value))
      
      if (orphanedValues.length > 0) {
        // Delete orphaned values
        const { error: deleteError } = await this.supabase
          .from(config.masterTable)
          .delete()
          .in(config.sourceColumn, orphanedValues)
        
        if (deleteError) {
          console.error(`Error deleting orphaned values for ${dimension}:`, deleteError)
          return
        }
        
        console.log(`Pruned ${orphanedValues.length} orphaned values for ${dimension}`)
        
        // Emit filter update event
        this.emit('filter_updated', {
          dimension,
          action: 'delete',
          values: orphanedValues,
          timestamp: new Date()
        })
      }
      
    } catch (error) {
      console.error(`Error in pruneDimension for ${dimension}:`, error)
    }
  }

  private startPruner() {
    const interval = this.config.pruneInterval || 300000 // 5 minutes default
    
    this.pruneInterval = setInterval(async () => {
      console.log('Starting scheduled pruning...')
      
      for (const dimension of Object.keys(this.config.dimensions)) {
        if (this.config.dimensions[dimension].enabled) {
          await this.pruneDimension(dimension)
        }
      }
      
      console.log('Scheduled pruning completed')
    }, interval)
  }

  private async syncAllDimensions() {
    console.log('Syncing all dimensions...')
    
    for (const [dimension, config] of Object.entries(this.config.dimensions)) {
      if (!config.enabled) continue
      
      try {
        // Get all unique values from source table
        const { data, error } = await this.supabase
          .from(config.sourceTable)
          .select(config.sourceColumn)
          .not(config.sourceColumn, 'is', null)
        
        if (error) {
          console.error(`Error syncing ${dimension}:`, error)
          continue
        }
        
        const uniqueValues = [...new Set(
          data.map(row => row[config.sourceColumn]).filter(v => v && v.trim())
        )]
        
        if (uniqueValues.length > 0) {
          await this.upsertMasterData(dimension, uniqueValues)
        }
        
      } catch (error) {
        console.error(`Error syncing ${dimension}:`, error)
      }
    }
    
    console.log('Initial sync completed')
  }

  private broadcastFilterUpdate(event: FilterUpdateEvent) {
    if (!this.wsServer) return
    
    const message = JSON.stringify({
      type: 'filter_updated',
      data: event
    })
    
    this.wsServer.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message)
      }
    })
  }

  // API Methods
  async getFilterOptions(dimension: string): Promise<string[]> {
    const config = this.config.dimensions[dimension]
    if (!config) {
      throw new Error(`Unknown dimension: ${dimension}`)
    }
    
    const { data, error } = await this.supabase
      .from(config.masterTable)
      .select(config.sourceColumn)
      .order(config.sourceColumn)
    
    if (error) {
      throw error
    }
    
    return data.map(row => row[config.sourceColumn]).filter(v => v)
  }

  async addToggleDimension(dimension: string, toggleConfig: {
    sourceTable: string
    sourceColumn: string
    masterTable: string
  }): Promise<void> {
    // Create master table if it doesn't exist
    const { error: createError } = await this.supabase.rpc('create_master_table_if_not_exists', {
      table_name: toggleConfig.masterTable,
      column_name: toggleConfig.sourceColumn
    })
    
    if (createError) {
      throw createError
    }
    
    // Add to config
    this.config.dimensions[dimension] = {
      ...toggleConfig,
      enabled: true
    }
    
    // Set up change listener
    await this.setupChangeListeners()
    
    // Initial sync
    await this.syncAllDimensions()
    
    console.log(`Added new toggle dimension: ${dimension}`)
  }

  getHealth(): { status: string; dimensions: number; uptime: number } {
    return {
      status: this.isRunning ? 'healthy' : 'stopped',
      dimensions: Object.keys(this.config.dimensions).length,
      uptime: process.uptime()
    }
  }
}