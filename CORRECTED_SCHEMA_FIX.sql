-- 🛠️ CORRECTED SUPABASE SCHEMA FIX - COLUMN ERROR RESOLVED
-- This fixes the "column does not exist" error by recreating tables with correct schema

-- 1️⃣ DROP EXISTING TABLES (if they exist with wrong schema)
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

-- 3️⃣ ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_analytics ENABLE ROW LEVEL SECURITY;

-- 4️⃣ CREATE RLS POLICIES FOR ANON READ ACCESS
CREATE POLICY "Allow anon read access" ON transactions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON product_mix FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON consumer_behavior FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON consumer_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON product_substitutions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON suggestion_acceptance FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON sku_analytics FOR SELECT TO anon USING (true);

-- 5️⃣ ENABLE REALTIME ON ALL TABLES
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

-- 6️⃣ INSERT SAMPLE DATA (with correct column names)
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
FROM generate_series(1, 10);

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
FROM generate_series(1, 10);

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
FROM generate_series(1, 10);

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
FROM generate_series(1, 10);

INSERT INTO product_substitutions (original_product, suggested_product, acceptance_rate, revenue_impact)
VALUES 
  ('Product A', 'Product B', 75.5, 12500.00),
  ('Product C', 'Product D', 82.3, 18750.00),
  ('Product E', 'Product F', 68.9, 9800.00);

INSERT INTO suggestion_acceptance (suggestion_type, accepted, user_segment, product_category)
VALUES 
  ('Recommendation', true, 'Premium', 'Electronics'),
  ('Cross-sell', false, 'Standard', 'Clothing'),
  ('Upsell', true, 'Premium', 'Electronics');

INSERT INTO sku_analytics (sku, product_name, category, units_sold, revenue, stock_level)
VALUES 
  ('SKU001', 'Wireless Headphones', 'Electronics', 150, 22500.00, 45),
  ('SKU002', 'Running Shoes', 'Sports', 89, 8900.00, 23),
  ('SKU003', 'Coffee Maker', 'Home & Garden', 67, 13400.00, 12);

-- 7️⃣ VERIFY SETUP
SELECT 'Schema fix completed successfully' as status;
