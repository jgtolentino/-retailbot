# Master Toggle Agent - Scout Dash

## Overview

The Master Toggle Agent is an autonomous service that automatically detects new transaction or dimension data, updates central master-data tables, and keeps all cascading filters fresh and operational in the Scout Dash ecosystem.

## 🎯 Key Features

- **Real-time Data Detection**: Listens for changes in transaction data via Supabase real-time subscriptions
- **Automatic Master-Data Updates**: Upserts new dimension values into master tables
- **Stale Value Pruning**: Removes outdated filter options that no longer exist in source data
- **WebSocket Event Bus**: Pushes real-time filter updates to connected UI clients
- **Toggle API**: Allows adding new filter dimensions via API without code deployment
- **Config-Driven**: Supports new dimensions through configuration, not code changes

## 🏗️ Architecture

```
┌─────────────────┐    ┌────────────────────┐    ┌─────────────────┐
│   Transaction   │    │  Master Toggle     │    │   Dashboard     │
│     Tables      │───▶│     Agent          │───▶│      UI         │
│                 │    │                    │    │                 │
└─────────────────┘    └────────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌────────────────────┐
                       │  Master Data       │
                       │    Tables          │
                       │                    │
                       └────────────────────┘
```

## 📁 File Structure

```
scout-databank-clone/
├── services/
│   └── masterToggleAgent.ts      # Core agent service
├── config/
│   └── masterToggleConfig.ts     # Configuration management
├── api/routes/
│   └── masterToggle.ts           # API endpoints
├── hooks/
│   └── useMasterToggleAgent.ts   # React hooks for UI integration
├── schema/
│   └── master_data_tables.sql    # Database schema
├── scripts/
│   ├── start-master-toggle-agent.sh
│   └── stop-master-toggle-agent.sh
└── docs/
    └── MASTER_TOGGLE_AGENT_README.md
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database with Supabase
- Environment variables configured

### 2. Environment Setup

```bash
# Required environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export NODE_ENV="development"
export MASTER_TOGGLE_PORT="8080"
```

### 3. Database Schema

Apply the master data tables schema:

```bash
# Apply schema to your Supabase database
psql -h your-db-host -d your-db-name -f schema/master_data_tables.sql
```

### 4. Start the Agent

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Start the agent
./scripts/start-master-toggle-agent.sh
```

### 5. Verify Installation

```bash
# Check agent health
curl http://localhost:3000/api/master-toggle/health

# Get filter options
curl http://localhost:3000/api/master-toggle?dimension=region

# View logs
tail -f logs/master-toggle-agent.log
```

## 📊 Configuration

### Default Dimensions

The agent monitors these dimensions by default:

| Dimension | Source Table | Source Column | Master Table |
|-----------|-------------|---------------|--------------|
| region | transactions | region | master_regions |
| province | transactions | province | master_provinces |
| city | transactions | city_municipality | master_cities |
| brand | transactions | brand | master_brands |
| category | transactions | product_category | master_categories |
| payment_method | transactions | payment_method | master_payment_methods |

### Custom Configuration

```typescript
// config/masterToggleConfig.ts
export const customConfig: MasterToggleConfig = {
  dimensions: {
    my_dimension: {
      sourceTable: 'transactions',
      sourceColumn: 'my_column',
      masterTable: 'master_my_dimension',
      enabled: true,
      refreshInterval: 60000 // 1 minute
    }
  },
  websocketPort: 8080,
  pruneInterval: 300000 // 5 minutes
}
```

## 🔌 API Reference

### GET /api/master-toggle

Get filter options for a dimension.

**Parameters:**
- `dimension` (required): The dimension name

**Response:**
```json
{
  "dimension": "region",
  "options": ["Metro Manila", "Cebu", "Davao"],
  "count": 3,
  "timestamp": "2025-07-18T10:30:00Z"
}
```

### POST /api/master-toggle

Add a new toggle dimension.

**Request Body:**
```json
{
  "dimension": "payment_method",
  "sourceTable": "transactions",
  "sourceColumn": "payment_method",
  "masterTable": "master_payment_methods"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Toggle dimension 'payment_method' added successfully"
}
```

### GET /api/master-toggle/health

Get agent health status.

**Response:**
```json
{
  "status": "healthy",
  "dimensions": 12,
  "uptime": 3600
}
```

### OPTIONS /api/master-toggle

Get all dimensions and their configuration.

**Response:**
```json
{
  "dimensions": [
    {
      "dimension": "region",
      "enabled": true,
      "sourceTable": "transactions",
      "sourceColumn": "region",
      "masterTable": "master_regions"
    }
  ],
  "totalDimensions": 12,
  "enabledDimensions": 10,
  "agentStatus": { "status": "healthy" }
}
```

## 🎨 UI Integration

### React Hook Usage

```typescript
import { useDimensionFilter } from '../hooks/useMasterToggleAgent'

function MyFilterComponent() {
  const { options, isConnected, isLoading, error } = useDimensionFilter('region')
  
  return (
    <select disabled={isLoading}>
      <option value="">All Regions</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.display_name}
        </option>
      ))}
    </select>
  )
}
```

### WebSocket Integration

```typescript
import { useMasterToggleAgent } from '../hooks/useMasterToggleAgent'

function Dashboard() {
  const { 
    filterOptions, 
    isConnected, 
    refreshAllDimensions 
  } = useMasterToggleAgent(['region', 'brand', 'category'])
  
  // Filter options automatically update via WebSocket
  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {/* Your filter components */}
    </div>
  )
}
```

## 🔧 Management Commands

### Start Agent
```bash
./scripts/start-master-toggle-agent.sh
```

### Stop Agent
```bash
./scripts/stop-master-toggle-agent.sh
```

### View Logs
```bash
tail -f logs/master-toggle-agent.log
```

### Health Check
```bash
curl http://localhost:3000/api/master-toggle/health
```

### Add New Dimension
```bash
curl -X POST http://localhost:3000/api/master-toggle \
  -H "Content-Type: application/json" \
  -d '{
    "dimension": "store_type",
    "sourceTable": "transactions",
    "sourceColumn": "store_type",
    "masterTable": "master_store_types"
  }'
```

## 📈 Performance Metrics

### Target Metrics (from PRD)

- **Filter Freshness**: ≤ 60 seconds from data arrival
- **API Latency**: ≤ 5ms for filter options lookup
- **Throughput**: 10,000 updates/minute
- **Uptime**: 99.9%

### Monitoring

```bash
# Check WebSocket connections
curl http://localhost:3000/api/master-toggle/health

# Monitor database performance
SELECT 
  schemaname,
  tablename,
  n_tup_ins,
  n_tup_upd,
  n_tup_del
FROM pg_stat_user_tables 
WHERE schemaname = 'master_data';
```

## 🔍 Troubleshooting

### Common Issues

1. **Agent Won't Start**
   - Check environment variables
   - Verify database connection
   - Review logs: `tail -f logs/master-toggle-agent.log`

2. **WebSocket Connection Failed**
   - Check port availability: `netstat -an | grep 8080`
   - Verify firewall settings
   - Check browser console for errors

3. **Filter Options Not Updating**
   - Check real-time subscriptions in Supabase
   - Verify trigger permissions
   - Monitor agent logs for errors

4. **High Memory Usage**
   - Increase pruning frequency
   - Check for memory leaks in logs
   - Restart agent if needed

### Debug Mode

```bash
# Enable debug logging
export DEBUG=master-toggle-agent:*
./scripts/start-master-toggle-agent.sh
```

## 🛡️ Security Considerations

- Use service role key only on server-side
- Enable RLS on master data tables
- Validate all API inputs
- Monitor for unusual activity
- Rate limit API endpoints

## 🚀 Deployment

### Development
```bash
NODE_ENV=development ./scripts/start-master-toggle-agent.sh
```

### Production
```bash
NODE_ENV=production ./scripts/start-master-toggle-agent.sh
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "start-agent.js"]
```

## 📋 Maintenance

### Regular Tasks

1. **Monitor Logs**: Check for errors and performance issues
2. **Database Maintenance**: Vacuum and analyze master tables
3. **Performance Review**: Monitor API latency and throughput
4. **Configuration Updates**: Add new dimensions as needed

### Backup Strategy

```bash
# Backup master data tables
pg_dump -h your-host -d your-db --schema=master_data > master_data_backup.sql
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 Changelog

### v1.0.0 (2025-07-18)
- Initial implementation
- Real-time data change detection
- Master-data upsert service
- WebSocket event bus
- Toggle API
- React UI integration
- Management scripts

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review agent logs
- Contact the development team

## 📄 License

MIT License - See LICENSE file for details.