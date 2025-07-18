-- CREATE ALL TABLES FROM SCRATCH
-- Run this entire SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Consumer Profiles Table
CREATE TABLE consumer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    name TEXT,
    age INTEGER,
    gender TEXT,
    location TEXT,
    income_bracket TEXT,
    lifestyle_segment TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    category TEXT,
    subcategory TEXT,
    merchant TEXT,
    description TEXT,
    date DATE NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'completed',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Consumer Behavior Table
CREATE TABLE consumer_behavior (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
    behavior_type TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    value DECIMAL(10,2),
    frequency INTEGER DEFAULT 1,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT,
    device_type TEXT,
    location TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Product Mix Table
CREATE TABLE product_mix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT,
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    margin DECIMAL(5,2),
    value DECIMAL(15,2),
    volume INTEGER DEFAULT 0,
    popularity_score DECIMAL(3,2),
    seasonality_factor DECIMAL(3,2),
    inventory_level INTEGER,
    supplier TEXT,
    launch_date DATE,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Suggestion Acceptance Table
CREATE TABLE suggestion_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
    suggestion_id TEXT NOT NULL,
    suggestion_type TEXT NOT NULL,
    suggested_item TEXT,
    acceptance_status TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    context JSONB DEFAULT '{}',
    suggested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;

-- Create simple public policies for development
CREATE POLICY "Enable all access for development" ON consumer_profiles FOR ALL USING (true);
CREATE POLICY "Enable all access for development" ON transactions FOR ALL USING (true);
CREATE POLICY "Enable all access for development" ON consumer_behavior FOR ALL USING (true);
CREATE POLICY "Enable all access for development" ON product_mix FOR ALL USING (true);
CREATE POLICY "Enable all access for development" ON suggestion_acceptance FOR ALL USING (true);