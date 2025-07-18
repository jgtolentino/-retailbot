'use client'

import { useState } from 'react'
import {
  FunnelChart,
  Funnel,
  LabelList,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Heart, Sparkles } from 'lucide-react'

interface ConsumerBehaviorProps {
  filters: {
    dateRange: string
    location: string
    category: string
    brand: string
  }
  refreshKey: number
}

// Mock data
const funnelData = [
  { name: 'Store Visit', value: 1000, fill: '#3B82F6' },
  { name: 'Product Browse', value: 850, fill: '#10B981' },
  { name: 'Brand Request', value: 650, fill: '#F59E0B' },
  { name: 'Accept Suggestion', value: 480, fill: '#8B5CF6' },
  { name: 'Purchase', value: 420, fill: '#EC4899' }
]

const requestMethodData = [
  { method: 'Branded Request', value: 65, percentage: 65 },
  { method: 'Generic Request', value: 25, percentage: 25 },
  { method: 'Store Suggestion', value: 10, percentage: 10 }
]

const acceptanceRateData = [
  { category: 'Beverages', suggested: 234, accepted: 189, rate: 80.8 },
  { category: 'Snacks', suggested: 156, accepted: 98, rate: 62.8 },
  { category: 'Personal Care', suggested: 178, accepted: 134, rate: 75.3 },
  { category: 'Household', suggested: 145, accepted: 87, rate: 60.0 }
]

const behaviorRadarData = [
  { trait: 'Brand Loyalty', A: 120, B: 110, fullMark: 150 },
  { trait: 'Price Sensitivity', A: 98, B: 130, fullMark: 150 },
  { trait: 'Quality Focus', A: 86, B: 130, fullMark: 150 },
  { trait: 'Convenience', A: 99, B: 100, fullMark: 150 },
  { trait: 'Innovation', A: 85, B: 90, fullMark: 150 },
  { trait: 'Sustainability', A: 65, B: 85, fullMark: 150 }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function ConsumerBehavior({ }: ConsumerBehaviorProps) {
  const [viewMode, setViewMode] = useState<'funnel' | 'request' | 'acceptance' | 'traits'>('funnel')
  
  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="text-xl font-bold text-gray-900">42%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Suggestion Accept</p>
          <p className="text-xl font-bold text-green-600">73.8%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Brand Loyalty</p>
          <p className="text-xl font-bold text-blue-600">68%</p>
        </div>
      </div>
      
      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('funnel')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'funnel' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Purchase Funnel
        </button>
        <button
          onClick={() => setViewMode('request')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'request' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Request Methods
        </button>
        <button
          onClick={() => setViewMode('acceptance')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'acceptance' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Acceptance Rates
        </button>
        <button
          onClick={() => setViewMode('traits')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'traits' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Behavior Traits
        </button>
      </div>
      
      {/* Charts */}
      <div className="h-64">
        {viewMode === 'funnel' && (
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel
                dataKey="value"
                data={funnelData}
                isAnimationActive
              >
                <LabelList position="center" fill="#fff" stroke="none" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'request' && (
          <div className="space-y-4 p-4">
            {requestMethodData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.method}</span>
                  <span className="text-sm text-gray-500">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
            
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 65% of customers make specific brand requests</li>
                <li>• Store suggestions have 73.8% acceptance rate</li>
                <li>• Generic requests often lead to higher-margin sales</li>
              </ul>
            </div>
          </div>
        )}
        
        {viewMode === 'acceptance' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={acceptanceRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="suggested" fill="#E5E7EB" />
              <Bar dataKey="accepted" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'traits' && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={behaviorRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 150]} />
              <Radar name="Current Period" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Previous Period" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Behavior Indicators */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">High Brand Affinity</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">68% repeat purchase rate</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Discovery Oriented</span>
          </div>
          <p className="text-xs text-green-700 mt-1">23% try new products</p>
        </div>
      </div>
    </div>
  )
}