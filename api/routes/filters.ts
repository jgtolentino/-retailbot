import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'

const router = Router()

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cache for filter values
const filterCache = new Map<string, { data: any[], timestamp: number }>()
const CACHE_TTL = 60000 // 60 seconds

// Get distinct values for a dimension
router.get('/:dimension', async (req, res) => {
  try {
    const { dimension } = req.params
    const { region, province, category } = req.query
    
    // Check cache first
    const cacheKey = `${dimension}-${JSON.stringify(req.query)}`
    const cached = filterCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data)
    }

    let query = supabase.from('transactions').select(dimension)
    
    // Apply cascading filters
    if (dimension === 'province' && region) {
      query = query.eq('region', region)
    } else if (dimension === 'city' && province) {
      query = query.eq('province', province)
    } else if (dimension === 'subcategory' && category) {
      query = query.eq('product_category', category)
    }

    // Get distinct values
    const { data, error } = await query
    if (error) throw error

    // Extract unique values
    const uniqueValues = [...new Set(data.map(row => row[dimension]))]
      .filter(Boolean)
      .sort()

    // Cache the result
    filterCache.set(cacheKey, { data: uniqueValues, timestamp: Date.now() })

    res.json(uniqueValues)
  } catch (error) {
    console.error('Filter API error:', error)
    res.status(500).json({ error: 'Failed to fetch filter options' })
  }
})

// Get filter metadata (counts, ranges, etc.)
router.get('/:dimension/metadata', async (req, res) => {
  try {
    const { dimension } = req.params
    
    switch (dimension) {
      case 'price_range':
        const { data: priceData } = await supabase
          .from('transactions')
          .select('unit_price')
          .order('unit_price')
        
        const prices = priceData?.map(r => r.unit_price) || []
        res.json({
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: prices.reduce((a, b) => a + b, 0) / prices.length,
          median: prices[Math.floor(prices.length / 2)]
        })
        break
        
      case 'basket_size':
        const { data: basketData } = await supabase
          .from('transactions')
          .select('sales')
          .order('sales')
        
        const baskets = basketData?.map(r => r.sales) || []
        res.json({
          min: Math.min(...baskets),
          max: Math.max(...baskets),
          avg: baskets.reduce((a, b) => a + b, 0) / baskets.length,
          percentiles: {
            p25: baskets[Math.floor(baskets.length * 0.25)],
            p50: baskets[Math.floor(baskets.length * 0.50)],
            p75: baskets[Math.floor(baskets.length * 0.75)],
            p95: baskets[Math.floor(baskets.length * 0.95)]
          }
        })
        break
        
      default:
        // Get value counts
        const { data: countData } = await supabase
          .from('transactions')
          .select(dimension)
        
        const counts = countData?.reduce((acc, row) => {
          const value = row[dimension]
          acc[value] = (acc[value] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        res.json({ counts, total: countData?.length || 0 })
    }
  } catch (error) {
    console.error('Metadata API error:', error)
    res.status(500).json({ error: 'Failed to fetch metadata' })
  }
})

// Invalidate cache for a dimension
router.post('/:dimension/invalidate', async (req, res) => {
  const { dimension } = req.params
  
  // Clear all cache entries for this dimension
  for (const [key] of filterCache.entries()) {
    if (key.startsWith(dimension)) {
      filterCache.delete(key)
    }
  }
  
  res.json({ success: true, message: `Cache cleared for ${dimension}` })
})

export default router