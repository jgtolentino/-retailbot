-- 🔧 SUPABASE SCHEMA FIX - Run this in Supabase SQL Editor
-- This creates the correct database schema for Scout Databank

-- 1️⃣ DROP EXISTING TABLES (if they exist)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS product_mix CASCADE;
DROP TABLE IF EXISTS consumer_behavior CASCADE;
DROP TABLE IF EXISTS consumer_profiles CASCADE;
DROP TABLE IF EXISTS product_substitutions CASCADE;
DROP TABLE IF EXISTS suggestion_acceptance CASCADE;
DROP TABLE IF EXISTS sku_analytics CASCADE;

-- 2️⃣ CREATE ALL TABLES WITH CORRECT SCHEMA

-- Transactions table
CREATE TABLE transactions (
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
CREATE TABLE product_mix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  category VARCHAR(255),
  value DECIMAL(10,2),
  skus INTEGER,
  revenue DECIMAL(10,2)
);

-- Consumer Behavior table
CREATE TABLE consumer_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  method VARCHAR(255),
  value DECIMAL(10,2),
  suggested INTEGER,
  accepted INTEGER,
  rate DECIMAL(5,2)
);

-- Consumer Profiles table
CREATE TABLE consumer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  age_group VARCHAR(50),
  gender VARCHAR(20),
  location VARCHAR(255),
  income_level VARCHAR(50),
  urban_rural VARCHAR(20)
);

-- Product Substitutions table
CREATE TABLE product_substitutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  original_product VARCHAR(255),
  suggested_product VARCHAR(255),
  acceptance_rate DECIMAL(5,2),
  revenue_impact DECIMAL(10,2)
);

-- Suggestion Acceptance table
CREATE TABLE suggestion_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  suggestion_type VARCHAR(100),
  accepted BOOLEAN,
  user_segment VARCHAR(100),
  product_category VARCHAR(100)
);

-- SKU Analytics table
CREATE TABLE sku_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  sku VARCHAR(100),
  product_name VARCHAR(255),
  category VARCHAR(100),
  units_sold INTEGER,
  revenue DECIMAL(10,2),
  stock_level INTEGER
);

-- 3️⃣ ENABLE ROW LEVEL SECURITY
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_analytics ENABLE ROW LEVEL SECURITY;

-- 4️⃣ CREATE RLS POLICIES (Allow public read access)
CREATE POLICY "Allow anon read access" ON transactions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON product_mix FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON consumer_behavior FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON consumer_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON product_substitutions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON suggestion_acceptance FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON sku_analytics FOR SELECT TO anon USING (true);

-- 5️⃣ ENABLE REALTIME (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE product_mix;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_behavior;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE product_substitutions;
ALTER PUBLICATION supabase_realtime ADD TABLE suggestion_acceptance;
ALTER PUBLICATION supabase_realtime ADD TABLE sku_analytics;

-- 6️⃣ INSERT REALISTIC SAMPLE DATA

-- Insert 50 realistic transactions
INSERT INTO transactions (volume, revenue, avg_basket, duration, units, location, category, brand)
SELECT 
  (random() * 5000 + 1000)::DECIMAL(10,2),
  (random() * 25000 + 5000)::DECIMAL(10,2),
  (random() * 150 + 50)::DECIMAL(10,2),
  (random() * 60 + 15)::INTEGER,
  (random() * 200 + 25)::INTEGER,
  CASE (random() * 3)::INTEGER
    WHEN 0 THEN 'Manila'
    WHEN 1 THEN 'Cebu'
    WHEN 2 THEN 'Davao'
    ELSE 'Quezon City'
  END,
  CASE (random() * 4)::INTEGER
    WHEN 0 THEN 'Beverages'
    WHEN 1 THEN 'Snacks'
    WHEN 2 THEN 'Personal Care'
    WHEN 3 THEN 'Tobacco'
    ELSE 'Household'
  END,
  CASE (random() * 4)::INTEGER
    WHEN 0 THEN 'TBWA Brand A'
    WHEN 1 THEN 'TBWA Brand B'
    WHEN 2 THEN 'Competitor X'
    ELSE 'Local Brand'
  END
FROM generate_series(1, 50);

-- Insert product mix data
INSERT INTO product_mix (category, value, skus, revenue)
VALUES 
  ('Beverages', 32.5, 45, 125000.00),
  ('Snacks', 28.3, 67, 98000.00),
  ('Personal Care', 18.7, 34, 78000.00),
  ('Tobacco', 12.8, 23, 156000.00),
  ('Household', 7.7, 28, 45000.00);

-- Insert consumer behavior data
INSERT INTO consumer_behavior (method, value, suggested, accepted, rate)
VALUES 
  ('In-store', 68.5, 150, 98, 65.3),
  ('Online', 23.2, 87, 54, 62.1),
  ('Mobile App', 15.8, 45, 32, 71.1),
  ('Social Commerce', 8.3, 23, 18, 78.3);

-- Insert consumer profiles (100 realistic profiles)
INSERT INTO consumer_profiles (age_group, gender, location, income_level, urban_rural)
SELECT 
  CASE (random() * 4)::INTEGER
    WHEN 0 THEN '18-24'
    WHEN 1 THEN '25-34'
    WHEN 2 THEN '35-44'
    WHEN 3 THEN '45-54'
    ELSE '55+'
  END,
  CASE (random() * 1)::INTEGER
    WHEN 0 THEN 'Male'
    ELSE 'Female'
  END,
  CASE (random() * 3)::INTEGER
    WHEN 0 THEN 'Manila'
    WHEN 1 THEN 'Cebu'
    WHEN 2 THEN 'Davao'
    ELSE 'Quezon City'
  END,
  CASE (random() * 3)::INTEGER
    WHEN 0 THEN 'Under ₱30k'
    WHEN 1 THEN '₱30k-₱60k'
    WHEN 2 THEN '₱60k-₱100k'
    ELSE 'Over ₱100k'
  END,
  CASE (random() * 1)::INTEGER
    WHEN 0 THEN 'Urban'
    ELSE 'Rural'
  END
FROM generate_series(1, 100);

-- Insert product substitutions
INSERT INTO product_substitutions (original_product, suggested_product, acceptance_rate, revenue_impact)
VALUES 
  ('Marlboro Red', 'TBWA Tobacco Brand', 72.5, 15000.00),
  ('Coca-Cola', 'TBWA Beverage Brand', 68.8, 12000.00),
  ('Pringles', 'TBWA Snack Brand', 81.2, 8500.00),
  ('Pantene', 'TBWA Personal Care', 59.3, 6800.00);

-- Insert suggestion acceptance data
INSERT INTO suggestion_acceptance (suggestion_type, accepted, user_segment, product_category)
VALUES 
  ('Recommendation', true, 'Premium', 'Beverages'),
  ('Cross-sell', true, 'Standard', 'Snacks'),
  ('Upsell', false, 'Budget', 'Personal Care'),
  ('Recommendation', true, 'Premium', 'Tobacco'),
  ('Cross-sell', true, 'Standard', 'Household');

-- Insert SKU analytics
INSERT INTO sku_analytics (sku, product_name, category, units_sold, revenue, stock_level)
VALUES 
  ('TBW001', 'TBWA Premium Beverage', 'Beverages', 245, 36750.00, 67),
  ('TBW002', 'TBWA Snack Mix', 'Snacks', 189, 18900.00, 34),
  ('TBW003', 'TBWA Personal Care Kit', 'Personal Care', 123, 24600.00, 18),
  ('TBW004', 'TBWA Tobacco Premium', 'Tobacco', 98, 49000.00, 45),
  ('TBW005', 'TBWA Household Essentials', 'Household', 67, 6700.00, 28);

-- 7️⃣ VERIFICATION QUERIES
SELECT 'Database setup completed successfully!' as status;
SELECT 'Total transactions: ' || count(*) as transactions_count FROM transactions;
SELECT 'Total product categories: ' || count(*) as product_categories FROM product_mix;
SELECT 'Total consumer profiles: ' || count(*) as consumer_profiles FROM consumer_profiles;