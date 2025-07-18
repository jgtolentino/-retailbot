'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { 
  TrendingUp, Users, ShoppingCart, DollarSign, 
  Target, Activity, MapPin, Calendar, RefreshCw, AlertCircle
} from 'lucide-react'
import { DataService, DashboardData } from '@/lib/data-service'

// Tab options for different views
const VIEW_TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'sales', label: 'Sales Analytics', icon: DollarSign },
  { id: 'handshake', label: 'Handshake Insights', icon: Target },
  { id: 'geographic', label: 'Geographic', icon: MapPin },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'products', label: 'Products', icon: ShoppingCart }
]

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function ScoutDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    region: 'all',
    storeClass: 'all',
    brand: 'all'
  })
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const dataService = DataService.getInstance()

  // Fetch data based on filters
  useEffect(() => {
    fetchDashboardData()
  }, [filters])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const dashboardData = await dataService.getDashboardData(filters)
      setData(dashboardData)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  // Set up real-time subscriptions
  useEffect(() => {
    const transactionSub = dataService.subscribeToTransactions((payload) => {
      console.log('Transaction update received:', payload)
      // Refresh data when new transactions come in
      fetchDashboardData()
    })

    const productMixSub = dataService.subscribeToProductMix((payload) => {
      console.log('Product mix update received:', payload)
      fetchDashboardData()
    })

    return () => {
      transactionSub.unsubscribe()
      productMixSub.unsubscribe()
    }
  }, [])

  if (loading && !data) {
    return <LoadingDashboard />
  }

  if (error && !data) {
    return <ErrorDashboard error={error} onRetry={fetchDashboardData} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scout Databank Dashboard</h1>
            <p className="text-sm text-gray-500">Real-time Sari-Sari Store Analytics & Insights Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && data && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-800">
              Warning: {error}. Showing cached data.
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white px-6 py-3 border-b">
        <div className="flex items-center gap-4">
          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
          </select>

          <select 
            value={filters.region}
            onChange={(e) => setFilters({...filters, region: e.target.value})}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Locations</option>
            <option value="manila">Manila</option>
            <option value="cebu">Cebu</option>
            <option value="davao">Davao</option>
            <option value="quezon">Quezon City</option>
          </select>

          <select 
            value={filters.storeClass}
            onChange={(e) => setFilters({...filters, storeClass: e.target.value})}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="beverages">Beverages</option>
            <option value="snacks">Snacks</option>
            <option value="personal_care">Personal Care</option>
            <option value="tobacco">Tobacco</option>
            <option value="household">Household</option>
          </select>

          <select 
            value={filters.brand}
            onChange={(e) => setFilters({...filters, brand: e.target.value})}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Brands</option>
            <option value="tbwa">TBWA Brands Only</option>
            <option value="competitors">Competitors</option>
            <option value="local">Local Brands</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 border-b">
        <div className="flex space-x-8">
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard 
            title="Total Sales" 
            value={data?.kpis?.totalSales || "₱0"} 
            change={data?.kpis?.salesChange || "+0%"}
            icon={DollarSign}
            loading={loading}
          />
          <KPICard 
            title="Transaction Count" 
            value={data?.kpis?.transactions || "0"} 
            change={data?.kpis?.transChange || "+0%"}
            icon={ShoppingCart}
            loading={loading}
          />
          <KPICard 
            title="Handshake Success Rate" 
            value={data?.kpis?.handshakeRate || "0%"} 
            change={data?.kpis?.handshakeChange || "+0%"}
            icon={Target}
            loading={loading}
          />
          <KPICard 
            title="TBWA Market Share" 
            value={data?.kpis?.tbwaShare || "0%"} 
            change={data?.kpis?.tbwaChange || "+0%"}
            icon={TrendingUp}
            loading={loading}
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Trends - Large */}
          <div className="lg:col-span-2">
            <ChartBox title="Transaction Trends & Sales Performance" loading={loading}>
              <TransactionTrendsChart 
                data={data?.transactionTrends || []} 
                loading={loading}
              />
            </ChartBox>
          </div>

          {/* Product Mix */}
          <ChartBox title="Product Mix & SKU Analytics" loading={loading}>
            <ProductMixChart 
              data={data?.productMix || []} 
              loading={loading}
            />
          </ChartBox>

          {/* Consumer Behavior */}
          <ChartBox title="Consumer Behavior & Preferences" loading={loading}>
            <ConsumerBehaviorChart 
              data={data?.consumerBehavior || []} 
              loading={loading}
            />
          </ChartBox>

          {/* Consumer Profiles - Wide */}
          <div className="lg:col-span-2">
            <ChartBox title="Consumer Profiles & Segment Analysis" loading={loading}>
              <ConsumerProfilesChart 
                data={data?.consumerProfiles || []} 
                loading={loading}
              />
            </ChartBox>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced KPI Card Component
function KPICard({ title, value, change, icon: Icon, loading }: any) {
  const isPositive = change.startsWith('+')
  
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {loading ? (
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mt-2" />
          ) : (
            <p className={`text-sm mt-2 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${
          loading ? 'bg-gray-100' : 
          isPositive ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            loading ? 'text-gray-400' :
            isPositive ? 'text-green-600' : 'text-red-600'
          }`} />
        </div>
      </div>
    </div>
  )
}

// Enhanced Chart Box Component
function ChartBox({ title, children, loading }: { title: string, children: React.ReactNode, loading?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <div className="h-80">
        {children}
      </div>
    </div>
  )
}

// Real Data Chart Components
function TransactionTrendsChart({ data, loading }: { data: any[], loading: boolean }) {
  if (loading) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No transaction data available</p>
          <p className="text-sm">Check your filters or date range</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value: any, name: string) => [
            name === 'sales' || name === 'tbwaSales' 
              ? `₱${value.toLocaleString()}` 
              : value.toLocaleString(),
            name === 'sales' ? 'Total Sales' : 
            name === 'tbwaSales' ? 'TBWA Sales' : 'Transactions'
          ]} 
        />
        <Area type="monotone" dataKey="sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
        <Area type="monotone" dataKey="tbwaSales" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function ProductMixChart({ data, loading }: { data: any[], loading: boolean }) {
  if (loading) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No product mix data available</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percentage }) => `${category} ${percentage.toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Percentage']} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function ConsumerBehaviorChart({ data, loading }: { data: any[], loading: boolean }) {
  if (loading) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No consumer behavior data available</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="method" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="accepted" fill="#10B981" name="Accepted" />
        <Bar dataKey="suggested" fill="#3B82F6" name="Suggested" />
      </BarChart>
    </ResponsiveContainer>
  )
}

function ConsumerProfilesChart({ data, loading }: { data: any[], loading: boolean }) {
  if (loading) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No consumer profile data available</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="age_group" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#3B82F6" name="Count" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Loading and Error Components
function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
        <p className="text-gray-600">Fetching your analytics data from Supabase...</p>
      </div>
    </div>
  )
}

function ErrorDashboard({ error, onRetry }: { error: string, onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-x-4">
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry Connection
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  )
}