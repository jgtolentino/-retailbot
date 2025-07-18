-- Scout Databank Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  store_id TEXT,
  store_name TEXT,
  location TEXT,
  region TEXT,
  province TEXT,
  city_municipality TEXT,
  barangay TEXT,
  store_type TEXT,
  store_economic_class TEXT,
  product_name TEXT,
  product_category TEXT,
  product_subcategory TEXT,
  brand TEXT,
  amount DECIMAL(12,2),
  quantity INTEGER DEFAULT 1,
  payment_method TEXT,
  customer_id TEXT,
  customer_economic_class TEXT,
  age_bracket TEXT,
  gender TEXT,
  handshake_type TEXT,
  handshake_result TEXT,
  weather_condition TEXT,
  day_of_week TEXT,
  hour_of_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tx_timestamp ON transactions(timestamp);
CREATE INDEX idx_tx_store ON transactions(store_id);
CREATE INDEX idx_tx_location ON transactions(location);
CREATE INDEX idx_tx_amount ON transactions(amount);
CREATE INDEX idx_tx_created ON transactions(created_at);

-- Master dimension tables (for Master Toggle Agent)
CREATE TABLE IF NOT EXISTS master_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_store_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_type TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IoT telemetry tables
CREATE TABLE IF NOT EXISTS iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  device_type TEXT NOT NULL,
  store_id TEXT,
  location TEXT,
  status TEXT DEFAULT 'online',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iot_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  battery_level DECIMAL(5,2),
  signal_strength INTEGER,
  telemetry JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_iot_device ON iot_telemetry(device_id, timestamp);
CREATE INDEX idx_iot_timestamp ON iot_telemetry(timestamp);

-- Alerts table
CREATE TABLE IF NOT EXISTS iot_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  store_name TEXT,
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Agent heartbeats (for Lyra redundancy)
CREATE TABLE IF NOT EXISTS lyra_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('primary', 'secondary')),
  is_active BOOLEAN DEFAULT false,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pull queue (for Lyra)
CREATE TABLE IF NOT EXISTS pull_queue (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  agent_claimed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pull_queue_status ON pull_queue(status);
CREATE INDEX idx_pull_queue_created ON pull_queue(created_at);

-- Master schemas registry
CREATE TABLE IF NOT EXISTS master_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT UNIQUE NOT NULL,
  schema JSONB NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for demo)
CREATE POLICY "Allow anonymous read" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON transactions FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read" ON iot_telemetry FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON iot_telemetry FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read" ON iot_devices FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON iot_devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON iot_devices FOR UPDATE USING (true);

-- Sample data insertion
INSERT INTO transactions (
  transaction_id, timestamp, store_id, store_name, location, region,
  product_name, product_category, brand, amount, quantity, payment_method
) VALUES 
  ('TX001', NOW() - INTERVAL '1 hour', 'S001', 'Aling Rosa Store', 'Quezon City', 'NCR',
   'Rice 5kg', 'Food', 'Jasmine', 250.00, 1, 'cash'),
  ('TX002', NOW() - INTERVAL '2 hours', 'S002', 'Mang Juan Sari-Sari', 'Makati', 'NCR',
   'Cooking Oil 1L', 'Food', 'Golden', 85.00, 2, 'gcash'),
  ('TX003', NOW() - INTERVAL '3 hours', 'S003', 'Tindahan ni Ate', 'Pasig', 'NCR',
   'Instant Noodles', 'Food', 'Lucky Me', 15.00, 5, 'cash');

-- Insert sample IoT devices
INSERT INTO iot_devices (device_id, device_type, store_id, location, status) VALUES
  ('S001_TEMP_01', 'temperature', 'S001', 'Quezon City', 'online'),
  ('S002_TEMP_01', 'temperature', 'S002', 'Makati', 'online'),
  ('S001_POS_01', 'pos', 'S001', 'Quezon City', 'online');

-- Success message
SELECT 'Tables created successfully!' as message;