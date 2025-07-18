-- Scout Databank Schema with Realtime Enabled
-- For use with Supabase MCP Server

-- Create consumer_profiles table
CREATE TABLE IF NOT EXISTS consumer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  location TEXT,
  income_level TEXT,
  occupation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consumer_behavior table
CREATE TABLE IF NOT EXISTS consumer_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
  behavior_type TEXT,
  behavior_value JSONB,
  action TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consumer_preferences table
CREATE TABLE IF NOT EXISTS consumer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
  preference_type TEXT,
  preference_value TEXT,
  score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_mix table
CREATE TABLE IF NOT EXISTS product_mix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  category TEXT,
  sub_category TEXT,
  brand TEXT,
  price DECIMAL(10,2),
  value DECIMAL(5,2),
  skus INTEGER,
  availability_status TEXT DEFAULT 'In Stock',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES product_mix(id) ON DELETE CASCADE,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  payment_method TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create suggestion_acceptance table
CREATE TABLE IF NOT EXISTS suggestion_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion TEXT,
  accepted BOOLEAN,
  profile_id UUID REFERENCES consumer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ingestion_logs table
CREATE TABLE IF NOT EXISTS ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT,
  status TEXT,
  error TEXT,
  response_time_ms INTEGER,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consumer_behavior_profile_id ON consumer_behavior(profile_id);
CREATE INDEX IF NOT EXISTS idx_consumer_preferences_profile_id ON consumer_preferences(profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_consumer_id ON transactions(consumer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_suggestion_acceptance_profile_id ON suggestion_acceptance(profile_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_consumer_profiles_updated_at ON consumer_profiles;
CREATE TRIGGER update_consumer_profiles_updated_at BEFORE UPDATE ON consumer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consumer_preferences_updated_at ON consumer_preferences;
CREATE TRIGGER update_consumer_preferences_updated_at BEFORE UPDATE ON consumer_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_mix_updated_at ON product_mix;
CREATE TRIGGER update_product_mix_updated_at BEFORE UPDATE ON product_mix
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read access" ON consumer_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON consumer_behavior
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON consumer_preferences
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON product_mix
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON suggestion_acceptance
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON ingestion_logs
    FOR SELECT USING (true);

-- CRITICAL: Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_behavior;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE product_mix;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE suggestion_acceptance;
ALTER PUBLICATION supabase_realtime ADD TABLE ingestion_logs;

-- Insert sample data for consumer profiles
INSERT INTO consumer_profiles (id, name, age, gender, location, income_level, occupation) VALUES
    (gen_random_uuid(), 'John Doe', 35, 'Male', 'New York', 'High', 'Software Engineer'),
    (gen_random_uuid(), 'Jane Smith', 28, 'Female', 'Los Angeles', 'Medium', 'Marketing Manager'),
    (gen_random_uuid(), 'Bob Johnson', 42, 'Male', 'Chicago', 'High', 'Financial Analyst')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for products
INSERT INTO product_mix (id, product_name, category, sub_category, brand, price, value, skus) VALUES
    (gen_random_uuid(), 'Premium Coffee', 'Beverages', 'Coffee', 'Starbucks', 5.99, 4.5, 10),
    (gen_random_uuid(), 'Organic Milk', 'Dairy', 'Milk', 'Horizon', 4.49, 4.2, 5),
    (gen_random_uuid(), 'Whole Wheat Bread', 'Bakery', 'Bread', 'Wonderbread', 3.99, 3.8, 8)
ON CONFLICT (id) DO NOTHING;

-- Insert sample transactions (matching the actual table structure)
WITH sample_consumer AS (
    SELECT id FROM consumer_profiles LIMIT 1
),
sample_product AS (
    SELECT id, price FROM product_mix LIMIT 1
)
INSERT INTO transactions (consumer_id, product_id, quantity, unit_price, total_price, payment_method)
SELECT 
    sc.id,
    sp.id,
    2,
    sp.price,
    sp.price * 2,
    'Credit Card'
FROM sample_consumer sc, sample_product sp
ON CONFLICT DO NOTHING;

-- Verify Realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';