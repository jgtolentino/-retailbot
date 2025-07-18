'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { ArrowRight, TrendingUp } from 'lucide-react'

interface ProductMixAnalyticsProps {
  filters: {
    dateRange: string
    location: string
    category: string
    brand: string
  }
  refreshKey: number
}

// Color palette
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

// Mock data
const categoryData = [
  { name: 'Beverages', value: 35, skus: 145, revenue: 456789 },
  { name: 'Snacks', value: 25, skus: 89, revenue: 324567 },
  { name: 'Personal Care', value: 20, skus: 67, revenue: 259876 },
  { name: 'Household', value: 15, skus: 45, revenue: 194532 },
  { name: 'Others', value: 5, skus: 23, revenue: 64876 }
]

const paretoData = [
  { sku: 'SKU-001', revenue: 89234, units: 2341, cumulative: 20 },
  { sku: 'SKU-002', revenue: 67890, units: 1892, cumulative: 35 },
  { sku: 'SKU-003', revenue: 56789, units: 1567, cumulative: 48 },
  { sku: 'SKU-004', revenue: 45678, units: 1234, cumulative: 58 },
  { sku: 'SKU-005', revenue: 34567, units: 987, cumulative: 66 },
  { sku: 'SKU-006', revenue: 28934, units: 823, cumulative: 72 },
  { sku: 'SKU-007', revenue: 23456, units: 678, cumulative: 77 },
  { sku: 'SKU-008', revenue: 19876, units: 543, cumulative: 82 }
]

const substitutionData = [
  { source: 'Brand A Cola', target: 'Brand B Cola', value: 234 },
  { source: 'Brand A Cola', target: 'Generic Cola', value: 156 },
  { source: 'Brand B Chips', target: 'Brand A Chips', value: 189 },
  { source: 'Premium Shampoo', target: 'Regular Shampoo', value: 267 },
  { source: 'Regular Shampoo', target: 'Budget Shampoo', value: 145 }
]

const basketComposition = [
  { category: 'Beverages', morning: 45, afternoon: 35, evening: 20 },
  { category: 'Snacks', morning: 20, afternoon: 45, evening: 35 },
  { category: 'Personal Care', morning: 30, afternoon: 25, evening: 45 },
  { category: 'Household', morning: 25, afternoon: 30, evening: 45 }
]

export default function ProductMixAnalytics({ }: ProductMixAnalyticsProps) {
  const [viewMode, setViewMode] = useState<'pareto' | 'mix' | 'substitution' | 'basket'>('mix')
  
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ color: string; name: string; value: number }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }
  
  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total SKUs</p>
          <p className="text-xl font-bold text-gray-900">369</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Active SKUs</p>
          <p className="text-xl font-bold text-green-600">342</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">New SKUs</p>
          <p className="text-xl font-bold text-blue-600">12</p>
        </div>
      </div>
      
      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('mix')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'mix' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Category Mix
        </button>
        <button
          onClick={() => setViewMode('pareto')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'pareto' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pareto Analysis
        </button>
        <button
          onClick={() => setViewMode('substitution')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'substitution' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Substitutions
        </button>
        <button
          onClick={() => setViewMode('basket')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'basket' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Basket Analysis
        </button>
      </div>
      
      {/* Charts */}
      <div className="h-64">
        {viewMode === 'mix' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'pareto' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paretoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sku" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" />
              <Bar yAxisId="right" dataKey="cumulative" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'substitution' && (
          <div className="space-y-3 p-4">
            <h3 className="text-sm font-medium text-gray-700">Product Substitution Patterns</h3>
            {substitutionData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{item.source}</span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.value} switches</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.target}</span>
              </div>
            ))}
          </div>
        )}
        
        {viewMode === 'basket' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={basketComposition}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="morning" stackId="a" fill="#FCD34D" />
              <Bar dataKey="afternoon" stackId="a" fill="#F59E0B" />
              <Bar dataKey="evening" stackId="a" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Insights */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Key Insight</p>
            <p className="text-sm text-blue-700">
              Top 20% of SKUs generate 80% of revenue. Consider optimizing inventory for high-performing items.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}