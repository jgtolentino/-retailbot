# Scout Dashboard Filter System - Detailed Architecture

## Current Implementation Status

### 1. **Existing Filter Components**

#### A. DashboardFilters Component (Basic Implementation)
**Location**: `/components/databank/DashboardFilters.tsx`
- **Status**: ✅ Basic structure implemented
- **Filters**: 
  - Date Range (Today, Last 7/30/90 days, Custom)
  - Location (All, Metro Manila, Luzon, Visayas, Mindanao)
  - Category (All, Beverages, Snacks, Personal Care, Household)
  - Brand (All, Brand A/B/C, Unbranded)

#### B. Main Dashboard Page Filters
**Location**: `/app/dashboard/page.tsx`
- **Status**: ✅ Implemented with state management
- **Enhanced Filters**:
  - Date Range (4 preset options)
  - Region (NCR, Region III, IV-A, VII)
  - Store Class (A, B, C, D, E)
  - Brand (All, TBWA Only, JTI, Alaska, Oishi)

### 2. **Filter System Architecture**

```typescript
// Current Filter State Structure
interface FilterState {
  // Temporal Filters
  dateRange: 'today' | 'last7days' | 'last30days' | 'last90days' | 'custom'
  startDate?: Date
  endDate?: Date
  
  // Geographic Filters
  region: string
  province?: string
  city?: string
  barangay?: string
  storeLocation?: string[]
  
  // Business Filters
  storeClass: 'all' | 'A' | 'B' | 'C' | 'D' | 'E'
  storeType?: 'all' | 'traditional' | 'modern' | 'convenience'
  brand: string
  category: string
  subcategory?: string
  
  // Customer Filters
  customerClass?: 'all' | 'A' | 'B' | 'C' | 'D' | 'E'
  ageGroup?: string
  gender?: 'all' | 'male' | 'female'
  
  // Advanced Filters
  handshakeOnly?: boolean
  tbwaOnly?: boolean
  minimumBasketSize?: number
  paymentMethod?: string
}
```

### 3. **Filter Propagation Flow**

```
User Selection → State Update → useEffect Trigger → Data Fetch → Chart Re-render
     ↓              ↓                ↓                  ↓              ↓
  onChange      setFilters    Dependencies      fetchDashboardData  generateMockData
```

### 4. **Current Implementation Details**

#### A. **State Management**
```typescript
// In dashboard/page.tsx
const [filters, setFilters] = useState({
  dateRange: 'last30days',
  region: 'all',
  storeClass: 'all',
  brand: 'all'
})

// Filter change handler
onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
```

#### B. **Data Fetching Integration**
```typescript
useEffect(() => {
  fetchDashboardData()
}, [filters, activeTab]) // Re-fetch when filters or tab changes

const fetchDashboardData = async () => {
  // Currently mock data, ready for Supabase integration
  setData(generateMockData(activeTab, filters))
}
```

### 5. **Missing/Planned Filter Features**

#### A. **Advanced Geographic Filtering** 🚧
```typescript
// Hierarchical location selection
- Region → Province → City → Barangay
- Multi-select capability
- Store clustering by proximity
- Urban/Rural classification filter
```

#### B. **Time-based Advanced Filters** 🚧
```typescript
- Hour of day filter
- Day of week filter
- Holiday/Non-holiday
- Payday period filter
- Custom date picker with presets
```

#### C. **Socioeconomic Filters** 🚧
```typescript
- Poverty incidence range
- Median income brackets
- Education level
- Healthcare access score
- Infrastructure quality
```

#### D. **Product & Brand Filters** 🚧
```typescript
- Multi-brand selection
- SKU-level filtering
- Price range filters
- Promotion active/inactive
- Stock availability
```

### 6. **Filter Persistence & Sharing**

#### A. **URL State Synchronization** (Not Implemented)
```typescript
// Planned implementation
const syncFiltersToURL = (filters: FilterState) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== 'all') params.set(key, value)
  })
  router.push(`?${params.toString()}`)
}
```

#### B. **Local Storage Persistence** (Not Implemented)
```typescript
// Save user's preferred filters
localStorage.setItem('scoutDashboardFilters', JSON.stringify(filters))
```

### 7. **Filter UI/UX Enhancements Needed**

#### A. **Visual Improvements**
- [ ] Filter chips/tags for active filters
- [ ] Clear all filters button
- [ ] Filter count indicators
- [ ] Collapsible advanced filters panel
- [ ] Filter search/autocomplete for brands

#### B. **Interactive Features**
- [ ] Quick filter presets (e.g., "Last Month TBWA Only")
- [ ] Save custom filter combinations
- [ ] Filter change animations
- [ ] Loading states during filter application

### 8. **Backend Integration Requirements**

#### A. **Supabase Query Builder**
```typescript
// Example implementation needed
const buildSupabaseQuery = (filters: FilterState) => {
  let query = supabase.from('transactions')
  
  // Date range
  if (filters.dateRange !== 'all') {
    const { start, end } = getDateRange(filters.dateRange)
    query = query.gte('transaction_datetime', start)
                 .lte('transaction_datetime', end)
  }
  
  // Region filter
  if (filters.region !== 'all') {
    query = query.eq('region', filters.region)
  }
  
  // Store class
  if (filters.storeClass !== 'all') {
    query = query.eq('store_economic_class', filters.storeClass)
  }
  
  // Brand filter with TBWA check
  if (filters.brand === 'tbwa') {
    query = query.eq('is_tbwa_brand', true)
  } else if (filters.brand !== 'all') {
    query = query.eq('brand', filters.brand)
  }
  
  return query
}
```

### 9. **Performance Optimizations Needed**

#### A. **Debouncing**
```typescript
// Prevent excessive API calls
const debouncedFilterChange = useMemo(
  () => debounce((newFilters) => {
    setFilters(newFilters)
  }, 300),
  []
)
```

#### B. **Filter Result Caching**
```typescript
// Cache filter results
const filterCache = new Map()
const getCacheKey = (filters) => JSON.stringify(filters)
```

### 10. **Responsive Design Status**

- ✅ Basic responsive layout
- 🚧 Mobile filter drawer needed
- 🚧 Touch-friendly filter controls
- 🚧 Tablet-optimized layout

### 11. **Accessibility Features**

- ✅ Keyboard navigation for selects
- 🚧 ARIA labels needed
- 🚧 Screen reader announcements
- 🚧 High contrast mode support

### 12. **Filter Analytics & Insights**

#### Planned Features:
- Track most-used filter combinations
- Suggest filters based on user behavior
- Show result count before applying
- "No results" helpful suggestions

## Implementation Priority

1. **High Priority** 🔴
   - Complete Supabase integration
   - Add hierarchical location filters
   - Implement filter persistence
   - Add loading states

2. **Medium Priority** 🟡
   - Advanced time-based filters
   - Multi-select capabilities
   - Filter presets
   - Mobile optimization

3. **Low Priority** 🟢
   - Socioeconomic filters
   - Filter analytics
   - Advanced caching
   - Custom filter saves

## Next Steps

1. Replace mock data with Supabase queries
2. Add TypeScript interfaces for all filter types
3. Implement URL state sync
4. Create mobile filter drawer
5. Add filter result preview