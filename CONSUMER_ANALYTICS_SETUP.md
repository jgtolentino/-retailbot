# Consumer Analytics Database Setup

This guide will help you set up the Consumer Analytics database schema to fix the 404 errors in your Scout Databank application.

## 🚀 Quick Start

### 1. Deploy the Database Schema

```bash
# Deploy everything at once
npm run analytics:deploy
```

This command will:
- ✅ Apply the migration to create all missing tables
- ✅ Seed the database with sample data
- ✅ Generate TypeScript types
- ✅ Run validation tests

### 2. Validate the Setup

```bash
# Run validation tests
npm run analytics:validate
```

## 📁 Files Created

### Database Files
- `supabase/migrations/20250719_consumer_analytics_schema.sql` - Main migration file
- `supabase/seed.sql` - Sample data for testing
- `scripts/validate-database.js` - Validation script
- `scripts/deploy-consumer-analytics.sh` - Deployment script

### TypeScript Files
- `lib/consumer-analytics-types.ts` - TypeScript type definitions
- `lib/consumer-analytics-service.ts` - Data service layer with all CRUD operations

## 🗄️ Database Schema

The migration creates these tables:

### Core Tables
- **`consumer_profiles`** - Customer profile information
- **`transactions`** - Purchase transaction data
- **`consumer_behavior`** - User behavior tracking
- **`product_mix`** - Product catalog with performance metrics
- **`suggestion_acceptance`** - AI recommendation tracking

### Analytics Views
- **`consumer_analytics`** - Aggregated consumer insights
- **`product_performance`** - Product performance metrics

## 🔧 Manual Setup (Alternative)

If you prefer to run steps manually:

```bash
# 1. Apply migration
supabase db push

# 2. Seed database
supabase db seed

# 3. Generate types
supabase gen types typescript --local > lib/supabase-types.ts

# 4. Validate
node scripts/validate-database.js
```

## 🎯 Using the Data Services

Import and use the data services in your React components:

```typescript
import { 
  ConsumerProfileService, 
  TransactionService, 
  AnalyticsService 
} from '@/lib/consumer-analytics-service';

// Fetch consumer profiles
const profiles = await ConsumerProfileService.getAll();

// Fetch transactions for date range
const transactions = await TransactionService.getByDateRange(
  '2025-06-18', 
  '2025-07-18'
);

// Get dashboard metrics
const metrics = await AnalyticsService.getDashboardMetrics();
```

## 📊 Sample Data

The seed file includes:
- 5 sample consumer profiles
- 8 sample products across different categories
- 200+ sample transactions
- 500+ behavior records
- 300+ suggestion acceptance records

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User-based access control** - users can only see their own data
- **Public read access** for product catalog
- **Proper foreign key constraints** and indexes for performance

## 🔄 Realtime Features

All tables are enabled for realtime subscriptions:

```typescript
import { RealtimeService } from '@/lib/consumer-analytics-service';

// Subscribe to new transactions
const channel = RealtimeService.subscribeToTransactions((payload) => {
  console.log('New transaction:', payload);
});

// Unsubscribe when done
RealtimeService.unsubscribe(channel);
```

## 🧪 Testing

The validation script tests:
- ✅ Table existence and accessibility
- ✅ CRUD operations
- ✅ Analytics views
- ✅ Date range queries
- ✅ Realtime connections
- ✅ Data counts

## 🔗 Environment Variables

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://cxzllzyxwpyptfretryc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_ACCESS_TOKEN=your_access_token  # For deployment
```

## 🛠️ Troubleshooting

### 404 Errors
- Run `npm run analytics:validate` to check table existence
- Ensure migration was applied: `supabase db push`
- Check RLS policies if authenticated requests fail

### Migration Issues
- Verify Supabase CLI is installed: `supabase --version`
- Check project linking: `supabase link --project-ref your-project-ref`
- Ensure environment variables are set

### Type Errors
- Regenerate types: `npm run db:types`
- Check import paths in your components
- Verify TypeScript configuration

## 🎉 Success!

Once deployed, your application should:
- ✅ No more 404 errors in console
- ✅ Realtime WebSocket connections working
- ✅ All data endpoints responding
- ✅ Dashboard displaying sample data

## 📝 NPM Scripts

- `npm run analytics:deploy` - Deploy complete schema
- `npm run analytics:validate` - Validate database setup
- `npm run db:migrate` - Apply migrations only
- `npm run db:seed` - Seed database only
- `npm run db:types` - Generate TypeScript types
- `npm run db:validate` - Run validation tests

## 🏗️ Architecture

```
Frontend (React/Next.js)
    ↓
Data Service Layer (lib/consumer-analytics-service.ts)
    ↓
Supabase Client (lib/supabase.ts)
    ↓
PostgreSQL Database (with RLS)
```

## 📈 Next Steps

1. **Customize the data** - Replace sample data with your actual data
2. **Add more analytics** - Create custom views and aggregations
3. **Extend the schema** - Add more tables as needed
4. **Configure authentication** - Set up user authentication for RLS
5. **Add more visualizations** - Create charts and graphs using the data

---

**🔍 Need Help?**
- Check the validation output for specific error messages
- Review the Supabase dashboard for table structure
- Look at the browser console for API errors
- Verify your environment variables are correct