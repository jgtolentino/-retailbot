# 🏠 Local Development Setup Guide

This guide walks you through setting up a local Supabase instance for Scout Databank development.

## 🚀 Quick Start (1-Command Setup)

```bash
npm run local:setup
```

This will:
- ✅ Check Docker/Colima is running
- ✅ Install Supabase CLI if needed
- ✅ Start local Supabase instance
- ✅ Apply database migrations
- ✅ Seed with sample data
- ✅ Generate TypeScript types
- ✅ Create environment variables

## 🔧 Prerequisites

### 1. Docker/Colima
```bash
# Check if Docker is running
docker info

# If using Colima (recommended)
colima start
```

### 2. Supabase CLI
```bash
# Install with Homebrew
brew install supabase/tap/supabase

# Or with npm
npm install -g supabase
```

## 🎯 Local Development Workflow

### Step 1: Initial Setup
```bash
# First time setup
npm run local:setup
```

### Step 2: Check Status
```bash
# Check if everything is running
npm run local:check
```

### Step 3: Start Development
```bash
# Start Next.js with local Supabase
npm run dev
```

### Step 4: Open Studio Dashboard
```bash
# Open Supabase Studio in browser
npm run local:studio
```

## 📊 Local Services

After running `npm run local:setup`, these services will be available:

| Service | URL | Description |
|---------|-----|-------------|
| **API** | http://localhost:54321 | REST API endpoint |
| **Studio** | http://localhost:54323 | Database admin dashboard |
| **Database** | localhost:54322 | PostgreSQL database |
| **Storage** | http://localhost:54327 | File storage |
| **Auth** | http://localhost:54321/auth/v1 | Authentication |

## 🎛️ Available Commands

### Setup & Management
```bash
npm run local:setup    # Initial setup
npm run local:start    # Start services
npm run local:stop     # Stop services
npm run local:reset    # Reset database
npm run local:check    # Check status
```

### Development
```bash
npm run dev            # Start Next.js dev server
npm run local:studio   # Open Supabase Studio
npm run local:status   # Check service status
```

### Database
```bash
supabase db push       # Apply migrations
supabase db seed       # Run seed data
supabase db diff       # Generate migration
supabase db reset      # Reset & reseed
```

### Cloud Deployment
```bash
npm run cloud:deploy   # Deploy to cloud later
```

## 🗄️ Database Schema

The local instance includes these tables:

### Core Tables
- **`consumer_profiles`** - Customer information
- **`transactions`** - Purchase data
- **`consumer_behavior`** - User behavior tracking
- **`product_mix`** - Product catalog
- **`suggestion_acceptance`** - AI recommendations

### Analytics Views
- **`consumer_analytics`** - Aggregated customer insights
- **`product_performance`** - Product metrics

## 📁 File Structure

```
scout-databank-clone/
├── supabase/
│   ├── config.toml                          # Supabase configuration
│   ├── migrations/                          # Database migrations
│   │   └── 20250719_consumer_analytics_schema.sql
│   └── seed.sql                             # Sample data
├── scripts/
│   ├── setup-local-supabase.sh             # Setup script
│   ├── check-local-setup.sh                # Status check
│   └── deploy-to-cloud.sh                  # Cloud deployment
├── .env.local.example                       # Environment template
├── .env.local                               # Local environment vars
└── docker-compose.yml                       # Alternative Docker setup
```

## 🌐 Environment Variables

Your `.env.local` should contain:

```bash
# Local Supabase Instance
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DB_PASSWORD=postgres

# Development
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=local
```

## 🔄 Development Cycle

1. **Make Changes** - Edit your code
2. **Update Schema** - Modify migration files
3. **Apply Changes** - `supabase db push`
4. **Test Locally** - View in Studio dashboard
5. **Deploy to Cloud** - `npm run cloud:deploy`

## 🧪 Testing Your Setup

### 1. Check Services
```bash
npm run local:check
```

### 2. View Database
```bash
npm run local:studio
```

### 3. Test API
```bash
curl http://localhost:54321/rest/v1/consumer_profiles
```

### 4. Run Application
```bash
npm run dev
# Visit http://localhost:3000
```

## 🚨 Troubleshooting

### Docker Issues
```bash
# Check Docker status
docker info

# Start Colima if needed
colima start

# Restart Docker
colima restart
```

### Supabase Issues
```bash
# Check service status
supabase status

# Stop and restart
supabase stop
supabase start

# Reset everything
supabase db reset
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Kill processes if needed
kill -9 <PID>
```

### Environment Issues
```bash
# Check environment variables
cat .env.local

# Recreate from template
cp .env.local.example .env.local
```

## 📊 Studio Dashboard

Access the Supabase Studio at http://localhost:54323

Features:
- **Table Editor** - View and edit data
- **SQL Editor** - Run custom queries
- **Auth** - Manage users
- **Storage** - File management
- **API** - View API documentation

## 🌍 Deploying to Cloud

When ready to deploy:

1. **Set Cloud Variables**
```bash
export SUPABASE_ACCESS_TOKEN=your_token
export SUPABASE_PROJECT_REF=your_project_ref
```

2. **Deploy**
```bash
npm run cloud:deploy
```

3. **Update Environment**
```bash
# Update .env.local with cloud URLs
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

## 🎯 Benefits of Local Development

- **🚀 Fast Development** - No network latency
- **🔒 Data Privacy** - All data stays local
- **🧪 Safe Testing** - Reset anytime without affecting production
- **📱 Offline Development** - Work without internet
- **🔧 Easy Debugging** - Direct database access
- **💰 Cost Effective** - No cloud usage during development

## 📞 Support

If you encounter issues:

1. **Check Status** - `npm run local:check`
2. **View Logs** - `supabase status`
3. **Reset Database** - `npm run local:reset`
4. **Restart Services** - `supabase stop && supabase start`

## 🎉 Success!

You'll know everything is working when:
- ✅ `npm run local:check` shows all green
- ✅ Studio dashboard opens at http://localhost:54323
- ✅ Your Next.js app connects without errors
- ✅ Sample data appears in your dashboard

---

**🏠 Local development is now the recommended way to develop Scout Databank!**