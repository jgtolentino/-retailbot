// lib/data-service.ts
import { supabase } from './supabase'

export interface DashboardData {
  kpis: {
    totalSales: string
    salesChange: string
    transactions: string
    transChange: string
    handshakeRate: string
    handshakeChange: string
    tbwaShare: string
    tbwaChange: string
  }
  transactionTrends: Array<{
    date: string
    sales: number
    transactions: number
    tbwaSales: number
  }>
  productMix: Array<{
    category: string
    value: number
    percentage: number
    skus: number
    revenue: number
  }>
  consumerBehavior: Array<{
    method: string
    value: number
    suggested: number
    accepted: number
    rate: number
  }>
  consumerProfiles: Array<{
    age_group: string
    gender: string
    location: string
    income_level: string
    urban_rural: string
    count: number
  }>
}

export class DataService {
  private static instance: DataService
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  private getCacheKey(filters: any): string {
    return JSON.stringify(filters)
  }

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < this.CACHE_DURATION
  }

  async getDashboardData(filters: any = {}): Promise<DashboardData> {
    const cacheKey = this.getCacheKey(filters)
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // Try to get real data from Supabase first
      const hasRealData = await this.checkDatabaseConnection()
      
      if (hasRealData) {
        const [
          kpis,
          transactionTrends,
          productMix,
          consumerBehavior,
          consumerProfiles
        ] = await Promise.all([
          this.getKPIs(filters),
          this.getTransactionTrends(filters),
          this.getProductMix(filters),
          this.getConsumerBehavior(filters),
          this.getConsumerProfiles(filters)
        ])

        const data: DashboardData = {
          kpis,
          transactionTrends,
          productMix,
          consumerBehavior,
          consumerProfiles
        }

        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      } else {
        // Fall back to mock data
        return this.getMockData()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Return mock data on error
      return this.getMockData()
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      if (!supabase) return false
      
      const { data, error } = await supabase
        .from('transactions')
        .select('id')
        .limit(1)
      
      return !error && data !== null
    } catch (error) {
      console.error('Database connection check failed:', error)
      return false
    }
  }

  private getMockData(): DashboardData {
    return {
      kpis: {
        totalSales: '₱847K',
        salesChange: '+12.5%',
        transactions: '2,456',
        transChange: '+8.3%',
        handshakeRate: '24.7%',
        handshakeChange: '+2.1%',
        tbwaShare: '22.3%',
        tbwaChange: '+0.8%'
      },
      transactionTrends: [
        { date: '2024-01-01', sales: 25000, transactions: 150, tbwaSales: 5500 },
        { date: '2024-01-02', sales: 28000, transactions: 165, tbwaSales: 6200 },
        { date: '2024-01-03', sales: 31000, transactions: 180, tbwaSales: 6900 },
        { date: '2024-01-04', sales: 27000, transactions: 145, tbwaSales: 6000 },
        { date: '2024-01-05', sales: 35000, transactions: 200, tbwaSales: 7800 },
        { date: '2024-01-06', sales: 32000, transactions: 175, tbwaSales: 7100 },
        { date: '2024-01-07', sales: 38000, transactions: 210, tbwaSales: 8400 }
      ],
      productMix: [
        { category: 'Beverages', value: 45.2, percentage: 45.2, skus: 25, revenue: 15000 },
        { category: 'Snacks', value: 32.8, percentage: 32.8, skus: 18, revenue: 12500 },
        { category: 'Personal Care', value: 18.5, percentage: 18.5, skus: 12, revenue: 8900 },
        { category: 'Household', value: 3.5, percentage: 3.5, skus: 8, revenue: 4200 }
      ],
      consumerBehavior: [
        { method: 'In-store', value: 75.5, suggested: 50, accepted: 38, rate: 76.0 },
        { method: 'Online', value: 15.2, suggested: 25, accepted: 18, rate: 72.0 },
        { method: 'Mobile App', value: 9.3, suggested: 15, accepted: 12, rate: 80.0 }
      ],
      consumerProfiles: [
        { age_group: '25-34', gender: 'Female', location: 'Manila', income_level: '₱30k-₱60k', urban_rural: 'Urban', count: 1250 },
        { age_group: '35-44', gender: 'Male', location: 'Cebu', income_level: '₱60k-₱100k', urban_rural: 'Urban', count: 980 },
        { age_group: '18-24', gender: 'Female', location: 'Davao', income_level: '₱30k-₱60k', urban_rural: 'Urban', count: 750 },
        { age_group: '45-54', gender: 'Male', location: 'Quezon City', income_level: '₱100k+', urban_rural: 'Urban', count: 620 }
      ]
    }
  }

  private async getKPIs(filters: any) {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('revenue, units, created_at')
      .gte('created_at', this.getDateFilter(filters.dateRange))

    if (error) throw error

    const totalSales = transactions?.reduce((sum, t) => sum + (t.revenue || 0), 0) || 0
    const totalTransactions = transactions?.length || 0
    
    // Calculate previous period for comparison
    const prevPeriodStart = this.getPreviousDateFilter(filters.dateRange)
    const { data: prevTransactions, error: prevError } = await supabase
      .from('transactions')
      .select('revenue, units')
      .gte('created_at', prevPeriodStart)
      .lt('created_at', this.getDateFilter(filters.dateRange))

    if (prevError) throw prevError

    const prevSales = prevTransactions?.reduce((sum, t) => sum + (t.revenue || 0), 0) || 0
    const prevTransactionCount = prevTransactions?.length || 0

    const salesChange = prevSales > 0 ? ((totalSales - prevSales) / prevSales * 100).toFixed(1) : '0.0'
    const transChange = prevTransactionCount > 0 ? ((totalTransactions - prevTransactionCount) / prevTransactionCount * 100).toFixed(1) : '0.0'

    return {
      totalSales: `₱${(totalSales / 1000).toFixed(0)}K`,
      salesChange: `${salesChange.startsWith('-') ? '' : '+'}${salesChange}%`,
      transactions: totalTransactions.toLocaleString(),
      transChange: `${transChange.startsWith('-') ? '' : '+'}${transChange}%`,
      handshakeRate: '24.7%', // Mock for now
      handshakeChange: '+2.1%',
      tbwaShare: '22.3%',
      tbwaChange: '+0.8%'
    }
  }

  private async getTransactionTrends(filters: any) {
    const { data, error } = await supabase
      .from('transactions')
      .select('created_at, revenue, units, brand')
      .gte('created_at', this.getDateFilter(filters.dateRange))
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group by day
    const groupedByDay = data?.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = { 
          date, 
          sales: 0, 
          transactions: 0, 
          tbwaSales: 0 
        }
      }
      acc[date].sales += transaction.revenue || 0
      acc[date].transactions += 1
      if (transaction.brand && transaction.brand.toLowerCase().includes('tbwa')) {
        acc[date].tbwaSales += transaction.revenue || 0
      }
      return acc
    }, {} as Record<string, any>) || {}

    return Object.values(groupedByDay)
  }

  private async getProductMix(filters: any) {
    const { data, error } = await supabase
      .from('product_mix')
      .select('category, value, skus, revenue')
      .gte('created_at', this.getDateFilter(filters.dateRange))

    if (error) throw error

    // Group by category
    const categoryTotals = data?.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { 
          category: item.category, 
          value: 0, 
          skus: 0, 
          revenue: 0 
        }
      }
      acc[item.category].value += item.value || 0
      acc[item.category].skus += item.skus || 0
      acc[item.category].revenue += item.revenue || 0
      return acc
    }, {} as Record<string, any>) || {}

    const categories = Object.values(categoryTotals)
    const totalValue = categories.reduce((sum: number, cat: any) => sum + cat.value, 0)

    return categories.map((cat: any) => ({
      ...cat,
      percentage: totalValue > 0 ? (cat.value / totalValue * 100) : 0
    }))
  }

  private async getConsumerBehavior(filters: any) {
    const { data, error } = await supabase
      .from('consumer_behavior')
      .select('method, value, suggested, accepted, rate')
      .gte('created_at', this.getDateFilter(filters.dateRange))

    if (error) throw error

    return data || []
  }

  private async getConsumerProfiles(filters: any) {
    const { data, error } = await supabase
      .from('consumer_profiles')
      .select('age_group, gender, location, income_level, urban_rural')
      .gte('created_at', this.getDateFilter(filters.dateRange))

    if (error) throw error

    // Group by age_group
    const grouped = data?.reduce((acc, profile) => {
      const key = profile.age_group
      if (!acc[key]) {
        acc[key] = { ...profile, count: 0 }
      }
      acc[key].count += 1
      return acc
    }, {} as Record<string, any>) || {}

    return Object.values(grouped)
  }

  private getDateFilter(dateRange: string): string {
    const now = new Date()
    switch (dateRange) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString()
      case 'last7days':
        return new Date(now.setDate(now.getDate() - 7)).toISOString()
      case 'last30days':
        return new Date(now.setDate(now.getDate() - 30)).toISOString()
      case 'last90days':
        return new Date(now.setDate(now.getDate() - 90)).toISOString()
      default:
        return new Date(now.setDate(now.getDate() - 30)).toISOString()
    }
  }

  private getPreviousDateFilter(dateRange: string): string {
    const now = new Date()
    switch (dateRange) {
      case 'today':
        return new Date(now.setDate(now.getDate() - 1)).toISOString()
      case 'last7days':
        return new Date(now.setDate(now.getDate() - 14)).toISOString()
      case 'last30days':
        return new Date(now.setDate(now.getDate() - 60)).toISOString()
      case 'last90days':
        return new Date(now.setDate(now.getDate() - 180)).toISOString()
      default:
        return new Date(now.setDate(now.getDate() - 60)).toISOString()
    }
  }

  // Real-time subscription methods
  subscribeToTransactions(callback: (payload: any) => void) {
    if (!supabase) return { unsubscribe: () => {} }
    
    return supabase
      .channel('transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, callback)
      .subscribe()
  }

  subscribeToProductMix(callback: (payload: any) => void) {
    if (!supabase) return { unsubscribe: () => {} }
    
    return supabase
      .channel('product_mix')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_mix' }, callback)
      .subscribe()
  }

  // Analytics methods
  async getAdvancedAnalytics(type: string, filters: any = {}) {
    switch (type) {
      case 'hourly_sales':
        return this.getHourlySales(filters)
      case 'geographic_analysis':
        return this.getGeographicAnalysis(filters)
      case 'customer_segments':
        return this.getCustomerSegments(filters)
      default:
        throw new Error(`Unknown analytics type: ${type}`)
    }
  }

  private async getHourlySales(filters: any) {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('transactions')
      .select('created_at, revenue')
      .gte('created_at', this.getDateFilter(filters.dateRange))

    if (error) throw error

    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sales: 0,
      transactions: 0
    }))

    data?.forEach(transaction => {
      const hour = new Date(transaction.created_at).getHours()
      hourlyData[hour].sales += transaction.revenue || 0
      hourlyData[hour].transactions += 1
    })

    return hourlyData
  }

  private async getGeographicAnalysis(filters: any) {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('transactions')
      .select('location, revenue, units')
      .gte('created_at', this.getDateFilter(filters.dateRange))

    if (error) throw error

    const locationData = data?.reduce((acc, transaction) => {
      const location = transaction.location
      if (!acc[location]) {
        acc[location] = { location, revenue: 0, transactions: 0, units: 0 }
      }
      acc[location].revenue += transaction.revenue || 0
      acc[location].transactions += 1
      acc[location].units += transaction.units || 0
      return acc
    }, {} as Record<string, any>) || {}

    return Object.values(locationData)
  }

  private async getCustomerSegments(filters: any) {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('consumer_profiles')
      .select('age_group, gender, income_level, urban_rural')
      .gte('created_at', this.getDateFilter(filters.dateRange))

    if (error) throw error

    const segments = data?.reduce((acc, profile) => {
      const segment = `${profile.age_group}-${profile.gender}-${profile.income_level}`
      if (!acc[segment]) {
        acc[segment] = { 
          segment, 
          age_group: profile.age_group,
          gender: profile.gender,
          income_level: profile.income_level,
          count: 0 
        }
      }
      acc[segment].count += 1
      return acc
    }, {} as Record<string, any>) || {}

    return Object.values(segments)
  }
}