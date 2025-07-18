'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'
import { TrendingUp, TrendingDown, Clock, ShoppingCart } from 'lucide-react'
import { useTransactionTrends } from '@/hooks/useSupabaseData'

interface TransactionTrendsProps {
  filters: {
    dateRange: string
    location: string
    category: string
    brand: string
  }
  refreshKey: number
}

// Mock data fallback
const generateMockData = () => {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      volume: Math.floor(Math.random() * 500) + 400,
      revenue: Math.floor(Math.random() * 100000) + 80000,
      avgBasket: Math.floor(Math.random() * 50) + 150,
      duration: Math.floor(Math.random() * 2) + 2.5,
      units: Math.floor(Math.random() * 15) + 10
    })
  }
  return data
}

export default function TransactionTrends({ filters }: TransactionTrendsProps) {
  const [viewMode, setViewMode] = useState<'volume' | 'revenue' | 'basket' | 'duration'>('volume')
  const [compareMode, setCompareMode] = useState(false)
  const { data: supabaseData, loading, error } = useTransactionTrends(filters)
  
  // Use Supabase data if available, otherwise use mock data
  const data = supabaseData.length > 0 ? supabaseData.map(item => ({
    date: item.date,
    volume: item.volume,
    revenue: parseFloat(item.revenue),
    avgBasket: parseFloat(item.avg_basket),
    duration: parseFloat(item.duration),
    units: item.units
  })) : generateMockData()
  
  // Calculate summary metrics
  const latestData = data[data.length - 1]
  const previousData = data[data.length - 8]
  const volumeChange = ((latestData.volume - previousData.volume) / previousData.volume) * 100
  const revenueChange = ((latestData.revenue - previousData.revenue) / previousData.revenue) * 100
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transaction data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading data. Using sample data.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Daily Volume</p>
              <p className="text-2xl font-bold text-gray-900">{latestData.volume}</p>
            </div>
            <div className={`flex items-center ${volumeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {volumeChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium ml-1">{Math.abs(volumeChange).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Daily Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₱{latestData.revenue.toLocaleString()}</p>
            </div>
            <div className={`flex items-center ${revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium ml-1">{Math.abs(revenueChange).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* View Mode Selector */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('volume')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'volume' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingCart className="h-4 w-4 inline mr-1" />
          Volume
        </button>
        <button
          onClick={() => setViewMode('revenue')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'revenue' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ₱ Revenue
        </button>
        <button
          onClick={() => setViewMode('basket')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'basket' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Basket Size
        </button>
        <button
          onClick={() => setViewMode('duration')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'duration' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-1" />
          Duration
        </button>
      </div>
      
      {/* Compare Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => setCompareMode(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Compare with previous period
        </label>
      </div>
      
      {/* Chart */}
      <div className="h-64">
        {viewMode === 'volume' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#3B82F6" 
                fill="#93BBFC" 
                strokeWidth={2}
              />
              {compareMode && (
                <Area 
                  type="monotone" 
                  dataKey="units" 
                  stroke="#10B981" 
                  fill="#86EFAC" 
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'revenue' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3B82F6" />
              {compareMode && (
                <Line 
                  type="monotone" 
                  dataKey="avgBasket" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  yAxisId="right"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'basket' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="avgBasket" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'duration' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="duration" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}