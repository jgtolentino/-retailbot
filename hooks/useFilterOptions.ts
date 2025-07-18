import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import io from 'socket.io-client'

// Types
interface FilterOptions {
  values: string[]
  metadata?: {
    min?: number
    max?: number
    avg?: number
    counts?: Record<string, number>
  }
}

interface UseFilterOptionsConfig {
  dimension: string
  cascadeFrom?: {
    dimension: string
    value: string | string[]
  }
  enabled?: boolean
  includeMetadata?: boolean
}

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Fetch filter options
async function fetchFilterOptions(
  dimension: string, 
  cascadeParams?: Record<string, string>
): Promise<string[]> {
  const params = new URLSearchParams(cascadeParams)
  const url = `${API_BASE}/filters/${dimension}${params.toString() ? `?${params}` : ''}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${dimension} options`)
  }
  
  return response.json()
}

// Fetch filter metadata
async function fetchFilterMetadata(dimension: string) {
  const response = await fetch(`${API_BASE}/filters/${dimension}/metadata`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${dimension} metadata`)
  }
  
  return response.json()
}

// Main hook
export function useFilterOptions({
  dimension,
  cascadeFrom,
  enabled = true,
  includeMetadata = false
}: UseFilterOptionsConfig) {
  const queryClient = useQueryClient()
  
  // Build cascade parameters
  const cascadeParams = cascadeFrom ? {
    [cascadeFrom.dimension]: Array.isArray(cascadeFrom.value) 
      ? cascadeFrom.value.join(',') 
      : cascadeFrom.value
  } : undefined
  
  // Query key
  const queryKey = ['filterOptions', dimension, cascadeParams]
  
  // Fetch options
  const optionsQuery = useQuery({
    queryKey,
    queryFn: () => fetchFilterOptions(dimension, cascadeParams),
    enabled,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  })
  
  // Fetch metadata if requested
  const metadataQuery = useQuery({
    queryKey: [...queryKey, 'metadata'],
    queryFn: () => fetchFilterMetadata(dimension),
    enabled: enabled && includeMetadata,
    staleTime: 300000, // 5 minutes
  })
  
  // Set up WebSocket for real-time updates
  useEffect(() => {
    if (!enabled) return
    
    const socket = io(API_BASE.replace('/api', ''))
    
    // Listen for filter updates
    socket.on('filter-updated', ({ dimension: updatedDim }: { dimension: string }) => {
      if (updatedDim === dimension) {
        // Invalidate this dimension's cache
        queryClient.invalidateQueries({ queryKey: ['filterOptions', dimension] })
      }
    })
    
    // Cleanup
    return () => {
      socket.disconnect()
    }
  }, [dimension, enabled, queryClient])
  
  return {
    options: optionsQuery.data || [],
    metadata: metadataQuery.data,
    isLoading: optionsQuery.isLoading || metadataQuery.isLoading,
    error: optionsQuery.error || metadataQuery.error,
    refetch: () => {
      optionsQuery.refetch()
      if (includeMetadata) metadataQuery.refetch()
    }
  }
}

// Hook for cascading filters
export function useCascadingFilters(config: {
  region?: string
  province?: string
  category?: string
}) {
  // Region options (top level)
  const regions = useFilterOptions({
    dimension: 'region'
  })
  
  // Province options (cascade from region)
  const provinces = useFilterOptions({
    dimension: 'province',
    cascadeFrom: config.region ? { dimension: 'region', value: config.region } : undefined,
    enabled: !!config.region
  })
  
  // City options (cascade from province)
  const cities = useFilterOptions({
    dimension: 'city',
    cascadeFrom: config.province ? { dimension: 'province', value: config.province } : undefined,
    enabled: !!config.province
  })
  
  // Brand options (cascade from category if needed)
  const brands = useFilterOptions({
    dimension: 'brand',
    cascadeFrom: config.category ? { dimension: 'category', value: config.category } : undefined
  })
  
  return {
    regions: regions.options,
    provinces: provinces.options,
    cities: cities.options,
    brands: brands.options,
    isLoading: regions.isLoading || provinces.isLoading || cities.isLoading || brands.isLoading
  }
}

// Hook for filter metadata
export function useFilterMetadata(dimensions: string[]) {
  const queries = dimensions.map(dimension => 
    useQuery({
      queryKey: ['filterOptions', dimension, 'metadata'],
      queryFn: () => fetchFilterMetadata(dimension),
      staleTime: 300000
    })
  )
  
  return {
    metadata: Object.fromEntries(
      dimensions.map((dim, i) => [dim, queries[i].data])
    ),
    isLoading: queries.some(q => q.isLoading),
    error: queries.find(q => q.error)?.error
  }
}

// Hook for real-time filter updates
export function useFilterUpdates(onUpdate?: (dimension: string) => void) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const socket = io(API_BASE.replace('/api', ''))
    
    socket.on('filter-updated', ({ dimension }: { dimension: string }) => {
      // Invalidate all queries for this dimension
      queryClient.invalidateQueries({ 
        queryKey: ['filterOptions', dimension],
        exact: false 
      })
      
      // Call callback if provided
      onUpdate?.(dimension)
    })
    
    socket.on('filters-batch-updated', ({ dimensions }: { dimensions: string[] }) => {
      // Invalidate multiple dimensions at once
      dimensions.forEach(dimension => {
        queryClient.invalidateQueries({ 
          queryKey: ['filterOptions', dimension],
          exact: false 
        })
      })
    })
    
    return () => {
      socket.disconnect()
    }
  }, [queryClient, onUpdate])
}

// Utility to prefetch common filters
export function usePrefetchFilters() {
  const queryClient = useQueryClient()
  
  const prefetch = async () => {
    const commonDimensions = ['region', 'category', 'brand', 'store_class']
    
    await Promise.all(
      commonDimensions.map(dimension =>
        queryClient.prefetchQuery({
          queryKey: ['filterOptions', dimension],
          queryFn: () => fetchFilterOptions(dimension),
          staleTime: 300000
        })
      )
    )
  }
  
  return { prefetch }
}