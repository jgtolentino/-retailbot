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
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts'
import { MapPin } from 'lucide-react'

interface ConsumerProfilingProps {
  filters: {
    dateRange: string
    location: string
    category: string
    brand: string
  }
  refreshKey: number
}

// Mock data
const ageDistribution = [
  { age: '18-24', male: 15, female: 18, total: 33 },
  { age: '25-34', male: 25, female: 28, total: 53 },
  { age: '35-44', male: 22, female: 20, total: 42 },
  { age: '45-54', male: 18, female: 16, total: 34 },
  { age: '55+', male: 12, female: 14, total: 26 }
]

const locationData = [
  { name: 'Metro Manila', value: 3500, color: '#3B82F6' },
  { name: 'Central Luzon', value: 2100, color: '#10B981' },
  { name: 'Calabarzon', value: 1800, color: '#F59E0B' },
  { name: 'Western Visayas', value: 1200, color: '#8B5CF6' },
  { name: 'Central Visayas', value: 900, color: '#EC4899' },
  { name: 'Davao Region', value: 700, color: '#EF4444' },
  { name: 'Others', value: 800, color: '#6B7280' }
]


const behaviorByDemo = [
  { segment: 'Young Urban', avgBasket: 185, frequency: 4.2, loyalty: 72 },
  { segment: 'Family Shoppers', avgBasket: 245, frequency: 3.1, loyalty: 85 },
  { segment: 'Senior Citizens', avgBasket: 156, frequency: 2.8, loyalty: 91 },
  { segment: 'Students', avgBasket: 95, frequency: 5.6, loyalty: 45 },
  { segment: 'Professionals', avgBasket: 312, frequency: 2.3, loyalty: 68 }
]

export default function ConsumerProfiling({ }: ConsumerProfilingProps) {
  const [viewMode, setViewMode] = useState<'age' | 'location' | 'demographic' | 'behavior'>('demographic')
  
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
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-xl font-bold text-gray-900">11,000</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Avg Age</p>
          <p className="text-xl font-bold text-blue-600">32.5</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Gender Split</p>
          <p className="text-xl font-bold text-purple-600">48/52</p>
        </div>
      </div>
      
      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('demographic')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'demographic' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Demographics
        </button>
        <button
          onClick={() => setViewMode('age')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'age' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Age & Gender
        </button>
        <button
          onClick={() => setViewMode('location')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'location' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Location
        </button>
        <button
          onClick={() => setViewMode('behavior')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'behavior' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Segment Behavior
        </button>
      </div>
      
      {/* Charts */}
      <div className="h-64">
        {viewMode === 'age' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="male" fill="#3B82F6" />
              <Bar dataKey="female" fill="#EC4899" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'location' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'demographic' && (
          <div className="h-full p-4">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Income Distribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">High Income</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="w-1/4 h-2 bg-blue-600 rounded-full" />
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Middle Income</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="w-3/5 h-2 bg-green-600 rounded-full" />
                      </div>
                      <span className="text-sm font-medium">58%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Income</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="w-1/6 h-2 bg-yellow-600 rounded-full" />
                      </div>
                      <span className="text-sm font-medium">17%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Urban vs Rural</h4>
                <div className="flex items-center justify-center h-32">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">71%</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">29%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded" />
                    <span>Urban</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded" />
                    <span>Rural</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'behavior' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={behaviorByDemo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="avgBasket" fill="#3B82F6" />
              <Line yAxisId="right" type="monotone" dataKey="loyalty" stroke="#10B981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Location Insights */}
      <div className="bg-purple-50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-900">Geographic Insight</p>
            <p className="text-sm text-purple-700">
              Metro Manila accounts for 35% of customers but 45% of revenue, indicating higher purchasing power.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}