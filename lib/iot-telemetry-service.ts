import { createClient } from '@supabase/supabase-js'
import { EventEmitter } from 'events'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface IoTDevice {
  id: string
  name: string
  type: 'temperature' | 'humidity' | 'door' | 'power' | 'pos'
  location: string
  status: 'online' | 'warning' | 'offline'
  last_seen: string
  telemetry?: any
}

export interface IoTAlert {
  id: string
  device_id: string
  store_name: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  created_at: string
  resolved_at?: string
}

export class IoTTelemetryService extends EventEmitter {
  private devices: Map<string, IoTDevice> = new Map()
  private alerts: Map<string, IoTAlert> = new Map()
  private realtimeSubscription: any

  constructor() {
    super()
    this.initialize()
  }

  private async initialize() {
    // Subscribe to real-time IoT updates
    this.realtimeSubscription = supabase
      .channel('iot_telemetry')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'iot_telemetry' },
        (payload) => this.handleTelemetryUpdate(payload)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'iot_alerts' },
        (payload) => this.handleAlertUpdate(payload)
      )
      .subscribe()

    // Load initial data
    await this.loadDevices()
    await this.loadAlerts()
  }

  private async loadDevices() {
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      data.forEach(device => {
        this.devices.set(device.id, device)
      })
    }
  }

  private async loadAlerts() {
    const { data, error } = await supabase
      .from('iot_alerts')
      .select('*')
      .is('resolved_at', null)
      .order('created_at', { ascending: false })

    if (!error && data) {
      data.forEach(alert => {
        this.alerts.set(alert.id, alert)
      })
    }
  }

  private handleTelemetryUpdate(payload: any) {
    const { new: newData, old: oldData, eventType } = payload

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        if (newData) {
          this.emit('telemetry', {
            device_id: newData.device_id,
            data: newData.telemetry,
            timestamp: newData.created_at
          })
          
          // Update device status
          const device = this.devices.get(newData.device_id)
          if (device) {
            device.last_seen = newData.created_at
            device.telemetry = newData.telemetry
            device.status = this.calculateDeviceStatus(newData.telemetry)
            this.emit('device_update', device)
          }
        }
        break
    }
  }

  private handleAlertUpdate(payload: any) {
    const { new: newData, eventType } = payload

    switch (eventType) {
      case 'INSERT':
        if (newData) {
          this.alerts.set(newData.id, newData)
          this.emit('alert_created', newData)
        }
        break
      case 'UPDATE':
        if (newData && newData.resolved_at) {
          this.alerts.delete(newData.id)
          this.emit('alert_resolved', newData)
        }
        break
    }
  }

  private calculateDeviceStatus(telemetry: any): 'online' | 'warning' | 'offline' {
    if (!telemetry) return 'offline'

    // Check for critical conditions
    if (telemetry.temperature > 30 || telemetry.humidity > 80) {
      return 'warning'
    }

    if (telemetry.battery_level && telemetry.battery_level < 20) {
      return 'warning'
    }

    return 'online'
  }

  // Public methods
  async getDevices(): Promise<IoTDevice[]> {
    return Array.from(this.devices.values())
  }

  async getAlerts(): Promise<IoTAlert[]> {
    return Array.from(this.alerts.values())
  }

  async getDeviceMetrics(deviceId: string, timeRange: string = '1h') {
    const { data, error } = await supabase
      .from('iot_telemetry')
      .select('*')
      .eq('device_id', deviceId)
      .gte('created_at', this.getTimeRangeStart(timeRange))
      .order('created_at', { ascending: true })

    return { data, error }
  }

  async getStoreMetrics(storeId: string) {
    const { data: devices } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('store_id', storeId)

    const metrics = {
      total_devices: devices?.length || 0,
      online_devices: 0,
      warning_devices: 0,
      offline_devices: 0,
      avg_temperature: 0,
      avg_humidity: 0,
      alerts: 0
    }

    if (devices) {
      devices.forEach(device => {
        switch (device.status) {
          case 'online': metrics.online_devices++; break
          case 'warning': metrics.warning_devices++; break
          case 'offline': metrics.offline_devices++; break
        }
      })
    }

    return metrics
  }

  private getTimeRangeStart(range: string): string {
    const now = new Date()
    switch (range) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    }
  }

  // Simulate telemetry for testing
  async simulateTelemetry(deviceId: string) {
    const telemetry = {
      temperature: 22 + Math.random() * 8,
      humidity: 55 + Math.random() * 20,
      battery_level: 70 + Math.random() * 30,
      signal_strength: -50 - Math.random() * 30,
      uptime_hours: Math.floor(Math.random() * 720)
    }

    const { error } = await supabase
      .from('iot_telemetry')
      .insert({
        device_id: deviceId,
        telemetry,
        created_at: new Date().toISOString()
      })

    return { telemetry, error }
  }

  destroy() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription)
    }
  }
}

// Singleton instance
export const iotTelemetryService = new IoTTelemetryService()