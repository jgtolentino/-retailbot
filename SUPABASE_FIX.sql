-- 🛠️ SUPABASE SCHEMA, RLS & REALTIME FIX
-- Run this in your Supabase SQL Editor to fix all 404 and WebSocket errors

-- 1️⃣ CREATE ALL REQUIRED TABLES (if they don't exist)

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  volume DECIMAL(10,2),
  revenue DECIMAL(10,2),
  avg_basket DECIMAL(10,2),
  duration INTEGER,
  units INTEGER,
  location VARCHAR(255),
  category VARCHAR(255),
  brand VARCHAR(255)
);

-- Product Mix table
CREATE TABLE IF NOT EXISTS product_mix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  category VARCHAR(255),
  value DECIMAL(10,2),
  skus INTEGER,
  revenue DECIMAL(10,2)
);

-- Consumer Behavior table
CREATE TABLE IF NOT EXISTS consumer_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  method VARCHAR(255),
  value DECIMAL(10,2),
  suggested INTEGER,
  accepted INTEGER,
  rate DECIMAL(5,2)
);

-- Consumer Profiles table
CREATE TABLE IF NOT EXISTS consumer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  age_group VARCHAR(50),
  gender VARCHAR(20),
  location VARCHAR(255),
  income_level VARCHAR(50),
  urban_rural VARCHAR(20)
);

-- Product Substitutions table
CREATE TABLE IF NOT EXISTS product_substitutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  original_product VARCHAR(255),
  suggested_product VARCHAR(255),
  acceptance_rate DECIMAL(5,2),
  revenue_impact DECIMAL(10,2)
);

-- Suggestion Acceptance table
CREATE TABLE IF NOT EXISTS suggestion_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  suggestion_type VARCHAR(100),
  accepted BOOLEAN,
  user_segment VARCHAR(100),
  product_category VARCHAR(100)
);

-- SKU Analytics table
CREATE TABLE IF NOT EXISTS sku_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  sku VARCHAR(100),
  product_name VARCHAR(255),
  category VARCHAR(100),
  units_sold INTEGER,
  revenue DECIMAL(10,2),
  stock_level INTEGER
);

-- 2️⃣ ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_analytics ENABLE ROW LEVEL SECURITY;

-- 3️⃣ CREATE RLS POLICIES FOR ANON READ ACCESS

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anon read access" ON transactions;
DROP POLICY IF EXISTS "Allow anon read access" ON product_mix;
DROP POLICY IF EXISTS "Allow anon read access" ON consumer_behavior;
DROP POLICY IF EXISTS "Allow anon read access" ON consumer_profiles;
DROP POLICY IF EXISTS "Allow anon read access" ON product_substitutions;
DROP POLICY IF EXISTS "Allow anon read access" ON suggestion_acceptance;
DROP POLICY IF EXISTS "Allow anon read access" ON sku_analytics;

-- Create new policies for anon role
CREATE POLICY "Allow anon read access" ON transactions
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read access" ON product_mix
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read access" ON consumer_behavior
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read access" ON consumer_profiles
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read access" ON product_substitutions
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read access" ON suggestion_acceptance
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read access" ON sku_analytics
  FOR SELECT TO anon USING (true);

-- 4️⃣ ENABLE REALTIME ON ALL TABLES

-- First, check if supabase_realtime publication exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- Add all tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE product_mix;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_behavior;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE product_substitutions;
ALTER PUBLICATION supabase_realtime ADD TABLE suggestion_acceptance;
ALTER PUBLICATION supabase_realtime ADD TABLE sku_analytics;

-- 5️⃣ INSERT SAMPLE DATA (if tables are empty)

-- Check and insert sample transactions
INSERT INTO transactions (volume, revenue, avg_basket, duration, units, location, category, brand)
SELECT 
  random() * 10000 + 1000,
  random() * 50000 + 5000,
  random() * 200 + 50,
  (random() * 120 + 30)::INTEGER,
  (random() * 500 + 50)::INTEGER,
  CASE (random() * 4)::INTEGER
    WHEN 0 THEN 'New York'
    WHEN 1 THEN 'Los Angeles'
    WHEN 2 THEN 'Chicago'
    ELSE 'Houston'
  END,
  CASE (random() * 5)::INTEGER
    WHEN 0 THEN 'Electronics'
    WHEN 1 THEN 'Clothing'
    WHEN 2 THEN 'Food & Beverage'
    WHEN 3 THEN 'Home & Garden'
    ELSE 'Sports & Outdoors'
  END,
  CASE (random() * 3)::INTEGER
    WHEN 0 THEN 'Brand A'
    WHEN 1 THEN 'Brand B'
    ELSE 'Brand C'
  END
FROM generate_series(1, 10)
WHERE NOT EXISTS (SELECT 1 FROM transactions LIMIT 1);

-- Insert sample product mix data
INSERT INTO product_mix (category, value, skus, revenue)
SELECT
  CASE (random() * 5)::INTEGER
    WHEN 0 THEN 'Electronics'
    WHEN 1 THEN 'Clothing'
    WHEN 2 THEN 'Food & Beverage'
    WHEN 3 THEN 'Home & Garden'
    ELSE 'Sports & Outdoors'
  END,
  random() * 100,
  (random() * 200 + 50)::INTEGER,
  random() * 100000 + 10000
FROM generate_series(1, 10)
WHERE NOT EXISTS (SELECT 1 FROM product_mix LIMIT 1);

-- Insert sample consumer behavior data
INSERT INTO consumer_behavior (method, value, suggested, accepted, rate)
SELECT
  CASE (random() * 4)::INTEGER
    WHEN 0 THEN 'In-store'
    WHEN 1 THEN 'Online'
    WHEN 2 THEN 'Mobile App'
    ELSE 'Social Commerce'
  END,
  random() * 100,
  (random() * 100 + 20)::INTEGER,
  (random() * 80 + 10)::INTEGER,
  random() * 100
FROM generate_series(1, 10)
WHERE NOT EXISTS (SELECT 1 FROM consumer_behavior LIMIT 1);

-- Insert sample consumer profiles
INSERT INTO consumer_profiles (age_group, gender, location, income_level, urban_rural)
SELECT
  CASE (random() * 5)::INTEGER
    WHEN 0 THEN '18-24'
    WHEN 1 THEN '25-34'
    WHEN 2 THEN '35-44'
    WHEN 3 THEN '45-54'
    ELSE '55+'
  END,
  CASE (random() * 2)::INTEGER
    WHEN 0 THEN 'Male'
    ELSE 'Female'
  END,
  CASE (random() * 4)::INTEGER
    WHEN 0 THEN 'New York'
    WHEN 1 THEN 'Los Angeles'
    WHEN 2 THEN 'Chicago'
    ELSE 'Houston'
  END,
  CASE (random() * 4)::INTEGER
    WHEN 0 THEN 'Under $30k'
    WHEN 1 THEN '$30k-$60k'
    WHEN 2 THEN '$60k-$100k'
    ELSE 'Over $100k'
  END,
  CASE (random() * 2)::INTEGER
    WHEN 0 THEN 'Urban'
    ELSE 'Rural'
  END
FROM generate_series(1, 10)
WHERE NOT EXISTS (SELECT 1 FROM consumer_profiles LIMIT 1);

-- 6️⃣ VERIFY SETUP

-- Check tables exist
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.tables t2 WHERE t2.table_name = t1.table_name) as row_count
FROM information_schema.tables t1 
WHERE table_schema = 'public' 
AND table_name IN ('transactions', 'product_mix', 'consumer_behavior', 'consumer_profiles', 
                   'product_substitutions', 'suggestion_acceptance', 'sku_analytics');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('transactions', 'product_mix', 'consumer_behavior', 'consumer_profiles',
                  'product_substitutions', 'suggestion_acceptance', 'sku_analytics');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('transactions', 'product_mix', 'consumer_behavior', 'consumer_profiles',
                  'product_substitutions', 'suggestion_acceptance', 'sku_analytics');

-- Check realtime is enabled
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 🎉 DONE! Your Supabase is now properly configured for the Scout Databank Dashboard!