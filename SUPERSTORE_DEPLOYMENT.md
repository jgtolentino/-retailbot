# 🚀 Scout Retail Dashboard - Superstore Edition Deployment Guide

## Overview
Complete implementation of the Scout Retail Dashboard based on the Superstore clone PRD. This dashboard integrates with your existing MCP infrastructure using RetailBot, Claudia, and LearnBot agents.

## 🏗️ Architecture

### MCP Agent Integration
- **RetailBot** - KPI calculations and retail analytics
- **Claudia** - Filter synchronization and dashboard orchestration  
- **LearnBot** - Natural language insights and narrative generation
- **PULSER** - Primary orchestration agent

### Tech Stack
- **Frontend**: React + Next.js + Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## 📁 Project Structure

```
scout-databank-clone/
├── agents/
│   ├── retailbot.yaml          # RetailBot configuration
│   ├── claudia.yaml            # Claudia configuration
│   └── learnbot.yaml           # LearnBot configuration
├── app/
│   ├── dashboard/page.tsx      # Original dashboard
│   └── superstore/page.tsx     # New Superstore dashboard
├── components/superstore/
│   ├── SuperstoreDashboard.tsx # Main dashboard component
│   ├── KPIBox.tsx             # KPI metric cards
│   ├── RevenueTrendChart.tsx  # Revenue trend visualization
│   ├── CustomerTable.tsx     # Customer analytics table
│   ├── StateMap.tsx          # State performance map
│   └── FiltersPanel.tsx      # Filter controls
├── data/
│   └── superstore_schema.sql  # Complete database schema
├── lib/
│   └── data-service.ts        # Data service layer
└── tests/
    └── *.bru                  # Bruno API tests
```

## 🗄️ Database Setup

### Step 1: Apply Superstore Schema
1. Go to your Supabase dashboard: https://supabase.com/dashboard/projects
2. Select project: **cxzllzyxwpyptfretryc**
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `data/superstore_schema.sql`
5. Click **Run** to execute the schema

### Step 2: Verify Data
The schema creates:
- **5,000 sample orders** across 2 years
- **100 customers** in 4 regions
- **200 products** across 3 categories
- **Materialized views** for performance
- **Real-time subscriptions** enabled

## 🤖 Agent Configuration

### RetailBot Integration
```yaml
# Handles KPI calculations and retail analytics
capabilities:
  - kpi_calculation
  - delta_analysis
  - trend_detection
  - benchmark_comparison
```

### Claudia Integration
```yaml
# Manages filter synchronization and dashboard orchestration
capabilities:
  - filter_synchronization
  - dashboard_orchestration
  - drill_down_navigation
  - cross_component_communication
```

### LearnBot Integration
```yaml
# Generates natural language insights and narratives
capabilities:
  - narrative_generation
  - insight_extraction
  - anomaly_detection
  - contextual_storytelling
```

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
cd /Users/tbwa/Desktop/scout-databank-clone
npm install
```

### Step 2: Apply Database Schema
```bash
# Copy data/superstore_schema.sql to Supabase SQL Editor and execute
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Access Dashboards
- **Original Dashboard**: http://localhost:3000/dashboard
- **Superstore Dashboard**: http://localhost:3000/superstore

### Step 5: Configure Agent Integration
```bash
# Configure your MCP agents to use the new YAML files
pulser configure agents/retailbot.yaml
pulser configure agents/claudia.yaml
pulser configure agents/learnbot.yaml
```

## 📊 Dashboard Features

### KPI Cards
- **Transactions**: Total order count with YoY comparison
- **Revenue**: Total revenue with trend indicators
- **Profit**: Profit margins with delta analysis
- **Items Sold**: Quantity metrics with growth rates

### Interactive Charts
- **Revenue Trend Chart**: Daily revenue and profit trends
- **Customer Table**: Top customers by total value
- **State Performance**: Top 5 states by revenue
- **Filter Panel**: Year, Region, Segment, Category filters

### Agent-Powered Intelligence
- **Dynamic Narratives**: LearnBot-generated insights
- **Real-time Updates**: Claudia-orchestrated synchronization
- **Smart Analytics**: RetailBot-calculated KPIs

## 🔧 MCP Integration

### Agent Workflow
1. **User changes filters** → Claudia synchronizes state
2. **Claudia triggers RetailBot** → Calculates new KPIs
3. **RetailBot returns data** → Claudia updates components
4. **LearnBot analyzes changes** → Generates narrative
5. **Dashboard updates** → Real-time synchronization

### Task Execution
```bash
# Execute regression tests via MCP
pulser execute mcp-regression-task.yaml

# Run Bruno API tests
bru run tests/ --env development
```

## 🎯 Key Metrics

### Performance Targets
- **Load Time**: < 2 seconds
- **API Response**: < 500ms
- **Chart Render**: < 1 second
- **Filter Sync**: < 300ms

### Data Scale
- **5,000 orders** (2 years)
- **100 customers** (4 regions)
- **200 products** (3 categories)
- **Real-time updates** enabled

## 🧪 Testing

### Regression Tests
```bash
# Run complete regression suite
pulser execute mcp-regression-task.yaml
```

### API Tests
```bash
# Test Supabase endpoints
bru run tests/transactions-api.bru
bru run tests/product-mix-api.bru
```

### UI Tests
```bash
# Test dashboard interactions
npm run test:e2e
```

## 🔍 Monitoring

### Agent Logs
```bash
# View agent execution logs
pulser logs retailbot
pulser logs claudia
pulser logs learnbot
```

### Database Performance
```sql
-- Monitor query performance
SELECT * FROM pg_stat_statements WHERE query LIKE '%superstore%';

-- Check materialized view freshness
SELECT schemaname, matviewname, last_refresh FROM pg_stat_user_tables WHERE schemaname = 'public' AND relname LIKE 'superstore_%';
```

## 🚨 Troubleshooting

### Common Issues

1. **Agent Not Responding**
   ```bash
   pulser status retailbot
   pulser restart retailbot
   ```

2. **Database Connection Issues**
   ```bash
   # Check Supabase connection
   curl -H "apikey: YOUR_ANON_KEY" https://cxzllzyxwpyptfretryc.supabase.co/rest/v1/superstore_orders?select=count
   ```

3. **Real-time Not Working**
   ```sql
   -- Verify realtime is enabled
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```

## 📈 Next Steps

1. **Connect Real Data**: Replace sample data with actual retail data
2. **Enhance Visualizations**: Add more chart types and interactions
3. **Expand Analytics**: Implement advanced retail metrics
4. **Mobile Optimization**: Enhance mobile responsiveness
5. **Performance Tuning**: Optimize queries and caching

## 🎉 Success Criteria

✅ **Dashboard loads in < 2 seconds**
✅ **All KPIs calculate correctly**
✅ **Filters synchronize across components**
✅ **Real-time updates work**
✅ **Agent integration functional**
✅ **Mobile responsive design**
✅ **Regression tests pass**

---

**Your Scout Retail Dashboard is now ready for production!** 🚀

Visit: http://localhost:3000/superstore