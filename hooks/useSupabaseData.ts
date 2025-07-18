'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useTransactionTrends(filters: any) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
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
        const dateRange = getDateRange(filters.dateRange)
        if (dateRange) {
          query = query.gte('date', dateRange.start).lte('date', dateRange.end)
        }

        const { data, error } = await query
        
        if (error) throw error
        setData(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  return { data, loading, error }
}

export function useProductMix(filters: any) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('product_mix')
          .select('*')
          .order('value', { ascending: false })
        
        if (error) throw error
        setData(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  return { data, loading, error }
}

export function useConsumerBehavior(filters: any) {
  const [data, setData] = useState<any>({
    behavior: [],
    acceptance: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const [behaviorResponse, acceptanceResponse] = await Promise.all([
          supabase.from('consumer_behavior').select('*'),
          supabase.from('suggestion_acceptance').select('*')
        ])
        
        if (behaviorResponse.error) throw behaviorResponse.error
        if (acceptanceResponse.error) throw acceptanceResponse.error
        
        setData({
          behavior: behaviorResponse.data || [],
          acceptance: acceptanceResponse.data || []
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  return { data, loading, error }
}

export function useConsumerProfiles(filters: any) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        let query = supabase
          .from('consumer_profiles')
          .select('*')

        if (filters.location !== 'all') {
          query = query.eq('location', filters.location)
        }

        const { data, error } = await query
        
        if (error) throw error
        setData(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  return { data, loading, error }
}

// Helper function to get date range
function getDateRange(rangeKey: string) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  switch (rangeKey) {
    case 'today':
      return { start: today, end: today }
    case 'last7days':
      const week = new Date(now.setDate(now.getDate() - 7))
      return { start: week.toISOString().split('T')[0], end: today }
    case 'last30days':
      const month = new Date(now.setDate(now.getDate() - 30))
      return { start: month.toISOString().split('T')[0], end: today }
    case 'last90days':
      const quarter = new Date(now.setDate(now.getDate() - 90))
      return { start: quarter.toISOString().split('T')[0], end: today }
    default:
      return null
  }
}