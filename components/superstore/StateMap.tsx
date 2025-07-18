'use client'

import { MapPin, TrendingUp } from 'lucide-react'

interface StateData {
  state: string
  revenue: number
  color: string
}

interface StateMapProps {
  states: StateData[]
  loading?: boolean
  onStateClick?: (state: StateData) => void
}

export default function StateMap({ states, loading = false, onStateClick }: StateMapProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleStateClick = (state: StateData) => {
    if (onStateClick) {
      onStateClick(state)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 5 States</h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!states || states.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 5 States</h3>
        </div>
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No state data available</p>
          <p className="text-sm text-gray-400">Adjust your filters to see data</p>
        </div>
      </div>
    )
  }

  // Sort states by revenue (descending)
  const sortedStates = [...states].sort((a, b) => b.revenue - a.revenue)
  const maxRevenue = sortedStates[0]?.revenue || 0

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 5 States by Revenue</h3>
        </div>
        <div className="text-sm text-gray-500">
          {sortedStates.length} states
        </div>
      </div>

      {/* State Cards */}
      <div className="space-y-3">
        {sortedStates.map((state, index) => {
          const percentage = maxRevenue > 0 ? (state.revenue / maxRevenue) * 100 : 0
          
          return (
            <div
              key={state.state}
              onClick={() => handleStateClick(state)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {state.state}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(state.revenue)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Revenue Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: state.color
                  }}
                ></div>
              </div>
              
              {/* Hover indicator */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>Click to drill down</span>
                  <MapPin className="w-3 h-3" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">Total Revenue (Top 5 States)</div>
        <div className="text-xl font-bold text-gray-900">
          {formatCurrency(sortedStates.reduce((sum, state) => sum + state.revenue, 0))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Represents {((sortedStates.reduce((sum, state) => sum + state.revenue, 0) / 500000) * 100).toFixed(1)}% of total revenue
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span>Highest performing</span>
          <div className="w-3 h-3 bg-blue-300 rounded-full ml-4"></div>
          <span>Lowest performing</span>
        </div>
      </div>
    </div>
  )
}