# Supabase Configuration - Scout Databank

## ✅ Credentials Configured

Your Scout Databank is now configured with your real Supabase instance:

- **Project URL**: `https://cxzllzyxwpyptfretryc.supabase.co`
- **Anon Key**: `eyJhbG...` (configured)
- **Service Role Key**: `eyJhbG...` (configured)

## 🚀 Local Development

The application is ready to run with your Supabase database:

```bash
# Start development server
npm run dev

# Access at: http://localhost:3001
```

## 📊 Required Database Tables

Make sure your Supabase database has these tables:

1. **transactions**
   - id, date, volume, revenue, avg_basket, duration, units, location, category, brand

2. **product_mix**
   - id, category, value, skus, revenue, created_at

3. **consumer_behavior**
   - method, value, suggested, accepted, rate

4. **consumer_profiles**
   - age_group, gender, location, income_level, urban_rural

5. **product_substitutions**
   - original_product, substituted_product, reason, frequency

6. **suggestion_acceptance**
   - suggestion_type, acceptance_rate, response_time

7. **sku_analytics**
   - sku, product_name, category, performance_score

## 🔧 Testing Connection

To verify your Supabase connection:

1. Open the app in development mode
2. Check the browser console for any connection errors
3. The dashboard should display real-time data from your Supabase tables

## 🌐 Deployment Options

### Option 1: Vercel Dashboard
1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option 2: Netlify
1. Build locally: `npm run build`
2. Deploy the `.next` folder
3. Set environment variables in Netlify dashboard

### Option 3: Self-hosted
```bash
npm run build
npm run start
```

## 🛡️ Security Notes

- The anon key is safe for client-side use
- Never expose the service role key in client code
- Enable Row Level Security (RLS) on your Supabase tables

---

Your Scout Databank is now connected to your real Supabase database!