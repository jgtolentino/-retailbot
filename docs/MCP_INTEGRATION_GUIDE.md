# Master Toggle Agent - MCP Integration Guide

## Overview

The Master Toggle Agent is now fully integrated with the Model Context Protocol (MCP) ecosystem, enabling seamless collaboration with other agents like Lyra, Pulser, and Bruno.

## 🔐 MCP Credentials Setup

### 1. Create Personal Access Token

1. Go to [Supabase Account Tokens](https://app.supabase.com/account/tokens)
2. Create a new personal access token
3. Name it: "Master Toggle Agent MCP"
4. Copy the token securely

### 2. Configure Environment

Create `.env.mcp` file in your project root:

```bash
# Copy from example
cp .env.mcp.example .env.mcp

# Edit with your credentials
SUPABASE_PROJECT_REF=cxzllzyxwpyptfretryc
SUPABASE_ACCESS_TOKEN=your-personal-access-token
SUPABASE_ROLE=service_role
MCP_READ_ONLY=false
```

### 3. Apply Agent Repository Schema

The agent repository schema enables inter-agent communication:

```bash
# Using Supabase CLI
supabase db push --db-url postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres --file schema/agent_repository.sql

# Or via SQL Editor in Supabase Dashboard
# Copy contents of schema/agent_repository.sql
```

## 🚀 Starting the MCP-Enabled Agent

### Quick Start

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Start with MCP integration
./scripts/start-master-toggle-mcp.sh
```

### Manual Start

```bash
# Set environment variables
export SUPABASE_PROJECT_REF=cxzllzyxwpyptfretryc
export SUPABASE_ACCESS_TOKEN=your-token
export NODE_ENV=development

# Run the MCP agent
node start-agent-mcp.js
```

## 🤝 Agent Collaboration

### How Master Toggle Agent Works with Others

```mermaid
graph LR
    MTA[Master Toggle Agent] -->|Filter Updates| LA[Lyra Agent]
    MTA -->|Dimension Changes| PA[Pulser Agent]
    MTA -->|API Endpoints| BA[Bruno Agent]
    
    LA -->|Task Requests| MTA
    PA -->|Analytics Requests| MTA
    BA -->|Test Results| MTA
    
    ALL[All Agents] <-->|Shared Knowledge| AR[(Agent Repository)]
```

### Communication Examples

#### 1. Notify Lyra Agent of Filter Updates

```typescript
// Automatically happens when filters change
await agent.notifyLyraAgent('filter_dimension_updated', {
  dimension: 'region',
  action: 'upsert',
  values: ['Metro Manila', 'Cebu', 'Davao']
})
```

#### 2. Share Knowledge with Other Agents

```typescript
// Share available dimensions
await agent.shareKnowledge('filter_dimensions', 'available_dimensions', {
  dimensions: ['region', 'brand', 'category', 'payment_method']
})
```

#### 3. Get Analytics from Pulser

```typescript
// Request analytics for a dimension
await agent.sendMessageToAgent('pulser-agent', 'analytics_request', {
  dimension: 'brand',
  metrics: ['distribution', 'trends', 'anomalies']
})
```

## 📊 Monitoring Agent Interactions

### View Agent Status

```bash
# Check all agents in the ecosystem
curl http://localhost:3000/api/master-toggle/health | jq '.mcp'

# View agent registry
psql -c "SELECT agent_name, agent_type, version FROM agent_repository.agents"
```

### Monitor Inter-Agent Messages

```sql
-- Recent agent interactions
SELECT 
  f.agent_name as from_agent,
  t.agent_name as to_agent,
  i.interaction_type,
  i.created_at
FROM agent_repository.interactions i
JOIN agent_repository.agents f ON i.from_agent_id = f.id
JOIN agent_repository.agents t ON i.to_agent_id = t.id
ORDER BY i.created_at DESC
LIMIT 10;
```

### View Shared Knowledge

```sql
-- Knowledge shared by agents
SELECT 
  a.agent_name,
  k.category,
  k.key,
  k.created_at
FROM agent_repository.knowledge k
JOIN agent_repository.agents a ON k.agent_id = a.id
ORDER BY k.created_at DESC;
```

## 🔧 MCP Tools Available

The Master Toggle Agent can use these MCP tools:

| Tool | Function | Example Use |
|------|----------|-------------|
| `execute_sql` | Run SQL queries | Update master data tables |
| `list_tables` | List database tables | Discover new dimensions |
| `apply_migration` | Apply schema changes | Add new master tables |
| `get_logs` | Fetch service logs | Debug real-time issues |
| `search_docs` | Search Supabase docs | Find best practices |

## 🎯 Integration Patterns

### Pattern 1: Dimension Discovery

When new data arrives:
1. Master Toggle Agent detects new dimension values
2. Updates master data tables
3. Notifies Lyra Agent for workflow updates
4. Pulser Agent analyzes the new dimension
5. Bruno Agent tests filter API endpoints

### Pattern 2: Cross-Agent Analytics

When analytics are needed:
1. Lyra Agent requests dimension analysis
2. Master Toggle Agent provides current filter options
3. Pulser Agent performs analytics
4. Results shared via agent repository

### Pattern 3: Health Monitoring

Every minute:
1. Each agent reports health status
2. Stored in shared knowledge base
3. Lyra Agent monitors overall system health
4. Alerts on anomalies

## 🛡️ Security Best Practices

### MCP Credentials

- **Never commit tokens**: Use environment variables
- **Use read-only mode**: For production safety
- **Rotate tokens regularly**: Monthly recommended
- **Monitor access logs**: Check for unusual activity

### Agent Communication

- **Validate messages**: Check sender agent ID
- **Rate limit interactions**: Prevent spam
- **Encrypt sensitive data**: Use JSONB encryption
- **Audit all actions**: Log to agent_repository.tasks

## 📈 Performance Optimization

### Connection Pooling

```typescript
// Reuse Supabase client across agents
const supabasePool = new Map<string, SupabaseClient>()

function getSupabaseClient(projectRef: string, token: string) {
  const key = `${projectRef}:${token.substring(0, 8)}`
  if (!supabasePool.has(key)) {
    supabasePool.set(key, createClient(...))
  }
  return supabasePool.get(key)!
}
```

### Batch Operations

```typescript
// Batch knowledge updates
const knowledgeUpdates = []
for (const dimension of dimensions) {
  knowledgeUpdates.push({
    category: 'filter_dimensions',
    key: dimension,
    value: await getFilterOptions(dimension)
  })
}
await agent.batchShareKnowledge(knowledgeUpdates)
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Agent Registration Fails

```bash
# Check agent repository schema
psql -c "\dn agent_repository"

# Verify credentials
curl -H "apikey: your-token" \
  https://[project-ref].supabase.co/rest/v1/
```

#### 2. WebSocket Connection Issues

```bash
# Check if port is available
lsof -i :8080

# Test WebSocket directly
wscat -c ws://localhost:8080
```

#### 3. Inter-Agent Communication Fails

```sql
-- Check agent status
SELECT * FROM agent_repository.agents 
WHERE agent_name = 'master-toggle-agent';

-- View recent errors
SELECT * FROM agent_repository.tasks 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 5;
```

## 📚 Advanced Usage

### Custom Agent Protocols

```typescript
// Define custom protocol
const CUSTOM_PROTOCOL = {
  DIMENSION_ANALYTICS: 'dimension_analytics_request'
}

// Send custom message
await agent.sendMessageToAgent('custom-agent', 
  CUSTOM_PROTOCOL.DIMENSION_ANALYTICS, {
    dimensions: ['brand', 'category'],
    timeRange: 'last_30_days',
    metrics: ['growth', 'volatility']
  }
)
```

### Event Subscriptions

```typescript
// Subscribe to specific agent events
agent.on('agent_message', (message) => {
  if (message.from === 'lyra-agent' && 
      message.type === 'task_request') {
    handleLyraTask(message.payload)
  }
})
```

### Knowledge Queries

```typescript
// Complex knowledge queries
const brandKnowledge = await agent.getSharedKnowledge(
  'analytics_results',
  'brand_performance_2024'
)

const filterStats = await agent.getSharedKnowledge(
  'filter_dimensions',
  null // Get all dimension knowledge
)
```

## 🔄 Migration from Standalone

If migrating from standalone to MCP:

1. **Backup existing data**
   ```bash
   pg_dump --table=master_data.* > master_data_backup.sql
   ```

2. **Update configuration**
   - Add MCP credentials to environment
   - Update startup scripts

3. **Register with ecosystem**
   ```bash
   ./scripts/start-master-toggle-mcp.sh
   ```

4. **Verify integration**
   - Check agent appears in registry
   - Test inter-agent communication
   - Monitor logs for errors

## 📞 Support

For MCP integration issues:
1. Check the troubleshooting section
2. Review agent logs: `logs/master-toggle-agent-mcp.log`
3. Query agent repository for error details
4. Contact the MCP team with agent ID and logs