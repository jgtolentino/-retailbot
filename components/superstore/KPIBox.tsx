'use client'

import { LucideIcon } from 'lucide-react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface KPIBoxProps {
  title: string
  value: number
  delta: number
  trend: 'up' | 'down' | 'stable'
  icon: LucideIcon
  loading?: boolean
  prefix?: string
  suffix?: string
  onClick?: () => void
}

export default function KPIBox({ 
  title, 
  value, 
  delta, 
  trend, 
  icon: Icon, 
  loading = false,
  prefix = '',
  suffix = '',
  onClick 
}: KPIBoxProps) {
  const formatValue = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const getTrendColor = (trend: string, delta: number) => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return ArrowUp
    if (trend === 'down') return ArrowDown
    return Minus
  }

  const getTrendBgColor = (trend: string) => {
    if (trend === 'up') return 'bg-green-50'
    if (trend === 'down') return 'bg-red-50'
    return 'bg-gray-50'
  }

  const TrendIcon = getTrendIcon(trend)

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {title}
              </h3>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {prefix}{formatValue(value)}{suffix}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendBgColor(trend)}`}>
                    <TrendIcon className={`w-3 h-3 ${getTrendColor(trend, delta)}`} />
                    <span className={getTrendColor(trend, delta)}>
                      {Math.abs(delta).toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
              </>
            )}
          </div>
          
          {/* Trend visualization */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getTrendBgColor(trend)}`}>
            <Icon className={`w-8 h-8 ${getTrendColor(trend, delta)}`} />
          </div>
        </div>
      </div>
      
      {/* Hover effect indicator */}
      {onClick && (
        <div className="border-t border-gray-100 px-6 py-2">
          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <span>Click to drill down</span>
            <ArrowUp className="w-3 h-3 rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}