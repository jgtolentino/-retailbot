'use client'

export const dynamic = 'force-dynamic' // ⛔ disables static rendering

import { useState, useEffect, useCallback } from 'react'
import TransactionTrends from '@/components/databank/TransactionTrends'
import ProductMixAnalytics from '@/components/databank/ProductMixAnalytics'
import ConsumerBehavior from '@/components/databank/ConsumerBehavior'
import ConsumerProfiling from '@/components/databank/ConsumerProfiling'
import DashboardFilters from '@/components/databank/DashboardFilters'
import ExportControls from '@/components/databank/ExportControls'
import { databankService } from '@/services/databankService'
import { Filter, RefreshCw, Database } from 'lucide-react'

export default function ScoutDatabankDashboard() {
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    location: 'all',
    category: 'all',
    brand: 'all'
  })

  const [refreshKey, setRefreshKey] = useState(0)
  const [databankData, setDatabankData] = useState({})
  console.log('Databank data:', databankData)
  const [loading, setLoading] = useState(false)

  // Fetch all databank data
  const fetchDatabankData = useCallback(async () => {
    setLoading(true)
    try {
      const [transactions, productMix, consumerBehavior, consumerProfiles] = await Promise.all([
        databankService.getTransactionTrends(filters),
        databankService.getProductMixData(filters),
        databankService.getConsumerBehaviorData(filters),
        databankService.getConsumerProfiles(filters)
      ])

      setDatabankData({
        transactions,
        productMix,
        consumerBehavior,
        consumerProfiles
      })
    } catch (error) {
      console.error('Error fetching databank data:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchDatabankData()
  }, [filters, refreshKey, fetchDatabankData])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Real-time data subscription
  useEffect(() => {
    const unsubscribe = databankService.subscribeToUpdates((payload) => {
      console.log('Real-time update received:', payload)
      handleRefresh()
    })

    return unsubscribe
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Scout Databank Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  SAP Concur Style Analytics & Insights Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <ExportControls />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <DashboardFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Trends Module */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Transaction Trends</h2>
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <TransactionTrends filters={filters} refreshKey={refreshKey} />
          </div>

          {/* Product Mix & SKU Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Product Mix & SKU Analytics</h2>
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <ProductMixAnalytics filters={filters} refreshKey={refreshKey} />
          </div>

          {/* Consumer Behavior & Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Consumer Behavior & Preferences</h2>
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <ConsumerBehavior filters={filters} refreshKey={refreshKey} />
          </div>

          {/* Consumer Profiling */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Consumer Profiling</h2>
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <ConsumerProfiling filters={filters} refreshKey={refreshKey} />
          </div>
        </div>

        {/* Comparative Analytics Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparative Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Period-over-Period Growth</p>
              <p className="text-2xl font-bold text-green-600 mt-1">+12.5%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Forecast Accuracy</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">94.2%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Market Share</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">28.7%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}