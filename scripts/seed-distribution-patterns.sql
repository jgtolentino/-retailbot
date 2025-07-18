-- Scout Databank Distribution Patterns and Suggested Splits
-- This script adds advanced distribution patterns and analytics data

-- Create table for suggested product splits/substitutions if not exists
CREATE TABLE IF NOT EXISTS product_substitutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_product VARCHAR(255) NOT NULL,
  suggested_product VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  acceptance_rate DECIMAL(5,2) NOT NULL,
  revenue_impact DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for regional distribution patterns
CREATE TABLE IF NOT EXISTS regional_distribution (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  market_share DECIMAL(5,2) NOT NULL,
  growth_rate DECIMAL(5,2) NOT NULL,
  seasonality_factor DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for client segments
CREATE TABLE IF NOT EXISTS client_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  segment_type VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  store_count INTEGER NOT NULL,
  avg_daily_transactions INTEGER NOT NULL,
  tier VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed product substitutions with realistic patterns
INSERT INTO product_substitutions (original_product, suggested_product, category, acceptance_rate, revenue_impact)
VALUES
  -- Beverages substitutions
  ('Coca-Cola 1.5L', 'Pepsi 1.5L', 'Beverages', 45.5, -5.2),
  ('Coca-Cola 1.5L', 'RC Cola 1.5L', 'Beverages', 35.2, -12.5),
  ('Nescafe Gold 100g', 'Nescafe Classic 100g', 'Beverages', 68.3, -8.5),
  ('Bear Brand Adult Plus', 'Alaska Fortified', 'Beverages', 52.1, -3.2),
  ('Milo 1kg', 'Ovaltine 1kg', 'Beverages', 38.7, -6.8),
  
  -- Snacks substitutions
  ('Pringles Original', 'Piattos Cheese', 'Snacks', 72.5, -15.3),
  ('Lay''s Classic', 'Nova Country Cheddar', 'Snacks', 65.8, -18.2),
  ('Oreo Regular', 'Cream-O Vanilla', 'Snacks', 78.2, -22.5),
  ('Doritos Nacho', 'Chippy BBQ', 'Snacks', 70.3, -20.1),
  
  -- Personal Care substitutions
  ('Head & Shoulders', 'Clear Shampoo', 'Personal Care', 42.3, -10.5),
  ('Safeguard White', 'Bioderm Germicidal', 'Personal Care', 58.7, -25.3),
  ('Colgate Total', 'Hapee Toothpaste', 'Personal Care', 48.9, -30.2),
  ('Dove Body Wash', 'Skin White Body Wash', 'Personal Care', 55.4, -18.7),
  
  -- Household substitutions
  ('Tide Original', 'Surf Powder', 'Household', 62.3, -15.8),
  ('Joy Dishwashing', 'Smart Dishwashing', 'Household', 71.2, -22.3),
  ('Downy Passion', 'Surf Fabric Conditioner', 'Household', 59.8, -18.5);

-- Seed regional distribution patterns
INSERT INTO regional_distribution (region, category, brand, market_share, growth_rate, seasonality_factor)
SELECT 
  region,
  category,
  brand,
  market_share,
  growth_rate,
  seasonality_factor
FROM (
  VALUES
  -- Metro Manila patterns
  ('Metro Manila', 'Beverages', 'Coca-Cola', 28.5, 3.2, 1.0),
  ('Metro Manila', 'Beverages', 'Pepsi', 22.3, 2.8, 1.0),
  ('Metro Manila', 'Beverages', 'Alaska', 15.2, 5.5, 0.9),
  ('Metro Manila', 'Snacks', 'Jack n Jill', 18.7, 4.2, 1.1),
  ('Metro Manila', 'Personal Care', 'Unilever', 32.5, 3.8, 1.0),
  ('Metro Manila', 'Household', 'P&G', 28.9, 4.1, 0.95),
  
  -- Provincial patterns (different brand preferences)
  ('Central Luzon', 'Beverages', 'Coca-Cola', 25.2, 2.8, 1.05),
  ('Central Luzon', 'Beverages', 'Local Brands', 18.5, 8.2, 1.2),
  ('Central Luzon', 'Snacks', 'Local Brands', 22.3, 6.5, 1.15),
  ('Calabarzon', 'Beverages', 'San Miguel', 20.5, 4.5, 1.1),
  ('Calabarzon', 'Personal Care', 'Local Brands', 15.8, 7.2, 1.0),
  ('Central Visayas', 'Beverages', 'Coca-Cola', 23.8, 3.5, 1.0),
  ('Central Visayas', 'Snacks', 'JBC', 19.2, 5.8, 1.2),
  ('Davao Region', 'Beverages', 'Local Brands', 25.5, 9.2, 1.15),
  ('Davao Region', 'Household', 'Local Brands', 20.3, 8.5, 1.05)
) AS t(region, category, brand, market_share, growth_rate, seasonality_factor);

-- Seed client segments (sari-sari stores, convenience stores, supermarkets)
INSERT INTO client_segments (client_name, segment_type, region, store_count, avg_daily_transactions, tier)
VALUES
  -- Large chains
  ('SM Supermarket', 'Supermarket', 'Metro Manila', 45, 2500, 'Premium'),
  ('Robinsons Supermarket', 'Supermarket', 'Metro Manila', 38, 2200, 'Premium'),
  ('Puregold', 'Supermarket', 'Metro Manila', 52, 1800, 'Standard'),
  ('Metro Supermarket', 'Supermarket', 'Metro Manila', 25, 2000, 'Premium'),
  
  -- Convenience stores
  ('7-Eleven NCR', 'Convenience', 'Metro Manila', 850, 180, 'Standard'),
  ('FamilyMart', 'Convenience', 'Metro Manila', 120, 150, 'Standard'),
  ('Ministop', 'Convenience', 'Metro Manila', 380, 160, 'Standard'),
  ('7-Eleven Luzon', 'Convenience', 'Central Luzon', 450, 120, 'Standard'),
  
  -- Regional chains
  ('Gaisano Capital', 'Supermarket', 'Central Visayas', 28, 1500, 'Standard'),
  ('NCCC Mall', 'Supermarket', 'Davao Region', 15, 1800, 'Standard'),
  ('Prince Hypermart', 'Supermarket', 'Calabarzon', 22, 1200, 'Economy'),
  
  -- Sari-sari store networks
  ('Sari-Sari Network MM', 'Sari-sari', 'Metro Manila', 5000, 25, 'Economy'),
  ('Sari-Sari Network Luzon', 'Sari-sari', 'Central Luzon', 8000, 20, 'Economy'),
  ('Sari-Sari Network Calabarzon', 'Sari-sari', 'Calabarzon', 6500, 22, 'Economy'),
  ('Sari-Sari Network Visayas', 'Sari-sari', 'Central Visayas', 4000, 18, 'Economy'),
  ('Sari-Sari Network Mindanao', 'Sari-sari', 'Davao Region', 3500, 15, 'Economy');

-- Create analytical views for distribution insights
CREATE OR REPLACE VIEW substitution_performance AS
SELECT 
  ps.category,
  ps.original_product,
  ps.suggested_product,
  ps.acceptance_rate,
  ps.revenue_impact,
  COUNT(t.*) as suggestion_opportunities,
  SUM(t.revenue) * (ps.acceptance_rate/100) * (1 + ps.revenue_impact/100) as projected_revenue
FROM product_substitutions ps
LEFT JOIN transactions t ON t.category = ps.category
GROUP BY ps.category, ps.original_product, ps.suggested_product, ps.acceptance_rate, ps.revenue_impact
ORDER BY projected_revenue DESC;

CREATE OR REPLACE VIEW regional_market_dynamics AS
SELECT 
  rd.region,
  rd.category,
  rd.brand,
  rd.market_share,
  rd.growth_rate,
  rd.seasonality_factor,
  SUM(t.revenue) as actual_revenue,
  COUNT(DISTINCT t.date) as active_days
FROM regional_distribution rd
LEFT JOIN transactions t ON t.location = rd.region AND t.category = rd.category
GROUP BY rd.region, rd.category, rd.brand, rd.market_share, rd.growth_rate, rd.seasonality_factor
ORDER BY rd.region, rd.market_share DESC;

CREATE OR REPLACE VIEW client_performance_metrics AS
SELECT 
  cs.client_name,
  cs.segment_type,
  cs.region,
  cs.store_count,
  cs.avg_daily_transactions,
  cs.tier,
  cs.store_count * cs.avg_daily_transactions as total_daily_transactions,
  CASE 
    WHEN cs.segment_type = 'Supermarket' THEN cs.avg_daily_transactions * 250
    WHEN cs.segment_type = 'Convenience' THEN cs.avg_daily_transactions * 150
    ELSE cs.avg_daily_transactions * 50
  END as avg_transaction_value
FROM client_segments cs
ORDER BY total_daily_transactions DESC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_substitutions_category ON product_substitutions(category);
CREATE INDEX IF NOT EXISTS idx_regional_distribution_region ON regional_distribution(region);
CREATE INDEX IF NOT EXISTS idx_client_segments_type ON client_segments(segment_type);

-- Grant permissions
GRANT SELECT ON product_substitutions TO anon;
GRANT SELECT ON regional_distribution TO anon;
GRANT SELECT ON client_segments TO anon;
GRANT SELECT ON substitution_performance TO anon;
GRANT SELECT ON regional_market_dynamics TO anon;
GRANT SELECT ON client_performance_metrics TO anon;

-- Enable RLS
ALTER TABLE product_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_segments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous read access" ON product_substitutions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON regional_distribution FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON client_segments FOR SELECT TO anon USING (true);

-- Summary of distribution patterns
SELECT 'Distribution patterns seeded!' as status;
SELECT 'Product substitutions:' as metric, COUNT(*) as value FROM product_substitutions
UNION ALL
SELECT 'Regional distributions:' as metric, COUNT(*) as value FROM regional_distribution
UNION ALL
SELECT 'Client segments:' as metric, COUNT(*) as value FROM client_segments;