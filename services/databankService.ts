'use client'

import { supabase } from '@/lib/supabase'

export interface DatabankFilters {
  dateRange: string
  location: string
  category: string
  brand: string
}

export interface TransactionData {
  id: string
  date: string
  volume: number
  revenue: number
  avg_basket: number
  duration: number
  units: number
  location: string
  category: string
  brand: string
}

export interface AnalyticsInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'forecast'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  data?: any
}

class DatabankService {
  // Real-time data fetching with filters
  async getTransactionTrends(filters: DatabankFilters): Promise<TransactionData[]> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true })

      // Apply filters
      if (filters.location !== 'all') {
        query = query.eq('location', filters.location)
      }
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }
      if (filters.brand !== 'all') {
        query = query.eq('brand', filters.brand)
      }

      // Date range filter
      const dateRange = this.getDateRange(filters.dateRange)
      if (dateRange) {
        query = query.gte('date', dateRange.start).lte('date', dateRange.end)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        return this.getFallbackData()
      }

      return data || []
    } catch (error) {
      console.error('Error fetching transaction trends:', error)
      return this.getFallbackData()
    }
  }

  async getProductMixData(filters: DatabankFilters) {
    try {
      const { data, error } = await supabase
        .from('product_mix')
        .select('*')
        .order('value', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching product mix:', error)
      return this.getFallbackProductMix()
    }
  }

  async getConsumerBehaviorData(filters: DatabankFilters) {
    try {
      const [behaviorResponse, acceptanceResponse] = await Promise.all([
        supabase.from('consumer_behavior').select('*'),
        supabase.from('suggestion_acceptance').select('*')
      ])

      if (behaviorResponse.error) throw behaviorResponse.error
      if (acceptanceResponse.error) throw acceptanceResponse.error

      return {
        behavior: behaviorResponse.data || [],
        acceptance: acceptanceResponse.data || []
      }
    } catch (error) {
      console.error('Error fetching consumer behavior:', error)
      return this.getFallbackConsumerBehavior()
    }
  }

  async getConsumerProfiles(filters: DatabankFilters) {
    try {
      let query = supabase
        .from('consumer_profiles')
        .select('*')

      if (filters.location !== 'all') {
        query = query.eq('location', filters.location)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching consumer profiles:', error)
      return this.getFallbackConsumerProfiles()
    }
  }

  // AI-powered insights generation
  async generateAIInsights(data: any, filters: DatabankFilters): Promise<AnalyticsInsight[]> {
    try {
      const insights: AnalyticsInsight[] = []

      // Trend Analysis
      const trendInsight = this.analyzeTrends(data.transactions)
      if (trendInsight) insights.push(trendInsight)

      // Anomaly Detection
      const anomalyInsight = this.detectAnomalies(data.transactions)
      if (anomalyInsight) insights.push(anomalyInsight)

      // Recommendations
      const recommendations = this.generateRecommendations(data, filters)
      insights.push(...recommendations)

      // Forecasting
      const forecast = this.generateForecast(data.transactions)
      if (forecast) insights.push(forecast)

      return insights
    } catch (error) {
      console.error('Error generating AI insights:', error)
      return []
    }
  }

  private analyzeTrends(transactions: TransactionData[]): AnalyticsInsight | null {
    if (transactions.length < 7) return null

    const recent = transactions.slice(-7)
    const previous = transactions.slice(-14, -7)

    const recentAvg = recent.reduce((sum, t) => sum + t.revenue, 0) / recent.length
    const previousAvg = previous.reduce((sum, t) => sum + t.revenue, 0) / previous.length

    const change = ((recentAvg - previousAvg) / previousAvg) * 100

    return {
      type: 'trend',
      title: change > 0 ? 'Revenue Growth Detected' : 'Revenue Decline Alert',
      description: `Revenue has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% over the last 7 days`,
      impact: Math.abs(change) > 10 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low',
      confidence: 0.85,
      data: { change, recentAvg, previousAvg }
    }
  }

  private detectAnomalies(transactions: TransactionData[]): AnalyticsInsight | null {
    if (transactions.length < 10) return null

    const revenues = transactions.map(t => t.revenue)
    const mean = revenues.reduce((sum, r) => sum + r, 0) / revenues.length
    const stdDev = Math.sqrt(revenues.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / revenues.length)

    const anomalies = transactions.filter(t => Math.abs(t.revenue - mean) > 2 * stdDev)

    if (anomalies.length === 0) return null

    return {
      type: 'anomaly',
      title: 'Revenue Anomalies Detected',
      description: `Found ${anomalies.length} transactions with unusual revenue patterns`,
      impact: 'medium',
      confidence: 0.75,
      data: { anomalies: anomalies.length, mean, stdDev }
    }
  }

  private generateRecommendations(data: any, filters: DatabankFilters): AnalyticsInsight[] {
    const recommendations: AnalyticsInsight[] = []

    // Category performance recommendation
    if (data.productMix && data.productMix.length > 0) {
      const topCategory = data.productMix.reduce((max: any, cat: any) => 
        cat.revenue > max.revenue ? cat : max
      )

      recommendations.push({
        type: 'recommendation',
        title: 'Focus on Top Performing Category',
        description: `${topCategory.category} is your highest revenue generator. Consider expanding this category.`,
        impact: 'high',
        confidence: 0.90,
        data: { category: topCategory.category, revenue: topCategory.revenue }
      })
    }

    // Location-based recommendation
    if (data.transactions && data.transactions.length > 0) {
      const locationRevenue = data.transactions.reduce((acc: any, t: TransactionData) => {
        acc[t.location] = (acc[t.location] || 0) + t.revenue
        return acc
      }, {})

      const topLocation = Object.entries(locationRevenue).reduce((max: any, [loc, rev]) => 
        rev > max.revenue ? { location: loc, revenue: rev } : max
      , { location: '', revenue: 0 })

      recommendations.push({
        type: 'recommendation',
        title: 'Replicate Success in Top Location',
        description: `${topLocation.location} shows strong performance. Apply similar strategies to other locations.`,
        impact: 'medium',
        confidence: 0.80,
        data: topLocation
      })
    }

    return recommendations
  }

  private generateForecast(transactions: TransactionData[]): AnalyticsInsight | null {
    if (transactions.length < 14) return null

    const recentTrend = transactions.slice(-7)
    const avgGrowth = recentTrend.reduce((sum, t, i) => {
      if (i === 0) return sum
      return sum + ((t.revenue - recentTrend[i-1].revenue) / recentTrend[i-1].revenue)
    }, 0) / (recentTrend.length - 1)

    const lastRevenue = recentTrend[recentTrend.length - 1].revenue
    const forecastRevenue = lastRevenue * (1 + avgGrowth)

    return {
      type: 'forecast',
      title: 'Revenue Forecast',
      description: `Based on recent trends, next period revenue is projected to be ₱${forecastRevenue.toLocaleString()}`,
      impact: 'medium',
      confidence: 0.70,
      data: { forecast: forecastRevenue, growth: avgGrowth }
    }
  }

  // Real-time data subscription
  subscribeToUpdates(callback: (data: any) => void) {
    const subscription = supabase
      .channel('databank-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, (payload) => {
        callback(payload)
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }

  // Utility methods
  private getDateRange(rangeKey: string) {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    switch (rangeKey) {
      case 'today':
        return { start: today, end: today }
      case 'last7days':
        const week = new Date(now)
        week.setDate(week.getDate() - 7)
        return { start: week.toISOString().split('T')[0], end: today }
      case 'last30days':
        const month = new Date(now)
        month.setDate(month.getDate() - 30)
        return { start: month.toISOString().split('T')[0], end: today }
      case 'last90days':
        const quarter = new Date(now)
        quarter.setDate(quarter.getDate() - 90)
        return { start: quarter.toISOString().split('T')[0], end: today }
      default:
        return null
    }
  }

  // Fallback data methods
  private getFallbackData(): TransactionData[] {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        id: `fallback-${i}`,
        date: date.toISOString().split('T')[0],
        volume: Math.floor(Math.random() * 500) + 400,
        revenue: Math.floor(Math.random() * 100000) + 80000,
        avg_basket: Math.floor(Math.random() * 50) + 150,
        duration: Math.random() * 2 + 2.5,
        units: Math.floor(Math.random() * 15) + 10,
        location: 'Metro Manila',
        category: 'Beverages',
        brand: 'Brand A'
      }
    })
  }

  private getFallbackProductMix() {
    return [
      { category: 'Beverages', value: 35, skus: 145, revenue: 456789 },
      { category: 'Snacks', value: 25, skus: 89, revenue: 324567 },
      { category: 'Personal Care', value: 20, skus: 67, revenue: 259876 },
      { category: 'Household', value: 15, skus: 45, revenue: 194532 },
      { category: 'Others', value: 5, skus: 23, revenue: 64876 }
    ]
  }

  private getFallbackConsumerBehavior() {
    return {
      behavior: [
        { method: 'Branded Request', value: 650, percentage: 65 },
        { method: 'Generic Request', value: 250, percentage: 25 },
        { method: 'Store Suggestion', value: 100, percentage: 10 }
      ],
      acceptance: [
        { category: 'Beverages', suggested: 234, accepted: 189, rate: 80.8 },
        { category: 'Snacks', suggested: 156, accepted: 98, rate: 62.8 },
        { category: 'Personal Care', suggested: 178, accepted: 134, rate: 75.3 },
        { category: 'Household', suggested: 145, accepted: 87, rate: 60.0 }
      ]
    }
  }

  private getFallbackConsumerProfiles() {
    return Array.from({ length: 100 }, (_, i) => ({
      id: `profile-${i}`,
      age_group: ['18-24', '25-34', '35-44', '45-54', '55+'][i % 5],
      gender: i % 2 === 0 ? 'Male' : 'Female',
      location: 'Metro Manila',
      income_level: ['Low', 'Middle', 'High'][i % 3],
      urban_rural: i % 10 === 0 ? 'Rural' : 'Urban'
    }))
  }
}

export const databankService = new DatabankService()