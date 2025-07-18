'use client'

import { Filter, Calendar, MapPin, Users, Package, RefreshCw } from 'lucide-react'

interface DashboardFilters {
  year: number
  region: string
  segment: string
  category: string
}

interface FiltersPanelProps {
  filters: DashboardFilters
  onFilterChange: (filters: Partial<DashboardFilters>) => void
  loading?: boolean
}

export default function FiltersPanel({ filters, onFilterChange, loading = false }: FiltersPanelProps) {
  const years = [2021, 2022, 2023, 2024]
  
  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'west', label: 'West' },
    { value: 'east', label: 'East' },
    { value: 'central', label: 'Central' },
    { value: 'south', label: 'South' }
  ]

  const segments = [
    { value: 'all', label: 'All Segments' },
    { value: 'consumer', label: 'Consumer' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'home_office', label: 'Home Office' }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'office_supplies', label: 'Office Supplies' }
  ]

  const handleFilterChange = (key: keyof DashboardFilters, value: string | number) => {
    onFilterChange({ [key]: value })
  }

  const clearAllFilters = () => {
    onFilterChange({
      year: 2024,
      region: 'all',
      segment: 'all',
      category: 'all'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.year !== 2024) count++
    if (filters.region !== 'all') count++
    if (filters.segment !== 'all') count++
    if (filters.category !== 'all') count++
    return count
  }

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-700">Filters</h3>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()} active
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-sm text-gray-600">Year:</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', Number(e.target.value))}
                  disabled={loading}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <label className="text-sm text-gray-600">Region:</label>
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  disabled={loading}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {regions.map(region => (
                    <option key={region.value} value={region.value}>{region.label}</option>
                  ))}
                </select>
              </div>

              {/* Segment Filter */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <label className="text-sm text-gray-600">Segment:</label>
                <select
                  value={filters.segment}
                  onChange={(e) => handleFilterChange('segment', e.target.value)}
                  disabled={loading}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {segments.map(segment => (
                    <option key={segment.value} value={segment.value}>{segment.label}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <label className="text-sm text-gray-600">Category:</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  disabled={loading}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                disabled={loading}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              >
                Clear All
              </button>
            )}
            
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Responsive Filters */}
        <div className="md:hidden mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', Number(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Region</label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>{region.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Segment</label>
              <select
                value={filters.segment}
                onChange={(e) => handleFilterChange('segment', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                {segments.map(segment => (
                  <option key={segment.value} value={segment.value}>{segment.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}