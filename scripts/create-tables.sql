-- Scout Databank Clone - Create Missing Tables
-- Run this script in your Supabase SQL editor

-- Create product_mix table
CREATE TABLE IF NOT EXISTS product_mix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  value DECIMAL(5,2) NOT NULL,
  skus INTEGER NOT NULL,
  revenue DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consumer_behavior table
CREATE TABLE IF NOT EXISTS consumer_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  method TEXT NOT NULL,
  value INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suggestion_acceptance table
CREATE TABLE IF NOT EXISTS suggestion_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  suggested INTEGER NOT NULL,
  accepted INTEGER NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consumer_profiles table
CREATE TABLE IF NOT EXISTS consumer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  age_group TEXT NOT NULL,
  gender TEXT NOT NULL,
  location TEXT NOT NULL,
  income_level TEXT NOT NULL,
  urban_rural TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for product_mix
INSERT INTO product_mix (category, value, skus, revenue) VALUES
  ('Beverages', 35, 145, 456789),
  ('Snacks', 25, 89, 324567),
  ('Personal Care', 20, 67, 259876),
  ('Household', 15, 45, 194532),
  ('Others', 5, 23, 64876);

-- Insert sample data for consumer_behavior
INSERT INTO consumer_behavior (method, value, percentage) VALUES
  ('Branded Request', 650, 65),
  ('Generic Request', 250, 25),
  ('Store Suggestion', 100, 10);

-- Insert sample data for suggestion_acceptance
INSERT INTO suggestion_acceptance (category, suggested, accepted, rate) VALUES
  ('Beverages', 234, 189, 80.8),
  ('Snacks', 156, 98, 62.8),
  ('Personal Care', 178, 134, 75.3),
  ('Household', 145, 87, 60.0);

-- Insert sample data for consumer_profiles
INSERT INTO consumer_profiles (age_group, gender, location, income_level, urban_rural) 
SELECT 
  CASE (row_number() OVER ()) % 5
    WHEN 1 THEN '18-24'
    WHEN 2 THEN '25-34'
    WHEN 3 THEN '35-44'
    WHEN 4 THEN '45-54'
    ELSE '55+'
  END as age_group,
  CASE (row_number() OVER ()) % 2
    WHEN 0 THEN 'Male'
    ELSE 'Female'
  END as gender,
  CASE (row_number() OVER ()) % 3
    WHEN 0 THEN 'Metro Manila'
    WHEN 1 THEN 'Cebu'
    ELSE 'Davao'
  END as location,
  CASE (row_number() OVER ()) % 3
    WHEN 0 THEN 'Low'
    WHEN 1 THEN 'Middle'
    ELSE 'High'
  END as income_level,
  CASE (row_number() OVER ()) % 10
    WHEN 0 THEN 'Rural'
    ELSE 'Urban'
  END as urban_rural
FROM generate_series(1, 50);

-- Grant permissions for anonymous access
GRANT SELECT ON product_mix TO anon;
GRANT SELECT ON consumer_behavior TO anon;
GRANT SELECT ON suggestion_acceptance TO anon;
GRANT SELECT ON consumer_profiles TO anon;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read access" ON product_mix FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON consumer_behavior FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON suggestion_acceptance FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON consumer_profiles FOR SELECT TO anon USING (true);