-- Scout Databank Comprehensive Seeding Script
-- This script creates a realistic dataset for all Scout analytics tables
-- with proper brand distribution, regional splits, and consumer behavior patterns

-- Clear existing data (optional - comment out if you want to keep existing data)
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE product_mix CASCADE;
TRUNCATE TABLE consumer_behavior CASCADE;
TRUNCATE TABLE suggestion_acceptance CASCADE;
TRUNCATE TABLE consumer_profiles CASCADE;

-- Define realistic brands for Philippines market
WITH brands AS (
  SELECT unnest(ARRAY[
    'Nestle', 'Unilever', 'P&G', 'Colgate-Palmolive', 'Johnson & Johnson',
    'Coca-Cola', 'Pepsi', 'Alaska', 'Magnolia', 'San Miguel',
    'Century Tuna', 'Argentina', 'CDO', 'Purefoods', 'Swift',
    'Kopiko', 'Nescafe', 'Bear Brand', 'Milo', 'Lucky Me',
    'Safeguard', 'Palmolive', 'Head & Shoulders', 'Rejoice', 'Sunsilk',
    'Tide', 'Ariel', 'Downy', 'Surf', 'Pride',
    'Chippy', 'Nova', 'Piattos', 'V-Cut', 'Boy Bawang',
    'Sky Flakes', 'Fita', 'Rebisco', 'M.Y. San', 'Nissin',
    'Generic Store Brand', 'Local Brand', 'Imported Brand'
  ]) AS brand_name
),
-- Define regions with realistic population distribution
regions AS (
  SELECT * FROM (VALUES
    ('Metro Manila', 0.35, 'Urban'),
    ('Central Luzon', 0.15, 'Mixed'),
    ('Calabarzon', 0.20, 'Mixed'),
    ('Central Visayas', 0.10, 'Mixed'),
    ('Western Visayas', 0.08, 'Mixed'),
    ('Davao Region', 0.07, 'Mixed'),
    ('Northern Mindanao', 0.05, 'Rural')
  ) AS t(location, weight, area_type)
),
-- Define product categories with typical store distribution
categories AS (
  SELECT * FROM (VALUES
    ('Beverages', 0.25, 150),
    ('Snacks', 0.20, 120),
    ('Personal Care', 0.18, 100),
    ('Household', 0.15, 80),
    ('Canned Goods', 0.10, 60),
    ('Condiments', 0.07, 40),
    ('Others', 0.05, 30)
  ) AS t(category, weight, avg_skus)
)

-- Seed transactions with realistic patterns
INSERT INTO transactions (date, volume, revenue, avg_basket, duration, units, location, category, brand)
SELECT 
  (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 89))::date AS date,
  -- Volume varies by location and day of week
  CASE 
    WHEN EXTRACT(DOW FROM (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 89))) IN (0, 6) 
    THEN FLOOR(RANDOM() * 200 + 500) -- Weekend higher
    ELSE FLOOR(RANDOM() * 150 + 350) -- Weekday lower
  END * 
  CASE location
    WHEN 'Metro Manila' THEN 1.5
    WHEN 'Calabarzon' THEN 1.2
    WHEN 'Central Luzon' THEN 1.0
    ELSE 0.8
  END AS volume,
  -- Revenue calculation with regional pricing differences
  FLOOR(RANDOM() * 50000 + 80000) * 
  CASE location
    WHEN 'Metro Manila' THEN 1.2
    WHEN 'Calabarzon' THEN 1.1
    ELSE 1.0
  END AS revenue,
  -- Average basket size
  FLOOR(RANDOM() * 100 + 200) + 
  CASE category
    WHEN 'Beverages' THEN 50
    WHEN 'Personal Care' THEN 80
    ELSE 0
  END AS avg_basket,
  -- Shopping duration in minutes
  ROUND((RANDOM() * 15 + 5)::numeric, 1) AS duration,
  -- Units per transaction
  FLOOR(RANDOM() * 10 + 5) AS units,
  location,
  category,
  brand_name AS brand
FROM 
  brands,
  regions,
  categories,
  generate_series(0, 89) AS day_offset
WHERE 
  -- Create realistic brand-category associations
  (category = 'Beverages' AND brand_name IN ('Coca-Cola', 'Pepsi', 'Alaska', 'Magnolia', 'Bear Brand', 'Milo', 'Nescafe', 'Generic Store Brand')) OR
  (category = 'Snacks' AND brand_name IN ('Chippy', 'Nova', 'Piattos', 'V-Cut', 'Boy Bawang', 'Sky Flakes', 'Fita', 'Rebisco', 'Generic Store Brand')) OR
  (category = 'Personal Care' AND brand_name IN ('Safeguard', 'Palmolive', 'Head & Shoulders', 'Rejoice', 'Sunsilk', 'Colgate-Palmolive', 'Johnson & Johnson', 'Generic Store Brand')) OR
  (category = 'Household' AND brand_name IN ('Tide', 'Ariel', 'Downy', 'Surf', 'Pride', 'Generic Store Brand')) OR
  (category = 'Canned Goods' AND brand_name IN ('Century Tuna', 'Argentina', 'CDO', 'Purefoods', 'Swift', 'Generic Store Brand')) OR
  (category = 'Condiments' AND brand_name IN ('Lucky Me', 'Nestle', 'Generic Store Brand', 'Local Brand')) OR
  (category = 'Others' AND brand_name IN ('Generic Store Brand', 'Local Brand', 'Imported Brand'))
ORDER BY RANDOM()
LIMIT 5000;

-- Seed product mix with realistic category distribution
INSERT INTO product_mix (category, value, skus, revenue)
SELECT 
  category,
  ROUND((weight * 100)::numeric, 1) AS value,
  avg_skus + FLOOR(RANDOM() * 20 - 10) AS skus,
  FLOOR(weight * 1000000 + RANDOM() * 200000) AS revenue
FROM categories;

-- Seed consumer behavior patterns
INSERT INTO consumer_behavior (method, value, percentage)
VALUES
  ('Branded Request', 4500, 60.0),  -- Most consumers ask for specific brands
  ('Generic Request', 2250, 30.0),  -- Some ask for product type only
  ('Store Suggestion', 750, 10.0);  -- Few rely on store recommendations

-- Seed suggestion acceptance rates by category
INSERT INTO suggestion_acceptance (category, suggested, accepted, rate)
SELECT 
  category,
  FLOOR(RANDOM() * 100 + 200) AS suggested,
  FLOOR((RANDOM() * 100 + 200) * (0.5 + RANDOM() * 0.4)) AS accepted,
  ROUND((50 + RANDOM() * 40)::numeric, 1) AS rate
FROM categories;

-- Seed diverse consumer profiles reflecting Philippines demographics
INSERT INTO consumer_profiles (age_group, gender, location, income_level, urban_rural)
SELECT 
  age_group,
  gender,
  location,
  income_level,
  area_type AS urban_rural
FROM 
  (SELECT unnest(ARRAY['18-24', '25-34', '35-44', '45-54', '55+']) AS age_group) AS ages,
  (SELECT unnest(ARRAY['Male', 'Female']) AS gender) AS genders,
  regions,
  (SELECT unnest(ARRAY['Low', 'Middle', 'High']) AS income_level) AS incomes
WHERE 
  -- Create realistic income distribution by location
  (location = 'Metro Manila' AND income_level IN ('Middle', 'High')) OR
  (location IN ('Calabarzon', 'Central Luzon') AND income_level IN ('Low', 'Middle', 'High')) OR
  (location NOT IN ('Metro Manila', 'Calabarzon', 'Central Luzon') AND income_level IN ('Low', 'Middle'))
ORDER BY RANDOM()
LIMIT 500;

-- Add some special entries for targeted segments
INSERT INTO consumer_profiles (age_group, gender, location, income_level, urban_rural)
VALUES
  -- Young professionals in urban areas
  ('25-34', 'Male', 'Metro Manila', 'High', 'Urban'),
  ('25-34', 'Female', 'Metro Manila', 'High', 'Urban'),
  ('25-34', 'Male', 'Calabarzon', 'Middle', 'Urban'),
  ('25-34', 'Female', 'Calabarzon', 'Middle', 'Urban'),
  -- Family shoppers
  ('35-44', 'Female', 'Metro Manila', 'Middle', 'Urban'),
  ('35-44', 'Male', 'Central Luzon', 'Middle', 'Mixed'),
  ('35-44', 'Female', 'Central Visayas', 'Middle', 'Mixed'),
  -- Senior citizens
  ('55+', 'Male', 'Metro Manila', 'Middle', 'Urban'),
  ('55+', 'Female', 'Metro Manila', 'Low', 'Urban'),
  ('55+', 'Male', 'Davao Region', 'Low', 'Mixed'),
  -- Students
  ('18-24', 'Male', 'Metro Manila', 'Low', 'Urban'),
  ('18-24', 'Female', 'Metro Manila', 'Low', 'Urban'),
  ('18-24', 'Male', 'Central Visayas', 'Low', 'Mixed');

-- Create additional analytics views for MCP integration
CREATE OR REPLACE VIEW regional_performance AS
SELECT 
  location,
  COUNT(DISTINCT date) as days_active,
  SUM(volume) as total_volume,
  SUM(revenue) as total_revenue,
  AVG(avg_basket) as avg_basket_size,
  COUNT(DISTINCT brand) as unique_brands,
  COUNT(DISTINCT category) as unique_categories
FROM transactions
GROUP BY location;

CREATE OR REPLACE VIEW brand_performance AS
SELECT 
  brand,
  category,
  COUNT(*) as transaction_count,
  SUM(volume) as total_volume,
  SUM(revenue) as total_revenue,
  AVG(units) as avg_units_per_transaction,
  COUNT(DISTINCT location) as market_reach
FROM transactions
GROUP BY brand, category
ORDER BY total_revenue DESC;

CREATE OR REPLACE VIEW consumer_segment_analysis AS
SELECT 
  age_group,
  gender,
  income_level,
  COUNT(*) as segment_size,
  COUNT(DISTINCT location) as geographic_spread,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM consumer_profiles) * 100, 2) as percentage_of_total
FROM consumer_profiles
GROUP BY age_group, gender, income_level
ORDER BY segment_size DESC;

-- Grant permissions for analytics views
GRANT SELECT ON regional_performance TO anon;
GRANT SELECT ON brand_performance TO anon;
GRANT SELECT ON consumer_segment_analysis TO anon;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_location ON transactions(location);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_brand ON transactions(brand);
CREATE INDEX IF NOT EXISTS idx_consumer_profiles_location ON consumer_profiles(location);
CREATE INDEX IF NOT EXISTS idx_consumer_profiles_age_group ON consumer_profiles(age_group);

-- Summary statistics
SELECT 'Seeding complete!' as status;
SELECT 'Transactions created:' as metric, COUNT(*) as value FROM transactions
UNION ALL
SELECT 'Product categories:' as metric, COUNT(*) as value FROM product_mix
UNION ALL
SELECT 'Consumer profiles:' as metric, COUNT(*) as value FROM consumer_profiles
UNION ALL
SELECT 'Unique brands:' as metric, COUNT(DISTINCT brand) as value FROM transactions
UNION ALL
SELECT 'Unique locations:' as metric, COUNT(DISTINCT location) as value FROM transactions;