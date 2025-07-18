# Scout Databank Dashboard

A standalone clone of the Scout Analytics Databank dashboard, featuring SAP Concur-style analytics and insights.

## 🚀 Features

- **Transaction Trends** - Real-time sales and transaction analytics
- **Product Mix & SKU Analytics** - Comprehensive product performance insights
- **Consumer Behavior & Preferences** - Customer interaction patterns
- **Consumer Profiling** - Demographic and behavioral analytics
- **Interactive Filters** - Dynamic data filtering and exploration
- **Export Controls** - Data export capabilities

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Supabase** - Backend database and real-time subscriptions
- **Lucide React** - Icon library

## 🏗️ Architecture

```
Scout Databank Dashboard
├── 📊 Transaction Trends Module
├── 📦 Product Mix & SKU Analytics
├── 👥 Consumer Behavior Analysis
├── 🎯 Consumer Profiling
├── 🔄 Real-time Data Processing
└── 📤 Export & Filtering System
```

## 🚀 Getting Started

### 🏠 Local Development (Recommended)

**1-Command Setup:**
```bash
# Set up local Supabase instance with Docker
npm run local:setup
```

**Start Development:**
```bash
# Start Next.js with local database
npm run dev
```

**Check Status:**
```bash
# Verify everything is running
npm run local:check
```

**Open Studio Dashboard:**
```bash
# View your local database
npm run local:studio
```

📖 **For detailed local development guide, see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)**

### ☁️ Cloud Deployment

When ready to deploy to production:

```bash
# Deploy local instance to cloud
npm run cloud:deploy
```

### 🔧 Manual Setup (Alternative)

If you prefer manual setup:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_ACCESS_TOKEN=your_access_token  # For deployment
   ```

3. **Deploy the database schema**
   ```bash
   npm run analytics:deploy
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Troubleshooting

If you see 404 errors in the console:

```bash
# Validate your database setup
npm run analytics:validate

# If validation fails, redeploy
npm run analytics:deploy
```

📖 **For detailed setup instructions, see [CONSUMER_ANALYTICS_SETUP.md](./CONSUMER_ANALYTICS_SETUP.md)**

## 📊 Data Structure

The dashboard connects to a Supabase database with the following tables:
- `transactions` - Transaction records
- `product_mix` - Product performance data
- `consumer_behavior` - Behavioral analytics
- `consumer_profiles` - Customer demographics
- `product_substitutions` - Product substitution data
- `suggestion_acceptance` - Suggestion performance
- `sku_analytics` - SKU-level insights

## 🎯 Key Components

- **DashboardFilters** - Interactive filtering system
- **TransactionTrends** - Sales trend visualization
- **ProductMixAnalytics** - Product performance charts
- **ConsumerBehavior** - Behavioral insights
- **ConsumerProfiling** - Customer profiling
- **ExportControls** - Data export functionality

## 🔧 Services

- **databankService** - Core data service with AI insights
- **useSupabaseData** - React hooks for data fetching
- **supabase** - Database client configuration

## 📈 Performance

- **Build Size**: ~497KB total
- **Response Time**: <500ms for data queries
- **Real-time Updates**: Live data synchronization
- **Static Generation**: Optimized for performance

## 🌐 Deployment

Deploy to Vercel, Netlify, or any Next.js-compatible platform:

```bash
npm run build
npm run start
```

## 📄 License

This is a standalone clone of the Scout Analytics Databank dashboard for demonstration purposes.

---

**Built with Scout Analytics Platform**  
*Powered by Next.js, TypeScript, and Supabase*