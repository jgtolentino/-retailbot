# Scout RetailBot - AI-Powered Analytics

## Overview

Scout RetailBot is an AI-powered natural language analytics system built on top of the Scout Dashboard. It combines the power of Groq's fast LLM inference with your existing Supabase data infrastructure.

## Features

- 🤖 **Natural Language Queries**: Ask questions in plain English
- 📊 **Auto-Generated Visualizations**: AI suggests the best chart types
- 🔮 **Predictive Analytics**: Forecast sales and trends
- ⚡ **Lightning Fast**: Powered by Groq's optimized inference
- 🔄 **Real-Time Data**: Connected to live Supabase database

## Architecture

```
User → AI Analytics UI → Next.js API → RetailBot FastAPI → Groq LLM
                              ↓                                ↓
                         Supabase DB ← SQL Generation ← AI Analysis
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start all services**:
   ```bash
   ./scripts/start-retailbot.sh
   ```

3. **Access the dashboard**:
   - Main Dashboard: http://localhost:3000/dashboard
   - AI Analytics: http://localhost:3000/dashboard/ai
   - API Docs: http://localhost:8000/docs

## Example Queries

### Sales Analysis
- "What are my top selling products this week?"
- "Show me sales trends for the last month"
- "Which payment methods are most popular?"

### Store Performance
- "Which stores have the highest revenue?"
- "Compare store performance by location"
- "What are peak shopping hours?"

### Predictive Analytics
- "Predict sales for next week"
- "What products should I stock more of?"
- "When should I run promotions?"

### IoT Insights
- "How does temperature affect sales?"
- "Show me device health status"
- "Alert me about sensor anomalies"

## API Endpoints

- `POST /api/retailbot/query` - Natural language query
- `POST /api/retailbot/predict` - Sales predictions
- `POST /api/retailbot/recommend` - AI recommendations
- `GET /api/retailbot/examples` - Example queries

## Configuration

The system uses the following environment variables (already configured in `.env.local`):

- `GROQ_API_KEY` - Your Groq API key (✓ Configured)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `DATABASE_URL` - PostgreSQL connection string

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **AI**: Groq (Mixtral 8x7B model)
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Visualization**: Recharts

## Development

To modify the RetailBot:

1. **Frontend UI**: `/components/RetailBotChat.tsx`
2. **API Routes**: `/app/api/retailbot/`
3. **Python Backend**: `/api/retailbot/main.py`
4. **TypeScript Service**: `/services/scoutRetailBot.ts`

## Security

- API key authentication
- SQL injection prevention
- Rate limiting on Groq API
- Sanitized user inputs

## Troubleshooting

If the RetailBot API doesn't start:
1. Check Python 3 is installed: `python3 --version`
2. Install Python dependencies: `cd api/retailbot && pip install -r requirements.txt`
3. Check logs for errors

## Future Enhancements

- [ ] Multi-language support
- [ ] Voice input capabilities
- [ ] Export insights to PDF
- [ ] Scheduled reports
- [ ] Custom ML models
- [ ] Real-time alerts

---

Built with ❤️ using Groq's lightning-fast LLM inference