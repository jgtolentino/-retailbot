# ChipGPT + Scout Dashboard Integration Plan

## 🎯 Goal
Use ChipGPT's full-stack TypeScript SaaS starter as a secure, production-grade backend for Scout Dashboards.

## 🏗️ Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Scout Frontend    │────▶│   ChipGPT MCP       │────▶│   Agent Cluster     │
│   (Next.js)         │     │   (OAuth2 + API)    │     │   (Retail/Ads/etc)  │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Vercel Deploy     │     │   MCP Server        │     │   Supabase DB       │
│   (Frontend)        │     │   (Backend)         │     │   (Data Store)      │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## 📋 Implementation Steps

### Phase 1: OAuth2 Integration (Replace Supabase Auth)

1. **Install Dependencies**
   ```bash
   npm install next-auth @auth/core
   ```

2. **Configure OAuth2 Provider**
   - Create `/pages/api/auth/[...nextauth].ts`
   - Point to ChipGPT OAuth endpoints
   - Map user sessions to Scout roles

3. **Update Environment Variables**
   ```env
   CHIPGPT_CLIENT_ID=your_client_id
   CHIPGPT_CLIENT_SECRET=your_client_secret
   CHIPGPT_MCP_URL=https://mcp.chipgpt.biz
   ```

### Phase 2: MCP Agent Integration

1. **Create Agent Routes**
   ```
   /mcp/retailbot - Retail insights
   /mcp/adsbot - Advertising analytics
   /mcp/learnbot - Learning recommendations
   /mcp/dash - Dashboard orchestrator
   /mcp/gagambi - Creative insights
   /mcp/echo - Feedback processor
   ```

2. **Agent Service Pattern**
   ```typescript
   // services/agents/retailbot.ts
   export class RetailBotService {
     async process(input: AgentInput): Promise<AgentOutput> {
       // Agent logic here
     }
   }
   ```

### Phase 3: Frontend API Migration

1. **Update API Calls**
   - Replace Supabase client calls with MCP endpoints
   - Add OAuth2 token to headers
   - Handle MCP response format

2. **Session Management**
   - Store tokens in secure cookies
   - Refresh tokens automatically
   - Handle logout/revocation

### Phase 4: Data Layer Integration

1. **Hybrid Approach**
   - Keep Supabase for data storage
   - Use ChipGPT for auth/orchestration
   - Sync user sessions between systems

2. **Session Logging**
   ```sql
   CREATE TABLE mcp_sessions (
     id UUID PRIMARY KEY,
     user_id TEXT,
     agent TEXT,
     action TEXT,
     input JSONB,
     output JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

### Phase 5: Deployment Strategy

1. **Frontend**: Continue using Vercel
2. **MCP Backend**: Deploy to separate instance
3. **Database**: Keep existing Supabase
4. **Monitoring**: Add observability layer

## 🚀 Quick Start Commands

```bash
# Register agents with Pulser
pulser agent register --name RetailBot --url https://mcp.chipgpt.biz/mcp/retailbot --auth oauth
pulser agent register --name AdsBot --url https://mcp.chipgpt.biz/mcp/adsbot --auth oauth
pulser agent register --name LearnBot --url https://mcp.chipgpt.biz/mcp/learnbot --auth oauth

# Bind MCP to frontend
pulser mcp bind --frontend scout-dashboard --backend https://mcp.chipgpt.biz/mcp

# Deploy configuration
pulser deploy --env production
```

## 📊 Migration Checklist

- [ ] Set up ChipGPT OAuth2 server
- [ ] Create MCP agent endpoints
- [ ] Update Scout frontend auth
- [ ] Migrate API calls to MCP
- [ ] Test OAuth2 flow
- [ ] Configure session storage
- [ ] Deploy MCP backend
- [ ] Update Vercel env vars
- [ ] Test production deployment
- [ ] Monitor performance

## 🔒 Security Considerations

1. **Token Security**
   - Use secure HTTP-only cookies
   - Implement CSRF protection
   - Regular token rotation

2. **Rate Limiting**
   - Per-user limits
   - Per-agent throttling
   - DDoS protection

3. **Audit Logging**
   - Log all agent calls
   - Track user actions
   - Monitor anomalies

## 📈 Benefits

| Feature | ChipGPT | Current Setup | Improvement |
|---------|---------|---------------|-------------|
| Auth | OAuth2 | Supabase JWT | Enterprise-grade security |
| Agents | MCP Server | Direct calls | Centralized orchestration |
| Sessions | Managed | Manual | Automatic tracking |
| Scaling | Built-in | Limited | Horizontal scaling |
| Multi-tenant | Native | Custom | Out-of-box support |

## 🎯 Next Steps

1. Clone ChipGPT SaaS starter
2. Configure OAuth2 endpoints
3. Create agent microservices
4. Update Scout frontend
5. Deploy and test

Ready to proceed with `:clodrep`?