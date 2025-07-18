#!/bin/bash

echo "🚀 EXECUTING SCHEMA FIX WITH ACCESS TOKEN"
echo "=========================================="

# Use the provided access token
export SUPABASE_SERVICE_ROLE_KEY="sbp_841cbb5589cbd90791cc3067d7161ec2c6d64c64"
export SUPABASE_PROJECT_REF="cxzllzyxwpyptfretryc"

# PostgreSQL connection string
CONNECTION_STRING="postgresql://postgres.${SUPABASE_PROJECT_REF}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

echo "🔑 Access Token: ${SUPABASE_SERVICE_ROLE_KEY:0:15}..."
echo "🎯 Project: $SUPABASE_PROJECT_REF"
echo "🔗 Connection: Ready"

# Execute the schema fix SQL
echo "🔧 Executing corrected schema fix..."

# Create SQL file inline
cat > /tmp/corrected_schema_fix.sql << 'EOF'
-- Drop existing tables with wrong schema
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS product_mix CASCADE;
DROP TABLE IF EXISTS consumer_behavior CASCADE;
DROP TABLE IF EXISTS consumer_profiles CASCADE;
DROP TABLE IF EXISTS product_substitutions CASCADE;
DROP TABLE IF EXISTS suggestion_acceptance CASCADE;
DROP TABLE IF EXISTS sku_analytics CASCADE;

-- Create transactions table with CORRECT schema including volume column
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

-- Create product_mix table
CREATE TABLE product_mix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  category VARCHAR(255),
  value DECIMAL(10,2),
  skus INTEGER,
  revenue DECIMAL(10,2)
);

-- Create consumer_behavior table
CREATE TABLE consumer_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  method VARCHAR(255),
  value DECIMAL(10,2),
  suggested INTEGER,
  accepted INTEGER,
  rate DECIMAL(5,2)
);

-- Create consumer_profiles table
CREATE TABLE consumer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  age_group VARCHAR(50),
  gender VARCHAR(20),
  location VARCHAR(255),
  income_level VARCHAR(50),
  urban_rural VARCHAR(20)
);

-- Create product_substitutions table
CREATE TABLE product_substitutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  original_product VARCHAR(255),
  suggested_product VARCHAR(255),
  acceptance_rate DECIMAL(5,2),
  revenue_impact DECIMAL(10,2)
);

-- Create suggestion_acceptance table
CREATE TABLE suggestion_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  suggestion_type VARCHAR(100),
  accepted BOOLEAN,
  user_segment VARCHAR(100),
  product_category VARCHAR(100)
);

-- Create sku_analytics table
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

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_analytics ENABLE ROW LEVEL SECURITY;

-- Create anon read policies
CREATE POLICY "Allow anon read access" ON transactions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON product_mix FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON consumer_behavior FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON consumer_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON product_substitutions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON suggestion_acceptance FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON sku_analytics FOR SELECT TO anon USING (true);

-- Enable realtime
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

-- Insert sample data with CORRECT column names
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
VALUES 
  ('Electronics', 75.5, 150, 50000),
  ('Clothing', 45.2, 89, 32000),
  ('Food & Beverage', 82.1, 234, 78000);

INSERT INTO consumer_behavior (method, value, suggested, accepted, rate)
VALUES 
  ('Online', 65.2, 100, 75, 75.0),
  ('In-store', 55.8, 80, 65, 81.25),
  ('Mobile App', 72.3, 120, 95, 79.17);

INSERT INTO consumer_profiles (age_group, gender, location, income_level, urban_rural)
VALUES 
  ('25-34', 'Male', 'New York', '$60k-$100k', 'Urban'),
  ('35-44', 'Female', 'Los Angeles', '$30k-$60k', 'Urban'),
  ('18-24', 'Male', 'Chicago', 'Under $30k', 'Urban');

INSERT INTO product_substitutions (original_product, suggested_product, acceptance_rate, revenue_impact)
VALUES 
  ('Product A', 'Product B', 75.5, 12500.00),
  ('Product C', 'Product D', 82.3, 18750.00);

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

SELECT 'Schema fix completed successfully - all tables now have correct column structure' as status;
EOF

# Execute the SQL
if command -v psql &> /dev/null; then
    echo "✅ Executing via psql..."
    psql "$CONNECTION_STRING" -f /tmp/corrected_schema_fix.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ SCHEMA FIX EXECUTED SUCCESSFULLY!"
        echo "📊 All tables recreated with correct column structure"
        echo "✅ RLS policies enabled"
        echo "✅ Sample data inserted"
        echo "✅ Dashboard should now work"
        echo ""
        echo "🌐 Test dashboard:"
        echo "https://scout-databank-clone-4gi581czs-scout-db.vercel.app"
    else
        echo "❌ Error executing schema fix"
        echo "🔄 Try manual execution:"
        echo "1. Copy SQL to Supabase SQL Editor"
        echo "2. Or use connection string above"
    fi
else
    echo "❌ psql not found"
    echo "🔄 Manual execution required:"
    echo "1. Copy /tmp/corrected_schema_fix.sql to Supabase SQL Editor"
    echo "2. Or install PostgreSQL client tools"
fi

echo ""
echo "🔗 Connection string for manual execution:"
echo "$CONNECTION_STRING"
