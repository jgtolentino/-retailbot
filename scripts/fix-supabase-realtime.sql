-- Scout Databank Supabase Schema and Realtime Fix
-- This script creates all necessary tables and enables Realtime

-- Create consumer_profiles table
CREATE TABLE IF NOT EXISTS public.consumer_profiles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    location VARCHAR(255),
    income_level VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consumer_behavior table
CREATE TABLE IF NOT EXISTS public.consumer_behavior (
    id BIGSERIAL PRIMARY KEY,
    consumer_id BIGINT REFERENCES consumer_profiles(id),
    behavior_type VARCHAR(100),
    behavior_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consumer_preferences table
CREATE TABLE IF NOT EXISTS public.consumer_preferences (
    id BIGSERIAL PRIMARY KEY,
    consumer_id BIGINT REFERENCES consumer_profiles(id),
    preference_type VARCHAR(100),
    preference_value TEXT,
    score NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_mix table
CREATE TABLE IF NOT EXISTS public.product_mix (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    sub_category VARCHAR(100),
    brand VARCHAR(100),
    price NUMERIC(10,2),
    availability_status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    consumer_id BIGINT REFERENCES consumer_profiles(id),
    product_id BIGINT REFERENCES product_mix(id),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10,2),
    total_price NUMERIC(10,2),
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consumer_behavior_consumer_id ON consumer_behavior(consumer_id);
CREATE INDEX IF NOT EXISTS idx_consumer_preferences_consumer_id ON consumer_preferences(consumer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_consumer_id ON transactions(consumer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_consumer_profiles_updated_at BEFORE UPDATE ON consumer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumer_behavior_updated_at BEFORE UPDATE ON consumer_behavior
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumer_preferences_updated_at BEFORE UPDATE ON consumer_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_mix_updated_at BEFORE UPDATE ON product_mix
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON consumer_profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON consumer_behavior
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON consumer_preferences
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON product_mix
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON transactions
    FOR SELECT USING (true);

-- IMPORTANT: Enable Realtime for all tables
-- This is what fixes the WebSocket 404 errors
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_behavior;
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE product_mix;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Insert sample data for testing
INSERT INTO consumer_profiles (name, age, gender, location, income_level) VALUES
    ('John Doe', 35, 'Male', 'New York', 'High'),
    ('Jane Smith', 28, 'Female', 'Los Angeles', 'Medium'),
    ('Bob Johnson', 42, 'Male', 'Chicago', 'High')
ON CONFLICT DO NOTHING;

INSERT INTO product_mix (product_name, category, sub_category, brand, price, availability_status) VALUES
    ('Premium Coffee', 'Beverages', 'Coffee', 'Starbucks', 5.99, 'In Stock'),
    ('Organic Milk', 'Dairy', 'Milk', 'Horizon', 4.49, 'In Stock'),
    ('Whole Wheat Bread', 'Bakery', 'Bread', 'Wonderbread', 3.99, 'In Stock')
ON CONFLICT DO NOTHING;

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Confirm Realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';