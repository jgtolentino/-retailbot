import { SupabaseClient } from '@supabase/supabase-js'

export interface FilterQuery {
  // Temporal
  dateRange?: string
  startDate?: Date
  endDate?: Date
  timeOfDay?: string[]
  dayOfWeek?: number[]
  isHoliday?: boolean
  isPayday?: boolean
  
  // Geographic
  region?: string[]
  province?: string[]
  city?: string[]
  barangay?: string[]
  urbanizationLevel?: string[]
  
  // Store
  storeClass?: string[]
  storeType?: string[]
  storeId?: string[]
  hasRefrigeration?: boolean
  acceptsDigital?: boolean
  
  // Product & Brand
  brand?: string[]
  category?: string[]
  subcategory?: string[]
  priceRange?: { min?: number; max?: number }
  isPromo?: boolean
  isTBWA?: boolean
  
  // Customer
  customerClass?: string[]
  ageGroup?: string[]
  gender?: string[]
  
  // Transaction
  paymentMethod?: string[]
  basketSizeRange?: { min?: number; max?: number }
  hasHandshake?: boolean
  handshakeSuccess?: boolean
  
  // Socioeconomic
  povertyRateRange?: { min?: number; max?: number }
  medianIncomeRange?: { min?: number; max?: number }
}

export class SupabaseFilterBuilder {
  private supabase: SupabaseClient
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  
  buildTransactionQuery(filters: FilterQuery) {
    let query = this.supabase.from('transactions').select('*')
    
    // Temporal filters
    if (filters.dateRange) {
      const { start, end } = this.getDateRange(filters.dateRange, filters.startDate, filters.endDate)
      query = query.gte('order_date', start.toISOString())
                   .lte('order_date', end.toISOString())
    }
    
    if (filters.timeOfDay?.length) {
      const hourRanges = this.getHourRanges(filters.timeOfDay)
      query = query.or(hourRanges.map(range => 
        `hour_of_day.gte.${range.start},hour_of_day.lt.${range.end}`
      ).join(','))
    }
    
    if (filters.dayOfWeek?.length) {
      query = query.in('day_of_week', filters.dayOfWeek)
    }
    
    if (filters.isHoliday !== undefined) {
      query = query.eq('is_holiday', filters.isHoliday)
    }
    
    if (filters.isPayday !== undefined) {
      query = query.eq('is_payday_week', filters.isPayday)
    }
    
    // Geographic filters
    if (filters.region?.length) {
      query = query.in('region', filters.region)
    }
    
    if (filters.province?.length) {
      query = query.in('province', filters.province)
    }
    
    if (filters.city?.length) {
      query = query.in('city_municipality', filters.city)
    }
    
    if (filters.barangay?.length) {
      query = query.in('barangay', filters.barangay)
    }
    
    if (filters.urbanizationLevel?.length) {
      const levels = this.mapUrbanizationLevels(filters.urbanizationLevel)
      query = query.in('urbanization_level', levels)
    }
    
    // Store filters
    if (filters.storeClass?.length) {
      query = query.in('store_economic_class', filters.storeClass)
    }
    
    if (filters.storeType?.length) {
      query = query.in('store_type', filters.storeType)
    }
    
    if (filters.storeId?.length) {
      query = query.in('store_id', filters.storeId)
    }
    
    // Product & Brand filters
    if (filters.brand?.length) {
      query = query.in('brand', filters.brand)
    }
    
    if (filters.category?.length) {
      query = query.in('product_category', filters.category)
    }
    
    if (filters.subcategory?.length) {
      query = query.in('product_subcategory', filters.subcategory)
    }
    
    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        query = query.gte('unit_price', filters.priceRange.min)
      }
      if (filters.priceRange.max !== undefined) {
        query = query.lte('unit_price', filters.priceRange.max)
      }
    }
    
    if (filters.isTBWA !== undefined) {
      query = query.eq('is_tbwa_brand', filters.isTBWA)
    }
    
    // Customer filters
    if (filters.customerClass?.length) {
      query = query.in('customer_economic_class', filters.customerClass)
    }
    
    // Transaction filters
    if (filters.paymentMethod?.length) {
      query = query.in('payment_method', filters.paymentMethod)
    }
    
    if (filters.basketSizeRange) {
      if (filters.basketSizeRange.min !== undefined) {
        query = query.gte('sales', filters.basketSizeRange.min)
      }
      if (filters.basketSizeRange.max !== undefined) {
        query = query.lte('sales', filters.basketSizeRange.max)
      }
    }
    
    if (filters.hasHandshake !== undefined) {
      query = query.eq('is_handshake', filters.hasHandshake)
    }
    
    if (filters.handshakeSuccess !== undefined && filters.hasHandshake) {
      query = query.eq('handshake_success', filters.handshakeSuccess)
    }
    
    // Socioeconomic filters
    if (filters.povertyRateRange) {
      if (filters.povertyRateRange.min !== undefined) {
        query = query.gte('poverty_incidence', filters.povertyRateRange.min / 100)
      }
      if (filters.povertyRateRange.max !== undefined) {
        query = query.lte('poverty_incidence', filters.povertyRateRange.max / 100)
      }
    }
    
    if (filters.medianIncomeRange) {
      if (filters.medianIncomeRange.min !== undefined) {
        query = query.gte('median_household_income', filters.medianIncomeRange.min)
      }
      if (filters.medianIncomeRange.max !== undefined) {
        query = query.lte('median_household_income', filters.medianIncomeRange.max)
      }
    }
    
    return query
  }
  
  // Aggregate query builder
  buildAggregateQuery(filters: FilterQuery, groupBy: string[], metrics: string[]) {
    // Start with filtered base query
    let query = this.buildTransactionQuery(filters)
    
    // Build select statement for aggregates
    const selectFields = [
      ...groupBy,
      ...metrics.map(metric => {
        switch (metric) {
          case 'total_sales':
            return 'SUM(sales) as total_sales'
          case 'transaction_count':
            return 'COUNT(*) as transaction_count'
          case 'unique_customers':
            return 'COUNT(DISTINCT customer_id) as unique_customers'
          case 'avg_basket_size':
            return 'AVG(sales) as avg_basket_size'
          case 'handshake_rate':
            return 'AVG(CASE WHEN is_handshake THEN 1 ELSE 0 END) as handshake_rate'
          case 'tbwa_share':
            return 'SUM(CASE WHEN is_tbwa_brand THEN sales ELSE 0 END) / SUM(sales) as tbwa_share'
          default:
            return metric
        }
      })
    ]
    
    // Apply grouping
    if (groupBy.length > 0) {
      query = query.select(selectFields.join(', ')).group(...groupBy)
    }
    
    return query
  }
  
  // Helper methods
  private getDateRange(preset: string, customStart?: Date, customEnd?: Date) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (preset) {
      case 'today':
        return { start: today, end: now }
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return { start: yesterday, end: today }
      case 'last7days':
        const week = new Date(today)
        week.setDate(week.getDate() - 7)
        return { start: week, end: now }
      case 'last30days':
        const month = new Date(today)
        month.setDate(month.getDate() - 30)
        return { start: month, end: now }
      case 'last90days':
        const quarter = new Date(today)
        quarter.setDate(quarter.getDate() - 90)
        return { start: quarter, end: now }
      case 'custom':
        return { 
          start: customStart || today, 
          end: customEnd || now 
        }
      default:
        return { start: today, end: now }
    }
  }
  
  private getHourRanges(timeOfDay: string[]) {
    const ranges: { start: number; end: number }[] = []
    
    if (timeOfDay.includes('Morning')) {
      ranges.push({ start: 6, end: 12 })
    }
    if (timeOfDay.includes('Afternoon')) {
      ranges.push({ start: 12, end: 18 })
    }
    if (timeOfDay.includes('Evening')) {
      ranges.push({ start: 18, end: 22 })
    }
    if (timeOfDay.includes('Night')) {
      ranges.push({ start: 22, end: 24 })
      ranges.push({ start: 0, end: 6 })
    }
    
    return ranges
  }
  
  private mapUrbanizationLevels(levels: string[]) {
    const mapping: Record<string, number[]> = {
      'highly-urban': [0.9, 1.0],
      'urban': [0.7, 0.89],
      'semi-urban': [0.4, 0.69],
      'rural': [0, 0.39]
    }
    
    const values: number[] = []
    levels.forEach(level => {
      const range = mapping[level]
      if (range) {
        for (let i = range[0]; i <= range[1]; i += 0.01) {
          values.push(Math.round(i * 100) / 100)
        }
      }
    })
    
    return values
  }
}

// Export singleton instance
export const filterBuilder = (supabase: SupabaseClient) => new SupabaseFilterBuilder(supabase)