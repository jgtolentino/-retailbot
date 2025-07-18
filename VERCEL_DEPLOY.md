# Deploy to Vercel Production

## Environment Variables to Add in Vercel Dashboard

Go to your Vercel project settings: https://vercel.com/scout-db/scout-databank-clone/settings/environment-variables

Add these environment variables for Production:

```
NEXT_PUBLIC_SUPABASE_URL=https://cxzllzyxwpyptfretryc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g
```

## Manual Steps:

1. Go to: https://vercel.com/scout-db/scout-databank-clone/settings/environment-variables
2. Add the two environment variables above
3. Click "Save"
4. Go to: https://vercel.com/scout-db/scout-databank-clone
5. Click "Redeploy" → "Redeploy with existing Build Cache"

## Alternative: Use Vercel CLI

```bash
# Set environment variables
echo "https://cxzllzyxwpyptfretryc.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYxODAsImV4cCI6MjA2Nzk1MjE4MH0.b794GEIWE4ZdMAm9xQYAJ0Gx-XEn1fhJBTIIeTro_1g" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Deploy
vercel --prod
```

## Your Production URLs:
- Main: https://scout-databank-clone.vercel.app
- Deployment: https://scout-databank-clone-4gi581czs-scout-db.vercel.app

## Note:
The production deployment will use your cloud Supabase instance (cxzllzyxwpyptfretryc) instead of the local one.