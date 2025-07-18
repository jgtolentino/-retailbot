-- TBWA Client Configuration and Expected SKU/JIT Splits
-- This script sets up realistic TBWA client expectations based on retail analytics standards

-- Create TBWA client-specific tables
CREATE TABLE IF NOT EXISTS tbwa_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  market_segment VARCHAR(100) NOT NULL,
  expected_skus INTEGER NOT NULL,
  jit_percentage DECIMAL(5,2) NOT NULL,
  region VARCHAR(100) NOT NULL,
  tier VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create SKU expectations table
CREATE TABLE IF NOT EXISTS tbwa_sku_expectations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES tbwa_clients(id),
  category VARCHAR(100) NOT NULL,
  expected_skus INTEGER NOT NULL,
  active_skus INTEGER NOT NULL,
  new_skus INTEGER NOT NULL,
  discontinued_skus INTEGER NOT NULL,
  sku_velocity DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create JIT distribution patterns
CREATE TABLE IF NOT EXISTS tbwa_jit_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES tbwa_clients(id),
  delivery_method VARCHAR(100) NOT NULL,
  percentage_split DECIMAL(5,2) NOT NULL,
  avg_delivery_time_hours INTEGER NOT NULL,
  cost_per_unit DECIMAL(8,2) NOT NULL,
  region VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed TBWA clients (realistic examples)
INSERT INTO tbwa_clients (client_name, industry, market_segment, expected_skus, jit_percentage, region, tier)
VALUES
  -- Major FMCG Clients
  ('Nestle Philippines', 'FMCG', 'Food & Beverages', 2500, 75.5, 'Metro Manila', 'Premium'),
  ('Unilever Philippines', 'FMCG', 'Personal Care', 1800, 78.2, 'Metro Manila', 'Premium'),
  ('P&G Philippines', 'FMCG', 'Household', 1200, 82.1, 'Metro Manila', 'Premium'),
  ('San Miguel Corporation', 'FMCG', 'Beverages', 950, 70.3, 'Metro Manila', 'Premium'),
  ('Universal Robina Corporation', 'FMCG', 'Snacks', 1600, 68.7, 'Metro Manila', 'Premium'),
  
  -- Regional Clients
  ('Gaisano Group', 'Retail', 'Supermarket Chain', 3500, 45.8, 'Visayas', 'Standard'),
  ('NCCC Group', 'Retail', 'Department Store', 2800, 52.3, 'Mindanao', 'Standard'),
  ('Puregold Price Club', 'Retail', 'Grocery Chain', 4200, 58.9, 'Nationwide', 'Standard'),
  
  -- Convenience/Quick Service
  ('7-Eleven Philippines', 'Retail', 'Convenience Store', 1500, 85.4, 'Metro Manila', 'Standard'),
  ('Jollibee Foods Corporation', 'Food Service', 'Quick Service Restaurant', 850, 90.2, 'Nationwide', 'Premium'),
  
  -- Pharmaceutical/Healthcare
  ('Mercury Drug Corporation', 'Healthcare', 'Pharmacy Chain', 2200, 88.7, 'Nationwide', 'Premium'),
  ('Watsons Philippines', 'Healthcare', 'Health & Beauty', 1900, 79.3, 'Metro Manila', 'Standard'),
  
  -- Automotive/Industrial
  ('Toyota Motor Philippines', 'Automotive', 'Vehicle Parts', 3800, 65.2, 'Metro Manila', 'Premium'),
  ('Petron Corporation', 'Energy', 'Fuel & Lubricants', 650, 72.8, 'Nationwide', 'Premium');

-- Seed SKU expectations by client and category
INSERT INTO tbwa_sku_expectations (client_id, category, expected_skus, active_skus, new_skus, discontinued_skus, sku_velocity)
SELECT 
  tc.id,
  category,
  expected_skus,
  active_skus,
  new_skus,
  discontinued_skus,
  sku_velocity
FROM tbwa_clients tc
CROSS JOIN (
  VALUES
  -- Nestle SKU breakdown
  ('Beverages', 800, 742, 28, 12, 2.8),
  ('Snacks', 650, 598, 35, 8, 3.2),
  ('Personal Care', 450, 412, 18, 6, 2.1),
  ('Household', 300, 278, 15, 4, 1.9),
  ('Others', 300, 285, 8, 3, 1.5)
) AS sku_data(category, expected_skus, active_skus, new_skus, discontinued_skus, sku_velocity)
WHERE tc.client_name = 'Nestle Philippines'

UNION ALL

SELECT 
  tc.id,
  category,
  expected_skus,
  active_skus,
  new_skus,
  discontinued_skus,
  sku_velocity
FROM tbwa_clients tc
CROSS JOIN (
  VALUES
  -- Unilever SKU breakdown
  ('Personal Care', 950, 875, 45, 15, 3.5),
  ('Household', 520, 482, 25, 8, 2.8),
  ('Beverages', 180, 168, 8, 2, 2.2),
  ('Others', 150, 142, 5, 3, 1.8)
) AS sku_data(category, expected_skus, active_skus, new_skus, discontinued_skus, sku_velocity)
WHERE tc.client_name = 'Unilever Philippines'

UNION ALL

SELECT 
  tc.id,
  category,
  expected_skus,
  active_skus,
  new_skus,
  discontinued_skus,
  sku_velocity
FROM tbwa_clients tc
CROSS JOIN (
  VALUES
  -- 7-Eleven SKU breakdown (convenience store mix)
  ('Beverages', 450, 425, 18, 5, 4.2),
  ('Snacks', 380, 362, 22, 6, 3.8),
  ('Personal Care', 280, 265, 12, 4, 2.5),
  ('Household', 220, 208, 8, 3, 2.1),
  ('Others', 170, 158, 6, 2, 1.9)
) AS sku_data(category, expected_skus, active_skus, new_skus, discontinued_skus, sku_velocity)
WHERE tc.client_name = '7-Eleven Philippines';

-- Seed JIT distribution patterns
INSERT INTO tbwa_jit_patterns (client_id, delivery_method, percentage_split, avg_delivery_time_hours, cost_per_unit, region)
SELECT 
  tc.id,
  delivery_method,
  percentage_split,
  avg_delivery_time_hours,
  cost_per_unit,
  region
FROM tbwa_clients tc
CROSS JOIN (
  VALUES
  -- Premium clients (Nestle, Unilever, P&G) - High JIT efficiency
  ('Direct Store Delivery', 45.5, 4, 2.50, 'Metro Manila'),
  ('Cross Dock', 28.3, 8, 1.80, 'Metro Manila'),
  ('Warehouse Distribution', 18.7, 24, 1.20, 'Metro Manila'),
  ('Emergency Delivery', 7.5, 2, 4.50, 'Metro Manila')
) AS jit_data(delivery_method, percentage_split, avg_delivery_time_hours, cost_per_unit, region)
WHERE tc.tier = 'Premium' AND tc.region = 'Metro Manila'

UNION ALL

SELECT 
  tc.id,
  delivery_method,
  percentage_split,
  avg_delivery_time_hours,
  cost_per_unit,
  region
FROM tbwa_clients tc
CROSS JOIN (
  VALUES
  -- Standard clients - Moderate JIT efficiency
  ('Direct Store Delivery', 35.2, 6, 2.80, 'Visayas'),
  ('Cross Dock', 32.8, 12, 2.10, 'Visayas'),
  ('Warehouse Distribution', 25.5, 36, 1.45, 'Visayas'),
  ('Emergency Delivery', 6.5, 3, 5.20, 'Visayas')
) AS jit_data(delivery_method, percentage_split, avg_delivery_time_hours, cost_per_unit, region)
WHERE tc.tier = 'Standard' AND tc.region = 'Visayas'

UNION ALL

SELECT 
  tc.id,
  delivery_method,
  percentage_split,
  avg_delivery_time_hours,
  cost_per_unit,
  region
FROM tbwa_clients tc
CROSS JOIN (
  VALUES
  -- Nationwide clients - Mixed efficiency
  ('Direct Store Delivery', 38.7, 5, 2.65, 'Nationwide'),
  ('Cross Dock', 30.5, 10, 1.95, 'Nationwide'),
  ('Warehouse Distribution', 24.2, 30, 1.35, 'Nationwide'),
  ('Emergency Delivery', 6.6, 2.5, 4.85, 'Nationwide')
) AS jit_data(delivery_method, percentage_split, avg_delivery_time_hours, cost_per_unit, region)
WHERE tc.region = 'Nationwide';

-- Create summary views
CREATE OR REPLACE VIEW tbwa_client_summary AS
SELECT 
  tc.client_name,
  tc.industry,
  tc.market_segment,
  tc.expected_skus,
  tc.jit_percentage,
  tc.region,
  tc.tier,
  SUM(tse.active_skus) as total_active_skus,
  SUM(tse.new_skus) as total_new_skus,
  AVG(tse.sku_velocity) as avg_sku_velocity,
  COUNT(DISTINCT tjp.delivery_method) as delivery_methods
FROM tbwa_clients tc
LEFT JOIN tbwa_sku_expectations tse ON tc.id = tse.client_id
LEFT JOIN tbwa_jit_patterns tjp ON tc.id = tjp.client_id
GROUP BY tc.id, tc.client_name, tc.industry, tc.market_segment, tc.expected_skus, tc.jit_percentage, tc.region, tc.tier;

CREATE OR REPLACE VIEW tbwa_jit_efficiency AS
SELECT 
  tc.client_name,
  tc.tier,
  tc.region,
  tc.jit_percentage,
  tjp.delivery_method,
  tjp.percentage_split,
  tjp.avg_delivery_time_hours,
  tjp.cost_per_unit,
  -- Calculate efficiency score
  ROUND(
    (tjp.percentage_split / tjp.avg_delivery_time_hours) * 
    (100 / tjp.cost_per_unit), 2
  ) as efficiency_score
FROM tbwa_clients tc
JOIN tbwa_jit_patterns tjp ON tc.id = tjp.client_id
ORDER BY efficiency_score DESC;

-- Grant permissions
GRANT SELECT ON tbwa_clients TO anon;
GRANT SELECT ON tbwa_sku_expectations TO anon;
GRANT SELECT ON tbwa_jit_patterns TO anon;
GRANT SELECT ON tbwa_client_summary TO anon;
GRANT SELECT ON tbwa_jit_efficiency TO anon;

-- Summary report
SELECT 'TBWA Client Configuration Summary' as report_title;

SELECT 
  'Total TBWA Clients' as metric,
  COUNT(*) as value
FROM tbwa_clients
UNION ALL
SELECT 
  'Total Expected SKUs' as metric,
  SUM(expected_skus) as value
FROM tbwa_clients
UNION ALL
SELECT 
  'Average JIT Percentage' as metric,
  ROUND(AVG(jit_percentage), 1) as value
FROM tbwa_clients
UNION ALL
SELECT 
  'Premium Tier Clients' as metric,
  COUNT(*) as value
FROM tbwa_clients
WHERE tier = 'Premium'
UNION ALL
SELECT 
  'Standard Tier Clients' as metric,
  COUNT(*) as value
FROM tbwa_clients
WHERE tier = 'Standard';

-- Top clients by SKU count
SELECT 
  'Top 5 Clients by SKU Count' as section,
  client_name,
  expected_skus,
  jit_percentage
FROM tbwa_clients
ORDER BY expected_skus DESC
LIMIT 5;