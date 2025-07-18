import { SupabaseClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

export interface RetailQuery {
  text: string
  filters?: {
    dateRange?: { start: Date; end: Date }
    locations?: string[]
    categories?: string[]
    brands?: string[]
  }
  context?: 'sales' | 'inventory' | 'customer' | 'predictive'
}

export interface RetailInsight {
  query: string
  answer: string
  data: any[]
  visualization?: {
    type: 'line' | 'bar' | 'pie' | 'heatmap'
    config: any
  }
  confidence: number
  sources: string[]
  followUp?: string[]
}

export class ScoutRetailBot {
  private supabase: SupabaseClient
  private groq: Groq
  private systemPrompt: string

  constructor(supabase: SupabaseClient, groqApiKey: string) {
    this.supabase = supabase
    this.groq = new Groq({ apiKey: groqApiKey })
    
    this.systemPrompt = `You are Scout RetailBot, an AI assistant for sari-sari store analytics.
    You have access to:
    - Transaction data (sales, products, customers)
    - IoT sensor data (temperature, humidity, foot traffic)
    - Store performance metrics
    - Predictive analytics capabilities
    
    Provide insights in JSON format with:
    1. Clear answer to the query
    2. Supporting data
    3. Visualization recommendations
    4. Confidence level (0-1)
    5. Follow-up questions
    
    Focus on actionable insights for store owners.`
  }

  async query(request: RetailQuery): Promise<RetailInsight> {
    try {
      // Step 1: Generate SQL query using Groq
      const sqlQuery = await this.generateSQL(request)
      
      // Step 2: Execute query against Supabase
      const data = await this.executeQuery(sqlQuery)
      
      // Step 3: Generate insights using Groq
      const insight = await this.generateInsight(request, data)
      
      return insight
    } catch (error) {
      console.error('RetailBot error:', error)
      throw error
    }
  }

  private async generateSQL(request: RetailQuery): Promise<string> {
    const prompt = `
    Convert this retail query to SQL for Scout Dashboard:
    Query: "${request.text}"
    
    Available tables:
    - transactions (id, timestamp, store_id, product_name, amount, quantity, payment_method)
    - iot_telemetry (device_id, timestamp, temperature, humidity, battery_level)
    - gold_store_performance (store_id, period_start, total_revenue, transaction_count)
    
    Filters:
    ${JSON.stringify(request.filters || {})}
    
    Generate a single SQL query that answers the question.
    Return only the SQL, no explanation.
    `

    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a SQL expert for retail analytics.' },
        { role: 'user', content: prompt }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.1,
      max_tokens: 500
    })

    return completion.choices[0]?.message?.content || ''
  }

  private async executeQuery(sql: string): Promise<any[]> {
    // Sanitize and validate SQL
    const sanitizedSQL = this.sanitizeSQL(sql)
    
    // Execute via Supabase RPC or direct query
    try {
      // For demo, we'll parse common queries
      if (sanitizedSQL.includes('transactions')) {
        const { data, error } = await this.supabase
          .from('transactions')
          .select('*')
          .limit(100)
        
        if (error) throw error
        return data || []
      }
      
      // Add more query patterns as needed
      return []
    } catch (error) {
      console.error('Query execution error:', error)
      return []
    }
  }

  private async generateInsight(request: RetailQuery, data: any[]): Promise<RetailInsight> {
    const prompt = `
    Analyze this retail data and provide insights:
    
    Original Question: "${request.text}"
    Data Sample (first 10 rows): ${JSON.stringify(data.slice(0, 10))}
    Total Rows: ${data.length}
    
    Provide response in this JSON format:
    {
      "answer": "Clear answer to the question",
      "keyFindings": ["finding1", "finding2"],
      "visualization": {
        "type": "chart_type",
        "title": "Chart Title",
        "config": {}
      },
      "confidence": 0.85,
      "followUp": ["What else would you like to know?"]
    }
    `

    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')
    
    return {
      query: request.text,
      answer: response.answer || 'Unable to generate insight',
      data: data,
      visualization: response.visualization,
      confidence: response.confidence || 0.5,
      sources: ['transactions', 'iot_telemetry'],
      followUp: response.followUp || []
    }
  }

  private sanitizeSQL(sql: string): string {
    // Basic SQL injection prevention
    return sql
      .replace(/;.*$/g, '') // Remove multiple statements
      .replace(/--.*$/gm, '') // Remove comments
      .trim()
  }

  // Specialized query methods
  async predictSales(storeId: string, days: number = 7): Promise<RetailInsight> {
    return this.query({
      text: `Predict sales for store ${storeId} for the next ${days} days based on historical data`,
      context: 'predictive'
    })
  }

  async analyzeCustomerBehavior(filters?: any): Promise<RetailInsight> {
    return this.query({
      text: 'What are the customer shopping patterns and preferences?',
      filters,
      context: 'customer'
    })
  }

  async getInventoryRecommendations(storeId: string): Promise<RetailInsight> {
    return this.query({
      text: `What products should store ${storeId} stock more of based on sales velocity?`,
      context: 'inventory'
    })
  }
}

// Factory function
export function createRetailBot(supabase: SupabaseClient, groqApiKey: string) {
  return new ScoutRetailBot(supabase, groqApiKey)
}