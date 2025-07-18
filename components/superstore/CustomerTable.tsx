'use client'

import { useState } from 'react'
import { Users, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

interface Customer {
  id: number
  name: string
  orders: number
  totalValue: number
}

interface CustomerTableProps {
  customers: Customer[]
  loading?: boolean
  onCustomerClick?: (customer: Customer) => void
}

export default function CustomerTable({ customers, loading = false, onCustomerClick }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Customer>('totalValue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: keyof Customer }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-300" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />
  }

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const handleCustomerClick = (customer: Customer) => {
    if (onCustomerClick) {
      onCustomerClick(customer)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
        </div>
        <div className="text-sm text-gray-500">
          {filteredCustomers.length} customers
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  Customer Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('orders')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  Orders
                  <SortIcon field="orders" />
                </button>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('totalValue')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  Total Value
                  <SortIcon field="totalValue" />
                </button>
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => handleCustomerClick(customer)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="font-medium text-gray-900">{customer.name}</div>
                </td>
                <td className="py-3 px-2">
                  <div className="text-gray-600">{customer.orders}</div>
                </td>
                <td className="py-3 px-2">
                  <div className="font-medium text-gray-900">{formatCurrency(customer.totalValue)}</div>
                </td>
                <td className="py-3 px-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No customers found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}