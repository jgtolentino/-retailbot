-- RECOVERY SQL - Run this in Supabase SQL Editor
-- This will recreate all deleted tables

-- First, drop any partial tables that might exist
DROP TABLE IF EXISTS suggestion_acceptance CASCADE;
DROP TABLE IF EXISTS consumer_behavior CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS product_mix CASCADE;
DROP TABLE IF EXISTS consumer_profiles CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Consumer Profiles Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Transactions Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Consumer Behavior Table
CREATE TABLE consumer_behavior (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
    behavior_type TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    value DECIMAL(10,2),
    frequency INTEGER DEFAULT 1,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    session_id TEXT,
    device_type TEXT,
    location TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Product Mix Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Suggestion Acceptance Table
CREATE TABLE suggestion_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
    suggestion_id TEXT NOT NULL,
    suggestion_type TEXT NOT NULL,
    suggested_item TEXT,
    acceptance_status TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    context JSONB DEFAULT '{}',
    suggested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    responded_at TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create all indexes
CREATE INDEX idx_transactions_consumer_id ON transactions(consumer_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_consumer_behavior_consumer_id ON consumer_behavior(consumer_id);
CREATE INDEX idx_consumer_behavior_type ON consumer_behavior(behavior_type);
CREATE INDEX idx_consumer_behavior_timestamp ON consumer_behavior(timestamp);
CREATE INDEX idx_product_mix_category ON product_mix(category);
CREATE INDEX idx_product_mix_value ON product_mix(value DESC);
CREATE INDEX idx_suggestion_acceptance_consumer_id ON suggestion_acceptance(consumer_id);
CREATE INDEX idx_suggestion_acceptance_status ON suggestion_acceptance(acceptance_status);

-- Enable Row Level Security
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (development only)
CREATE POLICY "Public access" ON consumer_profiles FOR ALL USING (true);
CREATE POLICY "Public access" ON transactions FOR ALL USING (true);
CREATE POLICY "Public access" ON consumer_behavior FOR ALL USING (true);
CREATE POLICY "Public access" ON product_mix FOR ALL USING (true);
CREATE POLICY "Public access" ON suggestion_acceptance FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_behavior;
ALTER PUBLICATION supabase_realtime ADD TABLE product_mix;
ALTER PUBLICATION supabase_realtime ADD TABLE suggestion_acceptance;