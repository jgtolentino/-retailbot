import { LyraAgent } from './lyraAgent'
import { SupabaseClient } from '@supabase/supabase-js'

export interface IoTDevicePayload {
  device_id: string
  device_type: string
  timestamp: string
  telemetry: {
    temperature?: number
    humidity?: number
    pressure?: number
    battery_level?: number
    signal_strength?: number
    location?: {
      lat: number
      lng: number
    }
  }
  metadata?: {
    firmware_version?: string
    uptime_seconds?: number
    error_count?: number
  }
}

export class LyraIoTAdapter {
  private lyraAgent: LyraAgent
  private supabase: SupabaseClient

  constructor(lyraAgent: LyraAgent, supabase: SupabaseClient) {
    this.lyraAgent = lyraAgent
    this.supabase = supabase
  }

  // Process IoT telemetry through Lyra
  async ingestIoTTelemetry(telemetry: IoTDevicePayload) {
    // Queue for Lyra processing
    const { error } = await this.supabase
      .from('pull_queue')
      .insert({
        source: `iot_${telemetry.device_type}`,
        payload: telemetry,
        status: 'pending'
      })

    if (error) throw error
  }

  // Batch ingest for multiple devices
  async batchIngestTelemetry(telemetryBatch: IoTDevicePayload[]) {
    const queueItems = telemetryBatch.map(telemetry => ({
      source: `iot_${telemetry.device_type}`,
      payload: telemetry,
      status: 'pending'
    }))

    const { error } = await this.supabase
      .from('pull_queue')
      .insert(queueItems)

    if (error) throw error
  }

  // Schema registry for IoT devices
  async registerDeviceSchema(deviceType: string, schema: any) {
    await this.supabase
      .from('master_schemas')
      .upsert({
        source: `iot_${deviceType}`,
        schema: {
          device_type: deviceType,
          telemetry_fields: schema.telemetry,
          metadata_fields: schema.metadata,
          registered_at: new Date().toISOString()
        }
      })
  }
}

// Example IoT telemetry processing
export const iotTelemetrySchema = {
  // Smart store sensors
  store_sensor: {
    telemetry: {
      temperature: { type: 'number', unit: 'celsius', range: [-20, 50] },
      humidity: { type: 'number', unit: 'percent', range: [0, 100] },
      foot_traffic: { type: 'number', unit: 'count', range: [0, 1000] },
      door_status: { type: 'boolean' },
      power_consumption: { type: 'number', unit: 'watts' }
    },
    metadata: {
      store_id: { type: 'string', required: true },
      sensor_location: { type: 'string' },
      last_maintenance: { type: 'timestamp' }
    }
  },

  // Refrigeration units
  refrigerator: {
    telemetry: {
      temperature: { type: 'number', unit: 'celsius', range: [-30, 10] },
      compressor_status: { type: 'boolean' },
      door_open_count: { type: 'number' },
      energy_usage: { type: 'number', unit: 'kwh' }
    },
    metadata: {
      unit_id: { type: 'string', required: true },
      capacity_liters: { type: 'number' },
      product_category: { type: 'string' }
    }
  },

  // POS terminals
  pos_terminal: {
    telemetry: {
      transaction_count: { type: 'number' },
      uptime_hours: { type: 'number' },
      network_latency: { type: 'number', unit: 'ms' },
      printer_status: { type: 'string', enum: ['ok', 'low_paper', 'error'] }
    },
    metadata: {
      terminal_id: { type: 'string', required: true },
      software_version: { type: 'string' },
      last_transaction: { type: 'timestamp' }
    }
  }
}

// IoT-specific Lyra configuration
export const iotLyraConfig = {
  agentId: 'lyra-iot-primary',
  role: 'primary' as const,
  heartbeatInterval: 1000,
  failoverTimeout: 5000,
  pullQueueInterval: 500, // Faster for real-time IoT
  iotSpecific: {
    batchSize: 100,
    compressionEnabled: true,
    anomalyDetection: true,
    edgeProcessing: false
  }
}