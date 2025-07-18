-- 🚀 SCOUT DATABANK CLONE - COMPLETE SUPABASE FIX
-- Execute this in your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql/new

-- Step 1: Drop existing tables to start fresh
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS product_mix CASCADE;
DROP TABLE IF EXISTS consumer_behavior CASCADE;
DROP TABLE IF EXISTS consumer_profiles CASCADE;
DROP TABLE IF EXISTS suggestion_acceptance CASCADE;
DROP TABLE IF EXISTS product_substitutions CASCADE;
DROP TABLE IF EXISTS sku_analytics CASCADE;

-- Step 2: Create transactions table with correct date column
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,  -- Important: 'date' column for date filtering
  created_at TIMESTAMPTZ DEFAULT now(),
  volume INTEGER,
  revenue DECIMAL(10,2),
  avg_basket DECIMAL(10,2),
  duration DECIMAL(3,1),
  units INTEGER,
  location VARCHAR(255) DEFAULT 'all',
  category VARCHAR(255) DEFAULT 'all',
  brand VARCHAR(255) DEFAULT 'all'
);

-- Step 3: Create other required tables
CREATE TABLE product_mix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name VARCHAR(255),  -- Added 'name' column for display
  category VARCHAR(255),
  value INTEGER,
  growth DECIMAL(5,2) DEFAULT 0,  -- Added growth column
  color VARCHAR(7) DEFAULT '#3B82F6',  -- Added color for charts
  skus INTEGER,
  revenue DECIMAL(10,2)
);

CREATE TABLE consumer_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  method VARCHAR(255),
  value INTEGER,
  percentage DECIMAL(5,2),
  suggested INTEGER,
  accepted INTEGER,
  rate DECIMAL(5,2)
);

CREATE TABLE suggestion_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  category VARCHAR(255),
  suggested INTEGER,
  accepted INTEGER,
  rate DECIMAL(5,2)
);

CREATE TABLE consumer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  age_group VARCHAR(50),
  gender VARCHAR(20),
  location VARCHAR(255),
  income_level VARCHAR(50),
  urban_rural VARCHAR(20)
);

-- Step 4: Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for anonymous access
CREATE POLICY "Allow anonymous read" ON transactions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON product_mix FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON consumer_behavior FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON suggestion_acceptance FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON consumer_profiles FOR SELECT TO anon USING (true);

-- Step 6: Insert sample transaction data (last 30 days)
INSERT INTO transactions (date, volume, revenue, avg_basket, duration, units, location, category, brand)
SELECT 
  CURRENT_DATE - (n || ' days')::INTERVAL as date,
  400 + (random() * 200)::INTEGER as volume,
  80000 + (random() * 30000) as revenue,
  150 + (random() * 50) as avg_basket,
  2.5 + (random() * 1.5) as duration,
  10 + (random() * 5)::INTEGER as units,
  CASE (random() * 3)::INTEGER
    WHEN 0 THEN 'Metro Manila'
    WHEN 1 THEN 'Luzon'
    WHEN 2 THEN 'Visayas'
    ELSE 'all'
  END as location,
  CASE (random() * 4)::INTEGER
    WHEN 0 THEN 'Beverages'
    WHEN 1 THEN 'Snacks'
    WHEN 2 THEN 'Personal Care'
    WHEN 3 THEN 'Household'
    ELSE 'all'
  END as category,
  CASE (random() * 3)::INTEGER
    WHEN 0 THEN 'Brand A'
    WHEN 1 THEN 'Brand B'
    WHEN 2 THEN 'Brand C'
    ELSE 'all'
  END as brand
FROM generate_series(0, 90) n;

-- Step 7: Insert product mix data
INSERT INTO product_mix (name, category, value, growth, color, skus, revenue)
VALUES 
  ('Beverages', 'Beverages', 3200, 12.5, '#3B82F6', 145, 456789),
  ('Snacks', 'Snacks', 2800, 8.3, '#10B981', 89, 324567),
  ('Dairy', 'Dairy', 2100, -2.1, '#F59E0B', 67, 259876),
  ('Bakery', 'Bakery', 1900, 15.7, '#8B5CF6', 45, 194532),
  ('Frozen', 'Frozen', 1500, 5.4, '#EC4899', 34, 154321),
  ('Others', 'Others', 1200, 3.2, '#6B7280', 23, 64876);

-- Step 8: Insert consumer behavior data
INSERT INTO consumer_behavior (method, value, percentage)
VALUES 
  ('Branded Request', 650, 65),
  ('Generic Request', 250, 25),
  ('Store Suggestion', 100, 10);

-- Step 9: Insert suggestion acceptance data
INSERT INTO suggestion_acceptance (category, suggested, accepted, rate)
VALUES 
  ('Beverages', 234, 189, 80.8),
  ('Snacks', 156, 98, 62.8),
  ('Personal Care', 178, 134, 75.3),
  ('Household', 145, 87, 60.0);

-- Step 10: Insert consumer profiles
INSERT INTO consumer_profiles (age_group, gender, location, income_level, urban_rural)
SELECT 
  CASE (n % 5)
    WHEN 0 THEN '18-24'
    WHEN 1 THEN '25-34'
    WHEN 2 THEN '35-44'
    WHEN 3 THEN '45-54'
    ELSE '55+'
  END as age_group,
  CASE (n % 2)
    WHEN 0 THEN 'Male'
    ELSE 'Female'
  END as gender,
  CASE (n % 4)
    WHEN 0 THEN 'Metro Manila'
    WHEN 1 THEN 'Central Luzon'
    WHEN 2 THEN 'Calabarzon'
    ELSE 'Western Visayas'
  END as location,
  CASE (n % 3)
    WHEN 0 THEN 'Low'
    WHEN 1 THEN 'Middle'
    ELSE 'High'
  END as income_level,
  CASE (n % 10)
    WHEN 0 THEN 'Rural'
    ELSE 'Urban'
  END as urban_rural
FROM generate_series(1, 100) n;

-- Step 11: Enable realtime (optional - for WebSocket connections)
BEGIN;
  -- Check if publication exists
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END$$;

  -- Add tables to realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
  ALTER PUBLICATION supabase_realtime ADD TABLE product_mix;
  ALTER PUBLICATION supabase_realtime ADD TABLE consumer_behavior;
  ALTER PUBLICATION supabase_realtime ADD TABLE suggestion_acceptance;
  ALTER PUBLICATION supabase_realtime ADD TABLE consumer_profiles;
COMMIT;

-- Step 12: Verify the setup
SELECT 'Tables created successfully!' as status,
       (SELECT COUNT(*) FROM transactions) as transaction_count,
       (SELECT COUNT(*) FROM product_mix) as product_count,
       (SELECT COUNT(*) FROM consumer_profiles) as profile_count;