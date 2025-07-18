'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Sparkles, TrendingUp, Package, Users, AlertCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface QueryExample {
  category: string
  queries: string[]
}

interface InsightResponse {
  query: string
  answer: string
  data: any[]
  visualization?: {
    type: 'line' | 'bar' | 'pie'
    title: string
    x_axis?: string
    y_axis?: string
  }
  confidence: number
  sources: string[]
  follow_up: string[]
  timestamp: string
}

export function RetailBotChat() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<InsightResponse[]>([])
  const [examples, setExamples] = useState<QueryExample[]>([])

  // Load examples on mount
  useState(() => {
    fetchExamples()
  }, [])

  const fetchExamples = async () => {
    try {
      const response = await fetch('/api/retailbot/examples')
      const data = await response.json()
      setExamples(data.examples || [])
    } catch (error) {
      console.error('Failed to load examples:', error)
    }
  }

  const sendQuery = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/retailbot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
      })

      if (!response.ok) throw new Error('Query failed')

      const insight = await response.json()
      setInsights([insight, ...insights])
      setQuery('')
    } catch (error) {
      console.error('Query error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderVisualization = (insight: InsightResponse) => {
    if (!insight.visualization || !insight.data.length) return null

    const { type, title } = insight.visualization

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insight.data.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={insight.visualization.x_axis || 'timestamp'} />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={insight.visualization.y_axis || 'amount'} 
                stroke="#3b82f6" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insight.data.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={insight.visualization.x_axis || 'product_name'} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={insight.visualization.y_axis || 'quantity'} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={insight.data.slice(0, 5)}
                dataKey={insight.visualization.y_axis || 'amount'}
                nameKey={insight.visualization.x_axis || 'category'}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {insight.data.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Scout RetailBot - AI Analytics Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ask about sales, inventory, predictions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendQuery()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={sendQuery} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Thinking...' : 'Ask'}
            </Button>
          </div>

          {/* Example Queries */}
          <div className="mt-4">
            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sales">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Sales
                </TabsTrigger>
                <TabsTrigger value="inventory">
                  <Package className="h-4 w-4 mr-1" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="customers">
                  <Users className="h-4 w-4 mr-1" />
                  Customers
                </TabsTrigger>
                <TabsTrigger value="predictive">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Predictive
                </TabsTrigger>
              </TabsList>

              {examples.map((category) => (
                <TabsContent key={category.category} value={category.category.toLowerCase().split(' ')[0]}>
                  <div className="grid grid-cols-1 gap-2">
                    {category.queries.map((example) => (
                      <Button
                        key={example}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left"
                        onClick={() => setQuery(example)}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">You asked:</p>
                <p className="font-medium">{insight.query}</p>
              </div>
              <Badge variant={insight.confidence > 0.8 ? 'default' : 'secondary'}>
                {Math.round(insight.confidence * 100)}% confident
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Answer */}
            <div className="mb-4">
              <p className="text-lg">{insight.answer}</p>
            </div>

            {/* Visualization */}
            {insight.visualization && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">{insight.visualization.title}</h4>
                {renderVisualization(insight)}
              </div>
            )}

            {/* Data Preview */}
            {insight.data.length > 0 && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium">
                  View Data ({insight.data.length} rows)
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="text-sm">
                    <thead>
                      <tr>
                        {Object.keys(insight.data[0]).map((key) => (
                          <th key={key} className="px-2 py-1 text-left border-b">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {insight.data.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value: any, j) => (
                            <td key={j} className="px-2 py-1 border-b">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}

            {/* Follow-up Questions */}
            {insight.follow_up.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Follow-up questions:</p>
                <div className="flex flex-wrap gap-2">
                  {insight.follow_up.map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Sources:</span>
              {insight.sources.map((source) => (
                <Badge key={source} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
              <span className="ml-auto">{new Date(insight.timestamp).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}