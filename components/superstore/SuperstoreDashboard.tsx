'use client'

import { useState, useEffect } from 'react'
import { Calendar, Filter, TrendingUp, Users, DollarSign, Package, MapPin } from 'lucide-react'
import KPIBox from './KPIBox'
import RevenueTrendChart from './RevenueTrendChart'
import CustomerTable from './CustomerTable'
import StateMap from './StateMap'
import FiltersPanel from './FiltersPanel'
import { DataService } from '@/lib/data-service'

// Scout Retail Dashboard - Superstore Clone
// Integrates with RetailBot, Claudia, and LearnBot agents

interface DashboardFilters {
  year: number
  region: string
  segment: string
  category: string
}

interface DashboardState {
  kpis: {
    transactions: { value: number; delta: number; trend: 'up' | 'down' | 'stable' }
    revenue: { value: number; delta: number; trend: 'up' | 'down' | 'stable' }
    profit: { value: number; delta: number; trend: 'up' | 'down' | 'stable' }
    items: { value: number; delta: number; trend: 'up' | 'down' | 'stable' }
  }
  trends: any[]
  customers: any[]
  states: any[]
  narrative: string
  loading: boolean
  error: string | null
}

export default function SuperstoreDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    year: 2024,
    region: 'all',
    segment: 'all',
    category: 'all'
  })
  
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    kpis: {
      transactions: { value: 0, delta: 0, trend: 'stable' },
      revenue: { value: 0, delta: 0, trend: 'stable' },
      profit: { value: 0, delta: 0, trend: 'stable' },
      items: { value: 0, delta: 0, trend: 'stable' }
    },
    trends: [],
    customers: [],
    states: [],
    narrative: 'Loading dashboard data...',
    loading: true,
    error: null
  })

  const dataService = DataService.getInstance()

  // Simulate agent collaboration
  const processWithAgents = async (newFilters: DashboardFilters) => {
    try {
      setDashboardState(prev => ({ ...prev, loading: true, error: null }))
      
      // Step 1: Claudia synchronizes filters
      console.log('🤖 Claudia: Synchronizing filters across components...', newFilters)
      
      // Step 2: RetailBot calculates KPIs
      console.log('🤖 RetailBot: Calculating KPIs and trends...')
      const kpiData = await simulateRetailBotKPIs(newFilters)
      
      // Step 3: Fetch supporting data
      const [trendData, customerData, stateData] = await Promise.all([
        simulateRevenueTrends(newFilters),
        simulateCustomerData(newFilters),
        simulateStateData(newFilters)
      ])
      
      // Step 4: LearnBot generates narrative
      console.log('🤖 LearnBot: Generating insights and narrative...')
      const narrative = await simulateLearnBotNarrative(newFilters, kpiData)
      
      setDashboardState({
        kpis: kpiData,
        trends: trendData,
        customers: customerData,
        states: stateData,
        narrative,
        loading: false,
        error: null
      })
      
    } catch (error) {
      console.error('Dashboard error:', error)
      setDashboardState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  // Initialize dashboard
  useEffect(() => {
    processWithAgents(filters)
  }, [filters])

  // Handle filter changes through Claudia
  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    console.log('🤖 Claudia: Filter change detected, orchestrating updates...')
  }

  // Generate filter summary text
  const getFilterSummary = () => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => value !== 'all' && value !== 2024)
    if (activeFilters.length === 0) return 'Showing all data across all regions and segments'
    
    const filterText = activeFilters.map(([key, value]) => `${key}: ${value}`).join(', ')
    return `Showing ${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} applied: ${filterText}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scout Retail Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Superstore Edition — Powered by Scout Intelligence</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Narrative */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="px-6 py-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium">{getFilterSummary()}</p>
              <p className="text-sm text-blue-700 mt-1">{dashboardState.narrative}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <FiltersPanel 
        filters={filters} 
        onFilterChange={handleFilterChange}
        loading={dashboardState.loading}
      />

      {/* Main Content */}
      <div className="p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPIBox
            title="Transactions"
            value={dashboardState.kpis.transactions.value}
            delta={dashboardState.kpis.transactions.delta}
            trend={dashboardState.kpis.transactions.trend}
            icon={Package}
            loading={dashboardState.loading}
            onClick={() => console.log('🤖 Claudia: Drill down on transactions')}
          />
          <KPIBox
            title="Total Revenue"
            value={dashboardState.kpis.revenue.value}
            delta={dashboardState.kpis.revenue.delta}
            trend={dashboardState.kpis.revenue.trend}
            icon={DollarSign}
            loading={dashboardState.loading}
            prefix="$"
            onClick={() => console.log('🤖 Claudia: Drill down on revenue')}
          />
          <KPIBox
            title="Profit"
            value={dashboardState.kpis.profit.value}
            delta={dashboardState.kpis.profit.delta}
            trend={dashboardState.kpis.profit.trend}
            icon={TrendingUp}
            loading={dashboardState.loading}
            prefix="$"
            onClick={() => console.log('🤖 Claudia: Drill down on profit')}
          />
          <KPIBox
            title="Items Sold"
            value={dashboardState.kpis.items.value}
            delta={dashboardState.kpis.items.delta}
            trend={dashboardState.kpis.items.trend}
            icon={Users}
            loading={dashboardState.loading}
            onClick={() => console.log('🤖 Claudia: Drill down on items')}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2">
            <RevenueTrendChart 
              data={dashboardState.trends}
              loading={dashboardState.loading}
              onDataPointClick={(point) => console.log('🤖 Claudia: Drill down on date', point)}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Table */}
          <CustomerTable 
            customers={dashboardState.customers}
            loading={dashboardState.loading}
            onCustomerClick={(customer) => console.log('🤖 Claudia: Drill down on customer', customer)}
          />

          {/* State Map */}
          <StateMap 
            states={dashboardState.states}
            loading={dashboardState.loading}
            onStateClick={(state) => console.log('🤖 Claudia: Drill down on state', state)}
          />
        </div>
      </div>

      {/* Error Toast */}
      {dashboardState.error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Error: {dashboardState.error}
        </div>
      )}
    </div>
  )
}

// Simulate agent responses (replace with actual MCP calls)
async function simulateRetailBotKPIs(filters: DashboardFilters) {
  // Simulate RetailBot KPI calculation
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return {
    transactions: { value: 2547, delta: 12.5, trend: 'up' as const },
    revenue: { value: 485230, delta: 8.7, trend: 'up' as const },
    profit: { value: 97046, delta: -2.3, trend: 'down' as const },
    items: { value: 5843, delta: 15.2, trend: 'up' as const }
  }
}

async function simulateRevenueTrends(filters: DashboardFilters) {
  // Simulate daily revenue trends
  await new Promise(resolve => setTimeout(resolve, 600))
  
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    revenue: Math.floor(Math.random() * 20000) + 15000,
    profit: Math.floor(Math.random() * 5000) + 3000
  }))
}

async function simulateCustomerData(filters: DashboardFilters) {
  // Simulate customer table data
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Customer ${i + 1}`,
    orders: Math.floor(Math.random() * 20) + 5,
    totalValue: Math.floor(Math.random() * 50000) + 10000
  }))
}

async function simulateStateData(filters: DashboardFilters) {
  // Simulate state performance data
  await new Promise(resolve => setTimeout(resolve, 400))
  
  return [
    { state: 'California', revenue: 125000, color: '#1e40af' },
    { state: 'Texas', revenue: 98000, color: '#3b82f6' },
    { state: 'New York', revenue: 87000, color: '#60a5fa' },
    { state: 'Florida', revenue: 76000, color: '#93c5fd' },
    { state: 'Illinois', revenue: 65000, color: '#bfdbfe' }
  ]
}

async function simulateLearnBotNarrative(filters: DashboardFilters, kpis: any) {
  // Simulate LearnBot narrative generation
  await new Promise(resolve => setTimeout(resolve, 700))
  
  const revenueGrowth = kpis.revenue.delta > 0 ? 'increased' : 'decreased'
  const profitStatus = kpis.profit.delta > 0 ? 'improved' : 'declined'
  
  return `Revenue has ${revenueGrowth} by ${Math.abs(kpis.revenue.delta)}% while profit margins have ${profitStatus} by ${Math.abs(kpis.profit.delta)}%. The West region continues to show strong performance with consistent growth in technology and furniture segments.`
}