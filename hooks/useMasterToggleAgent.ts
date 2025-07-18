import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface FilterOption {
  value: string
  display_name: string
  sort_order: number
}

export interface FilterUpdateEvent {
  dimension: string
  action: 'upsert' | 'delete'
  values: string[]
  timestamp: Date
}

export interface MasterToggleAgentHook {
  filterOptions: Record<string, FilterOption[]>
  isConnected: boolean
  isLoading: boolean
  error: string | null
  refreshDimension: (dimension: string) => Promise<void>
  refreshAllDimensions: () => Promise<void>
  addToggleDimension: (dimension: string, config: {
    sourceTable: string
    sourceColumn: string
    masterTable: string
  }) => Promise<void>
  getAgentHealth: () => Promise<any>
}

export function useMasterToggleAgent(
  dimensions: string[] = [],
  autoConnect: boolean = true
): MasterToggleAgentHook {
  const [filterOptions, setFilterOptions] = useState<Record<string, FilterOption[]>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) return

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.hostname}:8080`
      
      const newWs = new WebSocket(wsUrl)
      
      newWs.onopen = () => {
        console.log('Connected to Master Toggle Agent WebSocket')
        setIsConnected(true)
        setError(null)
      }
      
      newWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'filter_updated') {
            const updateEvent: FilterUpdateEvent = message.data
            handleFilterUpdate(updateEvent)
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }
      
      newWs.onclose = () => {
        console.log('Disconnected from Master Toggle Agent WebSocket')
        setIsConnected(false)
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (autoConnect) {
            connectWebSocket()
          }
        }, 5000)
      }
      
      newWs.onerror = (err) => {
        console.error('WebSocket error:', err)
        setError('WebSocket connection failed')
        setIsConnected(false)
      }
      
      setWs(newWs)
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError('Failed to connect to Master Toggle Agent')
    }
  }, [ws, autoConnect])

  // Handle filter updates from WebSocket
  const handleFilterUpdate = useCallback((event: FilterUpdateEvent) => {
    console.log('Filter update received:', event)
    
    if (dimensions.includes(event.dimension)) {
      // Refresh the specific dimension
      refreshDimension(event.dimension)
    }
  }, [dimensions])

  // Fetch filter options for a dimension
  const fetchFilterOptions = useCallback(async (dimension: string): Promise<FilterOption[]> => {
    try {
      const response = await fetch(`/api/master-toggle?dimension=${dimension}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch options for ${dimension}`)
      }
      
      const data = await response.json()
      return data.options.map((option: string, index: number) => ({
        value: option,
        display_name: option,
        sort_order: index
      }))
    } catch (err) {
      console.error(`Error fetching options for ${dimension}:`, err)
      setError(`Failed to fetch options for ${dimension}`)
      return []
    }
  }, [])

  // Refresh a single dimension
  const refreshDimension = useCallback(async (dimension: string) => {
    setIsLoading(true)
    try {
      const options = await fetchFilterOptions(dimension)
      setFilterOptions(prev => ({
        ...prev,
        [dimension]: options
      }))
    } catch (err) {
      console.error(`Error refreshing ${dimension}:`, err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchFilterOptions])

  // Refresh all dimensions
  const refreshAllDimensions = useCallback(async () => {
    setIsLoading(true)
    try {
      const promises = dimensions.map(dimension => 
        fetchFilterOptions(dimension).then(options => ({ dimension, options }))
      )
      
      const results = await Promise.all(promises)
      
      const newFilterOptions = results.reduce((acc, { dimension, options }) => {
        acc[dimension] = options
        return acc
      }, {} as Record<string, FilterOption[]>)
      
      setFilterOptions(newFilterOptions)
    } catch (err) {
      console.error('Error refreshing all dimensions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [dimensions, fetchFilterOptions])

  // Add a new toggle dimension
  const addToggleDimension = useCallback(async (
    dimension: string,
    config: {
      sourceTable: string
      sourceColumn: string
      masterTable: string
    }
  ) => {
    try {
      const response = await fetch('/api/master-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dimension,
          ...config
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to add toggle dimension')
      }
      
      const result = await response.json()
      console.log('Toggle dimension added:', result)
      
      // Refresh the new dimension
      await refreshDimension(dimension)
    } catch (err) {
      console.error('Error adding toggle dimension:', err)
      setError('Failed to add toggle dimension')
      throw err
    }
  }, [refreshDimension])

  // Get agent health status
  const getAgentHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/master-toggle/health')
      
      if (!response.ok) {
        throw new Error('Failed to get agent health')
      }
      
      return await response.json()
    } catch (err) {
      console.error('Error getting agent health:', err)
      setError('Failed to get agent health')
      throw err
    }
  }, [])

  // Initialize connection and load initial data
  useEffect(() => {
    if (autoConnect && dimensions.length > 0) {
      connectWebSocket()
      refreshAllDimensions()
    }
    
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [autoConnect, dimensions])

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  return {
    filterOptions,
    isConnected,
    isLoading,
    error,
    refreshDimension,
    refreshAllDimensions,
    addToggleDimension,
    getAgentHealth
  }
}

// Hook for managing a single dimension
export function useDimensionFilter(dimension: string) {
  const {
    filterOptions,
    isConnected,
    isLoading,
    error,
    refreshDimension
  } = useMasterToggleAgent([dimension])

  return {
    options: filterOptions[dimension] || [],
    isConnected,
    isLoading,
    error,
    refresh: () => refreshDimension(dimension)
  }
}

// Hook for getting all available dimensions
export function useAvailableDimensions() {
  const [dimensions, setDimensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDimensions = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/master-toggle', {
        method: 'OPTIONS'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch dimensions')
      }
      
      const data = await response.json()
      setDimensions(data.dimensions)
    } catch (err) {
      console.error('Error fetching dimensions:', err)
      setError('Failed to fetch dimensions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDimensions()
  }, [])

  return {
    dimensions,
    isLoading,
    error,
    refresh: fetchDimensions
  }
}