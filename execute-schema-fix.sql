-- SCOUT DATABANK SCHEMA FIX - EXECUTION READY
-- Execute via SQL Bridge: https://mcp-supabase-clean.onrender.com/query

-- 1️⃣ CREATE CORE TABLES
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

CREATE TABLE IF NOT EXISTS product_mix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  category VARCHAR(255),
  value DECIMAL(10,2),
  skus INTEGER,
  revenue DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS consumer_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  method VARCHAR(255),
  value DECIMAL(10,2),
  suggested INTEGER,
  accepted INTEGER,
  rate DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS consumer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  age_group VARCHAR(50),
  gender VARCHAR(20),
  location VARCHAR(255),
  income_level VARCHAR(50),
  urban_rural VARCHAR(20)
);

-- 2️⃣ ENABLE ROW LEVEL SECURITY
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;

-- 3️⃣ CREATE ANON READ POLICIES
CREATE POLICY "Allow anon read access" ON transactions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON product_mix FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON consumer_behavior FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON consumer_profiles FOR SELECT TO anon USING (true);

-- 4️⃣ INSERT SAMPLE DATA
INSERT INTO transactions (volume, revenue, avg_basket, duration, units, location, category, brand)
SELECT 
  random() * 10000 + 1000,
  random() * 50000 + 5000,
  random() * 200 + 50,
  (random() * 120 + 30)::INTEGER,
  (random() * 500 + 50)::INTEGER,
  'New York',
  'Electronics',
  'Brand A'
FROM generate_series(1, 5)
WHERE NOT EXISTS (SELECT 1 FROM transactions LIMIT 1);

INSERT INTO product_mix (category, value, skus, revenue)
SELECT 'Electronics', 75.5, 150, 50000
WHERE NOT EXISTS (SELECT 1 FROM product_mix LIMIT 1);

INSERT INTO consumer_behavior (method, value, suggested, accepted, rate)
SELECT 'Online', 65.2, 100, 75, 75.0
WHERE NOT EXISTS (SELECT 1 FROM consumer_behavior LIMIT 1);

INSERT INTO consumer_profiles (age_group, gender, location, income_level, urban_rural)
SELECT '25-34', 'Male', 'New York', '$60k-$100k', 'Urban'
WHERE NOT EXISTS (SELECT 1 FROM consumer_profiles LIMIT 1);

-- 5️⃣ VERIFY SETUP
SELECT 'Tables created' as status;
SELECT COUNT(*) as transaction_count FROM transactions;
SELECT COUNT(*) as product_mix_count FROM product_mix;
SELECT COUNT(*) as consumer_behavior_count FROM consumer_behavior;
SELECT COUNT(*) as consumer_profiles_count FROM consumer_profiles;
