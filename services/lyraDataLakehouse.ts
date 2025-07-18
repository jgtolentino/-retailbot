import { SupabaseClient } from '@supabase/supabase-js'
import { EventEmitter } from 'events'

// Data Lakehouse Layer Definitions
export enum DataLayer {
  BRONZE = 'bronze',  // Raw JSONB ingestion
  SILVER = 'silver',  // Cleaned, validated, typed
  GOLD = 'gold'       // Business-ready aggregates
}

export interface LayerConfig {
  layer: DataLayer
  tables: {
    raw?: string
    processed?: string
    aggregated?: string
  }
  retention: {
    days: number
    archiveEnabled: boolean
  }
  transformations: TransformationRule[]
}

export interface TransformationRule {
  id: string
  sourceLayer: DataLayer
  targetLayer: DataLayer
  sourceTable: string
  targetTable: string
  transformFunction: string
  schedule?: string
  enabled: boolean
}

export class LyraDataLakehouse extends EventEmitter {
  private supabase: SupabaseClient
  private layers: Map<DataLayer, LayerConfig> = new Map()
  private activeTransformations: Map<string, NodeJS.Timeout> = new Map()

  constructor(supabase: SupabaseClient) {
    super()
    this.supabase = supabase
    this.initializeLayers()
  }

  private initializeLayers() {
    // Bronze Layer - Raw JSONB Storage
    this.layers.set(DataLayer.BRONZE, {
      layer: DataLayer.BRONZE,
      tables: {
        raw: 'bronze_raw_events',
        processed: 'bronze_processed_events'
      },
      retention: {
        days: 90,
        archiveEnabled: true
      },
      transformations: [
        {
          id: 'bronze_to_silver_iot',
          sourceLayer: DataLayer.BRONZE,
          targetLayer: DataLayer.SILVER,
          sourceTable: 'bronze_raw_events',
          targetTable: 'silver_iot_telemetry',
          transformFunction: 'transform_iot_telemetry',
          schedule: '*/5 * * * *', // Every 5 minutes
          enabled: true
        },
        {
          id: 'bronze_to_silver_transactions',
          sourceLayer: DataLayer.BRONZE,
          targetLayer: DataLayer.SILVER,
          sourceTable: 'bronze_raw_events',
          targetTable: 'silver_transactions',
          transformFunction: 'transform_transactions',
          schedule: '*/10 * * * *', // Every 10 minutes
          enabled: true
        }
      ]
    })

    // Silver Layer - Cleaned & Validated
    this.layers.set(DataLayer.SILVER, {
      layer: DataLayer.SILVER,
      tables: {
        processed: 'silver_events',
        aggregated: 'silver_daily_aggregates'
      },
      retention: {
        days: 365,
        archiveEnabled: true
      },
      transformations: [
        {
          id: 'silver_to_gold_kpis',
          sourceLayer: DataLayer.SILVER,
          targetLayer: DataLayer.GOLD,
          sourceTable: 'silver_events',
          targetTable: 'gold_kpi_metrics',
          transformFunction: 'calculate_kpis',
          schedule: '0 * * * *', // Every hour
          enabled: true
        }
      ]
    })

    // Gold Layer - Business Ready
    this.layers.set(DataLayer.GOLD, {
      layer: DataLayer.GOLD,
      tables: {
        aggregated: 'gold_business_metrics'
      },
      retention: {
        days: 730, // 2 years
        archiveEnabled: false
      },
      transformations: []
    })
  }

  // Bronze Layer - Raw JSONB Ingestion
  async ingestToBronze(source: string, payload: any) {
    try {
      const bronzeRecord = {
        source,
        event_type: payload.type || 'unknown',
        raw_payload: payload,
        ingested_at: new Date().toISOString(),
        processing_status: 'pending',
        schema_version: this.detectSchemaVersion(payload)
      }

      const { data, error } = await this.supabase
        .from('bronze_raw_events')
        .insert(bronzeRecord)
        .select()
        .single()

      if (error) throw error

      this.emit('bronze_ingested', {
        id: data.id,
        source,
        size: JSON.stringify(payload).length
      })

      // Trigger immediate processing for high-priority sources
      if (this.isHighPriority(source)) {
        await this.processBronzeToSilver(data.id)
      }

      return data
    } catch (error) {
      console.error('Bronze ingestion error:', error)
      throw error
    }
  }

  // Silver Layer - Data Transformation
  private async processBronzeToSilver(bronzeId: string) {
    try {
      // Fetch bronze record
      const { data: bronzeData, error } = await this.supabase
        .from('bronze_raw_events')
        .select('*')
        .eq('id', bronzeId)
        .single()

      if (error || !bronzeData) throw error

      // Apply transformations based on source
      const transformed = await this.transformBronzeData(bronzeData)

      // Insert into appropriate silver table
      const silverTable = this.getSilverTable(bronzeData.source)
      
      const { data: silverData, error: silverError } = await this.supabase
        .from(silverTable)
        .insert(transformed)
        .select()
        .single()

      if (silverError) throw silverError

      // Update bronze record status
      await this.supabase
        .from('bronze_raw_events')
        .update({ processing_status: 'processed' })
        .eq('id', bronzeId)

      this.emit('silver_processed', {
        bronze_id: bronzeId,
        silver_id: silverData.id,
        table: silverTable
      })

      return silverData
    } catch (error) {
      console.error('Silver processing error:', error)
      
      // Mark as failed
      await this.supabase
        .from('bronze_raw_events')
        .update({ processing_status: 'failed' })
        .eq('id', bronzeId)
      
      throw error
    }
  }

  // Transform bronze JSONB to typed silver schema
  private async transformBronzeData(bronzeData: any): Promise<any> {
    const payload = bronzeData.raw_payload
    const source = bronzeData.source

    // IoT Telemetry Transformation
    if (source.startsWith('iot_')) {
      return {
        device_id: payload.device_id,
        device_type: payload.device_type,
        timestamp: payload.timestamp || bronzeData.ingested_at,
        temperature: payload.telemetry?.temperature,
        humidity: payload.telemetry?.humidity,
        battery_level: payload.telemetry?.battery_level,
        location_lat: payload.telemetry?.location?.lat,
        location_lng: payload.telemetry?.location?.lng,
        signal_strength: payload.telemetry?.signal_strength,
        firmware_version: payload.metadata?.firmware_version,
        bronze_id: bronzeData.id,
        transformed_at: new Date().toISOString()
      }
    }

    // Transaction Transformation
    if (source === 'pos_transactions') {
      return {
        transaction_id: payload.transaction_id,
        store_id: payload.store_id,
        timestamp: payload.timestamp,
        amount: parseFloat(payload.amount),
        items: payload.items,
        payment_method: payload.payment_method,
        customer_id: payload.customer_id,
        bronze_id: bronzeData.id,
        transformed_at: new Date().toISOString()
      }
    }

    // Default transformation
    return {
      ...payload,
      bronze_id: bronzeData.id,
      transformed_at: new Date().toISOString()
    }
  }

  // Gold Layer - Business Aggregations
  async processToGold(metricType: string) {
    try {
      const goldMetrics = await this.calculateGoldMetrics(metricType)
      
      const { data, error } = await this.supabase
        .from('gold_business_metrics')
        .insert({
          metric_type: metricType,
          metrics: goldMetrics,
          calculated_at: new Date().toISOString(),
          period_start: goldMetrics.period_start,
          period_end: goldMetrics.period_end
        })
        .select()
        .single()

      if (error) throw error

      this.emit('gold_calculated', {
        metric_type: metricType,
        record_id: data.id
      })

      return data
    } catch (error) {
      console.error('Gold processing error:', error)
      throw error
    }
  }

  private async calculateGoldMetrics(metricType: string) {
    switch (metricType) {
      case 'store_performance':
        return this.calculateStorePerformance()
      case 'iot_health':
        return this.calculateIoTHealth()
      case 'revenue_analytics':
        return this.calculateRevenueAnalytics()
      default:
        throw new Error(`Unknown metric type: ${metricType}`)
    }
  }

  private async calculateStorePerformance() {
    // Query silver layer for store metrics
    const { data: transactions } = await this.supabase
      .from('silver_transactions')
      .select('store_id, amount, timestamp')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const { data: iotData } = await this.supabase
      .from('silver_iot_telemetry')
      .select('device_id, temperature, humidity, timestamp')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // Aggregate by store
    const storeMetrics = new Map()

    // Process transactions
    transactions?.forEach(tx => {
      if (!storeMetrics.has(tx.store_id)) {
        storeMetrics.set(tx.store_id, {
          revenue: 0,
          transaction_count: 0,
          avg_temperature: [],
          avg_humidity: []
        })
      }
      const metrics = storeMetrics.get(tx.store_id)
      metrics.revenue += tx.amount
      metrics.transaction_count += 1
    })

    // Add IoT metrics
    iotData?.forEach(iot => {
      // Match device to store (simplified)
      const storeId = iot.device_id.split('_')[0]
      if (storeMetrics.has(storeId)) {
        const metrics = storeMetrics.get(storeId)
        if (iot.temperature) metrics.avg_temperature.push(iot.temperature)
        if (iot.humidity) metrics.avg_humidity.push(iot.humidity)
      }
    })

    // Calculate final metrics
    const goldMetrics = Array.from(storeMetrics.entries()).map(([storeId, metrics]) => ({
      store_id: storeId,
      daily_revenue: metrics.revenue,
      transaction_count: metrics.transaction_count,
      avg_transaction: metrics.revenue / metrics.transaction_count,
      avg_temperature: metrics.avg_temperature.reduce((a, b) => a + b, 0) / metrics.avg_temperature.length || null,
      avg_humidity: metrics.avg_humidity.reduce((a, b) => a + b, 0) / metrics.avg_humidity.length || null
    }))

    return {
      stores: goldMetrics,
      period_start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      total_revenue: goldMetrics.reduce((sum, s) => sum + s.daily_revenue, 0),
      total_transactions: goldMetrics.reduce((sum, s) => sum + s.transaction_count, 0)
    }
  }

  private async calculateIoTHealth() {
    const { data: devices } = await this.supabase
      .from('silver_iot_telemetry')
      .select('device_id, battery_level, signal_strength, timestamp')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    const deviceHealth = new Map()

    devices?.forEach(reading => {
      if (!deviceHealth.has(reading.device_id)) {
        deviceHealth.set(reading.device_id, {
          readings: [],
          last_seen: reading.timestamp
        })
      }
      deviceHealth.get(reading.device_id).readings.push({
        battery: reading.battery_level,
        signal: reading.signal_strength
      })
    })

    const healthMetrics = Array.from(deviceHealth.entries()).map(([deviceId, data]) => ({
      device_id: deviceId,
      health_score: this.calculateHealthScore(data.readings),
      last_seen: data.last_seen,
      status: this.getDeviceStatus(data.last_seen)
    }))

    return {
      devices: healthMetrics,
      total_devices: healthMetrics.length,
      healthy_devices: healthMetrics.filter(d => d.health_score > 80).length,
      warning_devices: healthMetrics.filter(d => d.health_score > 50 && d.health_score <= 80).length,
      critical_devices: healthMetrics.filter(d => d.health_score <= 50).length
    }
  }

  private async calculateRevenueAnalytics() {
    // Complex revenue calculations from silver layer
    return {
      daily_revenue: 0,
      weekly_trend: 0,
      top_products: [],
      peak_hours: []
    }
  }

  // Helper methods
  private detectSchemaVersion(payload: any): string {
    // Simple schema versioning based on payload structure
    if (payload.version) return payload.version
    if (payload.telemetry && payload.device_id) return 'iot_v1'
    if (payload.transaction_id && payload.amount) return 'transaction_v1'
    return 'unknown_v1'
  }

  private isHighPriority(source: string): boolean {
    return ['iot_critical', 'pos_transactions', 'alerts'].includes(source)
  }

  private getSilverTable(source: string): string {
    if (source.startsWith('iot_')) return 'silver_iot_telemetry'
    if (source === 'pos_transactions') return 'silver_transactions'
    return 'silver_events'
  }

  private calculateHealthScore(readings: any[]): number {
    if (!readings.length) return 0
    
    const avgBattery = readings.reduce((sum, r) => sum + (r.battery || 0), 0) / readings.length
    const avgSignal = readings.reduce((sum, r) => sum + Math.abs(r.signal || -100), 0) / readings.length
    
    // Weighted score: 60% battery, 40% signal
    return (avgBattery * 0.6) + ((100 - avgSignal) * 0.4)
  }

  private getDeviceStatus(lastSeen: string): string {
    const minutesAgo = (Date.now() - new Date(lastSeen).getTime()) / 60000
    if (minutesAgo < 5) return 'online'
    if (minutesAgo < 30) return 'warning'
    return 'offline'
  }

  // Batch processing methods
  async processBronzeBatch() {
    const { data: pendingRecords } = await this.supabase
      .from('bronze_raw_events')
      .select('id')
      .eq('processing_status', 'pending')
      .limit(100)

    if (pendingRecords) {
      for (const record of pendingRecords) {
        await this.processBronzeToSilver(record.id)
      }
    }
  }

  // Monitoring and health
  async getLayerStats() {
    const stats = {}

    for (const [layer, config] of this.layers.entries()) {
      const tables = Object.values(config.tables).filter(t => t)
      const counts = await Promise.all(
        tables.map(async table => {
          const { count } = await this.supabase
            .from(table!)
            .select('*', { count: 'exact', head: true })
          return { table, count }
        })
      )

      stats[layer] = {
        tables: counts,
        retention_days: config.retention.days,
        active_transformations: config.transformations.filter(t => t.enabled).length
      }
    }

    return stats
  }
}