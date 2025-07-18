'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, MapPin, Package, Tag, Users, Store, 
  DollarSign, TrendingUp, Filter, X, ChevronDown,
  Clock, Wallet, Building, Globe
} from 'lucide-react'
import { format } from 'date-fns'

interface AdvancedFilters {
  // Temporal
  dateRange: string
  customStartDate?: Date
  customEndDate?: Date
  timeOfDay?: string[]
  dayOfWeek?: string[]
  isHoliday?: boolean
  isPayday?: boolean
  
  // Geographic
  region: string[]
  province: string[]
  city: string[]
  barangay: string[]
  urbanization: string
  
  // Store
  storeClass: string[]
  storeType: string[]
  storeSize: { min?: number, max?: number }
  hasRefrigeration?: boolean
  acceptsDigital?: boolean
  
  // Product & Brand
  brand: string[]
  category: string[]
  subcategory: string[]
  priceRange: { min?: number, max?: number }
  isPromo?: boolean
  isTBWA?: boolean
  
  // Customer
  customerClass: string[]
  ageGroup: string[]
  gender: string[]
  shoppingFrequency: string[]
  
  // Transaction
  paymentMethod: string[]
  basketSizeRange: { min?: number, max?: number }
  hasHandshake?: boolean
  handshakeSuccess?: boolean
  
  // Socioeconomic
  povertyRate: { min?: number, max?: number }
  medianIncome: { min?: number, max?: number }
  internetAccess: { min?: number, max?: number }
}

interface FilterChipProps {
  label: string
  value: string | number
  onRemove: () => void
}

function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
      <span>{label}: {value}</span>
      <button onClick={onRemove} className="hover:bg-blue-200 rounded-full p-0.5">
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

export default function AdvancedFilterPanel({ 
  onFiltersChange,
  onClose,
  initialFilters = {}
}: {
  onFiltersChange: (filters: Partial<AdvancedFilters>) => void
  onClose?: () => void
  initialFilters?: Partial<AdvancedFilters>
}) {
  const [filters, setFilters] = useState<Partial<AdvancedFilters>>(initialFilters)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['temporal', 'geographic']))
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Calculate active filter count
  useEffect(() => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count += value.length
      else if (typeof value === 'object' && value !== null) {
        if ('min' in value || 'max' in value) count++
      }
      else if (value !== undefined && value !== 'all') count++
    })
    setActiveFilterCount(count)
  }, [filters])

  const handleFilterChange = (filterType: keyof AdvancedFilters, value: any) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const clearAllFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const getActiveFilterChips = () => {
    const chips: { label: string; value: string; key: string }[] = []
    
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => chips.push({ label: key, value: v, key: `${key}-${v}` }))
      } else if (typeof value === 'object' && value !== null && 'min' in value) {
        chips.push({ 
          label: key, 
          value: `${value.min || 0} - ${value.max || '∞'}`, 
          key 
        })
      } else if (value && value !== 'all') {
        chips.push({ label: key, value: String(value), key })
      }
    })
    
    return chips
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Advanced Filters</h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all
            </button>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {getActiveFilterChips().length > 0 && (
        <div className="px-6 py-3 border-b bg-blue-50">
          <div className="flex flex-wrap gap-2">
            {getActiveFilterChips().map(chip => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                value={chip.value}
                onRemove={() => {
                  const newFilters = { ...filters }
                  delete newFilters[chip.key as keyof AdvancedFilters]
                  setFilters(newFilters)
                  onFiltersChange(newFilters)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="max-h-[600px] overflow-y-auto">
        {/* Temporal Filters */}
        <FilterSection
          title="Time & Date"
          icon={Calendar}
          isExpanded={expandedSections.has('temporal')}
          onToggle={() => toggleSection('temporal')}
        >
          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange || 'last30days'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Time of Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day</label>
              <div className="grid grid-cols-4 gap-2">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                  <label key={time} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.timeOfDay?.includes(time) || false}
                      onChange={(e) => {
                        const current = filters.timeOfDay || []
                        if (e.target.checked) {
                          handleFilterChange('timeOfDay', [...current, time])
                        } else {
                          handleFilterChange('timeOfDay', current.filter(t => t !== time))
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Days */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.isHoliday || false}
                  onChange={(e) => handleFilterChange('isHoliday', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Holidays Only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.isPayday || false}
                  onChange={(e) => handleFilterChange('isPayday', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Payday Period</span>
              </label>
            </div>
          </div>
        </FilterSection>

        {/* Geographic Filters */}
        <FilterSection
          title="Location"
          icon={MapPin}
          isExpanded={expandedSections.has('geographic')}
          onToggle={() => toggleSection('geographic')}
        >
          <div className="space-y-4">
            {/* Region Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regions</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {['NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region V', 
                  'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 
                  'Region XI', 'Region XII', 'Region XIII', 'CAR', 'BARMM'].map(region => (
                  <label key={region} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.region?.includes(region) || false}
                      onChange={(e) => {
                        const current = filters.region || []
                        if (e.target.checked) {
                          handleFilterChange('region', [...current, region])
                        } else {
                          handleFilterChange('region', current.filter(r => r !== region))
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{region}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Urbanization Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area Type</label>
              <select
                value={filters.urbanization || 'all'}
                onChange={(e) => handleFilterChange('urbanization', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Areas</option>
                <option value="highly-urban">Highly Urban (Cities)</option>
                <option value="urban">Urban</option>
                <option value="semi-urban">Semi-Urban</option>
                <option value="rural">Rural</option>
              </select>
            </div>
          </div>
        </FilterSection>

        {/* Store Filters */}
        <FilterSection
          title="Store Characteristics"
          icon={Store}
          isExpanded={expandedSections.has('store')}
          onToggle={() => toggleSection('store')}
        >
          <div className="space-y-4">
            {/* Store Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Class</label>
              <div className="flex gap-2">
                {['A', 'B', 'C', 'D', 'E'].map(cls => (
                  <label key={cls} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={filters.storeClass?.includes(cls) || false}
                      onChange={(e) => {
                        const current = filters.storeClass || []
                        if (e.target.checked) {
                          handleFilterChange('storeClass', [...current, cls])
                        } else {
                          handleFilterChange('storeClass', current.filter(c => c !== cls))
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">Class {cls}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Store Features */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasRefrigeration || false}
                  onChange={(e) => handleFilterChange('hasRefrigeration', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Has Refrigeration</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.acceptsDigital || false}
                  onChange={(e) => handleFilterChange('acceptsDigital', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Accepts Digital Payment</span>
              </label>
            </div>
          </div>
        </FilterSection>

        {/* Product & Brand Filters */}
        <FilterSection
          title="Products & Brands"
          icon={Package}
          isExpanded={expandedSections.has('product')}
          onToggle={() => toggleSection('product')}
        >
          <div className="space-y-4">
            {/* TBWA Filter */}
            <label className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
              <input
                type="checkbox"
                checked={filters.isTBWA || false}
                onChange={(e) => handleFilterChange('isTBWA', e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm font-medium text-blue-700">TBWA Clients Only</span>
            </label>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {['Beverages', 'Snacks', 'Personal Care', 'Tobacco', 'Dairy', 'Household'].map(cat => (
                  <label key={cat} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.category?.includes(cat) || false}
                      onChange={(e) => {
                        const current = filters.category || []
                        if (e.target.checked) {
                          handleFilterChange('category', [...current, cat])
                        } else {
                          handleFilterChange('category', current.filter(c => c !== cat))
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (₱)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: Number(e.target.value)
                  })}
                  className="w-24 px-3 py-2 border rounded-md text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: Number(e.target.value)
                  })}
                  className="w-24 px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Customer Filters */}
        <FilterSection
          title="Customer Profile"
          icon={Users}
          isExpanded={expandedSections.has('customer')}
          onToggle={() => toggleSection('customer')}
        >
          <div className="space-y-4">
            {/* Economic Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Economic Class</label>
              <div className="flex gap-2">
                {['A', 'B', 'C', 'D', 'E'].map(cls => (
                  <label key={cls} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={filters.customerClass?.includes(cls) || false}
                      onChange={(e) => {
                        const current = filters.customerClass || []
                        if (e.target.checked) {
                          handleFilterChange('customerClass', [...current, cls])
                        } else {
                          handleFilterChange('customerClass', current.filter(c => c !== cls))
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{cls}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age Groups */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Groups</label>
              <div className="grid grid-cols-3 gap-2">
                {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map(age => (
                  <label key={age} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.ageGroup?.includes(age) || false}
                      onChange={(e) => {
                        const current = filters.ageGroup || []
                        if (e.target.checked) {
                          handleFilterChange('ageGroup', [...current, age])
                        } else {
                          handleFilterChange('ageGroup', current.filter(a => a !== age))
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{age}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Transaction Filters */}
        <FilterSection
          title="Transaction Details"
          icon={DollarSign}
          isExpanded={expandedSections.has('transaction')}
          onToggle={() => toggleSection('transaction')}
        >
          <div className="space-y-4">
            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {['Cash', 'GCash', 'Maya', 'Credit', 'Mixed'].map(method => (
                  <label key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.paymentMethod?.includes(method) || false}
                      onChange={(e) => {
                        const current = filters.paymentMethod || []
                        if (e.target.checked) {
                          handleFilterChange('paymentMethod', [...current, method])
                        } else {
                          handleFilterChange('paymentMethod', current.filter(m => m !== method))
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Handshake Filters */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasHandshake || false}
                  onChange={(e) => handleFilterChange('hasHandshake', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Has Handshake Event</span>
              </label>
              {filters.hasHandshake && (
                <label className="flex items-center gap-2 ml-6">
                  <input
                    type="checkbox"
                    checked={filters.handshakeSuccess || false}
                    onChange={(e) => handleFilterChange('handshakeSuccess', e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">Successful Handshakes Only</span>
                </label>
              )}
            </div>

            {/* Basket Size Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Basket Size (₱)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.basketSizeRange?.min || ''}
                  onChange={(e) => handleFilterChange('basketSizeRange', {
                    ...filters.basketSizeRange,
                    min: Number(e.target.value)
                  })}
                  className="w-24 px-3 py-2 border rounded-md text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.basketSizeRange?.max || ''}
                  onChange={(e) => handleFilterChange('basketSizeRange', {
                    ...filters.basketSizeRange,
                    max: Number(e.target.value)
                  })}
                  className="w-24 px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Socioeconomic Filters */}
        <FilterSection
          title="Socioeconomic Indicators"
          icon={Globe}
          isExpanded={expandedSections.has('socioeconomic')}
          onToggle={() => toggleSection('socioeconomic')}
        >
          <div className="space-y-4">
            {/* Poverty Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poverty Rate (%)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={filters.povertyRate?.min || ''}
                  onChange={(e) => handleFilterChange('povertyRate', {
                    ...filters.povertyRate,
                    min: Number(e.target.value)
                  })}
                  className="w-24 px-3 py-2 border rounded-md text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={filters.povertyRate?.max || ''}
                  onChange={(e) => handleFilterChange('povertyRate', {
                    ...filters.povertyRate,
                    max: Number(e.target.value)
                  })}
                  className="w-24 px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>

            {/* Median Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Median Income (₱/month)</label>
              <select
                value={filters.medianIncome?.min || 'all'}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'all') {
                    handleFilterChange('medianIncome', undefined)
                  } else {
                    const [min, max] = value.split('-').map(Number)
                    handleFilterChange('medianIncome', { min, max })
                  }
                }}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Income Levels</option>
                <option value="0-15000">Below ₱15,000</option>
                <option value="15000-30000">₱15,000 - ₱30,000</option>
                <option value="30000-50000">₱30,000 - ₱50,000</option>
                <option value="50000-100000">₱50,000 - ₱100,000</option>
                <option value="100000-999999">Above ₱100,000</option>
              </select>
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Apply Button */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <button
          onClick={() => onFiltersChange(filters)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Apply Filters ({activeFilterCount} active)
        </button>
      </div>
    </div>
  )
}

// Filter Section Component
function FilterSection({ 
  title, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  children 
}: {
  title: string
  icon: any
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      {isExpanded && (
        <div className="px-6 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}