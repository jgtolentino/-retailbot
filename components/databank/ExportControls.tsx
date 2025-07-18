'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

export default function ExportControls() {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const pdf = new jsPDF()
      
      // Add title
      pdf.setFontSize(20)
      pdf.text('Scout Databank Dashboard Report', 20, 20)
      
      // Add generated date
      pdf.setFontSize(10)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
      
      // Add summary statistics
      pdf.setFontSize(12)
      pdf.text('Executive Summary', 20, 45)
      pdf.setFontSize(10)
      pdf.text('• Total Transactions: 15,234', 25, 55)
      pdf.text('• Total Revenue: ₱2,456,789', 25, 62)
      pdf.text('• Average Basket Size: ₱161.23', 25, 69)
      pdf.text('• Customer Growth: +12.5%', 25, 76)
      
      // Save the PDF
      pdf.save('scout-dashboard-report.pdf')
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      // Create workbook
      const wb = XLSX.utils.book_new()
      
      // Transaction data
      const transactionData = [
        ['Date', 'Volume', 'Revenue', 'Avg Basket', 'Duration'],
        ['2024-01-01', 523, 84567, 161.68, '3.2 min'],
        ['2024-01-02', 489, 78234, 160.03, '3.1 min'],
        ['2024-01-03', 612, 98456, 160.88, '3.3 min'],
      ]
      
      // Product mix data
      const productData = [
        ['Category', 'SKUs', 'Revenue', 'Units Sold', 'Market Share'],
        ['Beverages', 145, 456789, 12345, '35%'],
        ['Snacks', 89, 234567, 8765, '25%'],
        ['Personal Care', 67, 189234, 5432, '20%'],
      ]
      
      // Create sheets
      const ws1 = XLSX.utils.aoa_to_sheet(transactionData)
      const ws2 = XLSX.utils.aoa_to_sheet(productData)
      
      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, ws1, 'Transactions')
      XLSX.utils.book_append_sheet(wb, ws2, 'Product Mix')
      
      // Save file
      XLSX.writeFile(wb, 'scout-dashboard-data.xlsx')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative group">
      <button
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        Export Report
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block">
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          disabled={isExporting}
        >
          <FileText className="h-4 w-4" />
          Export as PDF
        </button>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          disabled={isExporting}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export as Excel
        </button>
      </div>
    </div>
  )
}