'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Thermometer, Droplets, Zap, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Real-time WebSocket connection for IoT telemetry
function useIoTTelemetry() {
  const [telemetry, setTelemetry] = useState<any>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Connect to Lyra WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:8080')
    
    ws.onopen = () => {
      console.log('Connected to IoT telemetry stream')
      setConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'telemetry_update') {
        setTelemetry(data.payload)
      }
    }

    ws.onclose = () => {
      setConnected(false)
    }

    return () => ws.close()
  }, [])

  return { telemetry, connected }
}

export default function IoTDashboard() {
  const { telemetry, connected } = useIoTTelemetry()
  const [selectedStore, setSelectedStore] = useState('all')
  const [timeRange, setTimeRange] = useState('1h')

  // Mock data for initial render
  const mockStoreData = {
    summary: {
      total_stores: 1247,
      active_sensors: 4988,
      alerts: 23,
      avg_temperature: 24.5,
      avg_humidity: 65,
      total_foot_traffic: 15234
    },
    stores: [
      { id: 'S001', name: 'Aling Rosa Store', location: 'Quezon City', status: 'normal', temp: 25.2, humidity: 62 },
      { id: 'S002', name: 'Mang Juan Sari-Sari', location: 'Makati', status: 'warning', temp: 28.5, humidity: 71 },
      { id: 'S003', name: 'Tindahan ni Ate', location: 'Pasig', status: 'normal', temp: 24.8, humidity: 64 },
      { id: 'S004', name: 'Ka Pedro Store', location: 'Taguig', status: 'critical', temp: 31.2, humidity: 78 }
    ],
    temperatureHistory: [
      { time: '00:00', temp: 24.5, humidity: 65 },
      { time: '04:00', temp: 23.8, humidity: 68 },
      { time: '08:00', temp: 25.2, humidity: 64 },
      { time: '12:00', temp: 27.5, humidity: 60 },
      { time: '16:00', temp: 26.8, humidity: 62 },
      { time: '20:00', temp: 25.0, humidity: 66 },
      { time: '24:00', temp: 24.2, humidity: 67 }
    ],
    deviceTypes: [
      { name: 'Temperature Sensors', value: 1247, color: '#ef4444' },
      { name: 'Humidity Sensors', value: 1247, color: '#3b82f6' },
      { name: 'Door Sensors', value: 892, color: '#10b981' },
      { name: 'Power Meters', value: 1100, color: '#f59e0b' },
      { name: 'POS Terminals', value: 1502, color: '#8b5cf6' }
    ],
    alerts: [
      { id: 1, store: 'Mang Juan Sari-Sari', type: 'temperature', message: 'Temperature above threshold (28.5°C)', severity: 'warning', time: '5 mins ago' },
      { id: 2, store: 'Ka Pedro Store', type: 'refrigeration', message: 'Refrigerator unit offline', severity: 'critical', time: '15 mins ago' },
      { id: 3, store: 'Tindahan ni Ate', type: 'power', message: 'Unusual power consumption spike', severity: 'info', time: '1 hour ago' }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">IoT Telemetry Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring of sari-sari store sensors</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <select 
            className="px-3 py-2 border rounded-md"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStoreData.summary.total_stores.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStoreData.summary.active_sensors.toLocaleString()}</div>
            <Progress value={95} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStoreData.summary.avg_temperature}°C</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" /> -0.5°C from avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStoreData.summary.avg_humidity}%</div>
            <p className="text-xs text-muted-foreground">Optimal range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foot Traffic</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStoreData.summary.total_foot_traffic.toLocaleString()}</div>
            <p className="text-xs text-green-600">+23% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{mockStoreData.summary.alerts}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Temperature & Humidity Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Temperature & Humidity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockStoreData.temperatureHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Temperature (°C)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Humidity (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Types */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockStoreData.deviceTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockStoreData.deviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStoreData.stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(store.status)}`} />
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-muted-foreground">{store.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Temperature</p>
                        <p className="font-medium">{store.temp}°C</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Humidity</p>
                        <p className="font-medium">{store.humidity}%</p>
                      </div>
                      <Badge variant={store.status === 'normal' ? 'default' : store.status === 'warning' ? 'secondary' : 'destructive'}>
                        {store.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Health Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-full h-8 rounded ${
                      Math.random() > 0.1 ? 'bg-green-500' : Math.random() > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    title={`Sensor ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-sm">Offline</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStoreData.alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <p className="font-medium">{alert.store}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'secondary' : 'default'}>
                      {alert.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}