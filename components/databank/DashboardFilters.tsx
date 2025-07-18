'use client'

import { Calendar, MapPin, Package, Tag, Wifi, WifiOff } from 'lucide-react'
import { useDimensionFilter } from '../../hooks/useMasterToggleAgent'

interface DashboardFiltersProps {
  filters: {
    dateRange: string
    location: string
    category: string
    brand: string
  }
  onFiltersChange: (filters: {
    dateRange: string
    location: string
    category: string
    brand: string
  }) => void
}

export default function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  // Use Master Toggle Agent for dynamic filter options
  const regionFilter = useDimensionFilter('region')
  const categoryFilter = useDimensionFilter('category')
  const brandFilter = useDimensionFilter('brand')

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-2">
        {regionFilter.isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" title="Connected to Master Toggle Agent" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" title="Disconnected from Master Toggle Agent" />
        )}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          className="block w-40 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="last90days">Last 90 Days</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Location Filter - Dynamic options from Master Toggle Agent */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-400" />
        <select
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="block w-40 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={regionFilter.isLoading}
        >
          <option value="all">All Locations</option>
          {regionFilter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.display_name || option.value}
            </option>
          ))}
        </select>
        {regionFilter.isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        )}
      </div>

      {/* Category Filter - Dynamic options from Master Toggle Agent */}
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-gray-400" />
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="block w-40 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={categoryFilter.isLoading}
        >
          <option value="all">All Categories</option>
          {categoryFilter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.display_name || option.value}
            </option>
          ))}
        </select>
        {categoryFilter.isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        )}
      </div>

      {/* Brand Filter - Dynamic options from Master Toggle Agent */}
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-gray-400" />
        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          className="block w-40 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={brandFilter.isLoading}
        >
          <option value="all">All Brands</option>
          {brandFilter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.display_name || option.value}
            </option>
          ))}
        </select>
        {brandFilter.isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        )}
      </div>

      {/* Error Display */}
      {(regionFilter.error || categoryFilter.error || brandFilter.error) && (
        <div className="text-red-500 text-sm">
          Filter update failed - using cached options
        </div>
      )}
    </div>
  )
}