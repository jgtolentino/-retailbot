-- Lyra Data Lakehouse Schema
-- Bronze -> Silver -> Gold Architecture

-- ============================================
-- BRONZE LAYER - Raw JSONB Storage
-- ============================================

-- Raw events table (all sources)
CREATE TABLE IF NOT EXISTS bronze_raw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  schema_version TEXT,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Bronze
CREATE INDEX idx_bronze_source ON bronze_raw_events(source);
CREATE INDEX idx_bronze_status ON bronze_raw_events(processing_status);
CREATE INDEX idx_bronze_ingested ON bronze_raw_events(ingested_at);
CREATE INDEX idx_bronze_payload ON bronze_raw_events USING GIN(raw_payload);

-- Bronze archival table
CREATE TABLE IF NOT EXISTS bronze_archive (
  LIKE bronze_raw_events INCLUDING ALL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SILVER LAYER - Cleaned & Validated
-- ============================================

-- IoT Telemetry (structured from bronze)
CREATE TABLE IF NOT EXISTS silver_iot_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  -- Sensor readings
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  pressure DECIMAL(7,2),
  battery_level DECIMAL(5,2),
  signal_strength INTEGER,
  -- Location
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  -- Metadata
  firmware_version TEXT,
  uptime_seconds INTEGER,
  error_count INTEGER,
  -- Lineage
  bronze_id UUID REFERENCES bronze_raw_events(id),
  transformed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (structured from bronze)
CREATE TABLE IF NOT EXISTS silver_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,
  store_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  items JSONB,
  payment_method TEXT,
  customer_id TEXT,
  -- Store context
  store_location TEXT,
  store_type TEXT,
  -- Lineage
  bronze_id UUID REFERENCES bronze_raw_events(id),
  transformed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consumer behavior (structured from bronze)
CREATE TABLE IF NOT EXISTS silver_consumer_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  behavior_type TEXT NOT NULL,
  product_category TEXT,
  brand_preference TEXT,
  purchase_frequency TEXT,
  price_sensitivity DECIMAL(3,2),
  -- Demographics
  age_group TEXT,
  gender TEXT,
  income_level TEXT,
  -- Lineage
  bronze_id UUID REFERENCES bronze_raw_events(id),
  transformed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Silver indexes
CREATE INDEX idx_silver_iot_device ON silver_iot_telemetry(device_id, timestamp);
CREATE INDEX idx_silver_iot_type ON silver_iot_telemetry(device_type);
CREATE INDEX idx_silver_tx_store ON silver_transactions(store_id, timestamp);
CREATE INDEX idx_silver_tx_amount ON silver_transactions(amount);
CREATE INDEX idx_silver_consumer_store ON silver_consumer_behavior(store_id, timestamp);

-- ============================================
-- GOLD LAYER - Business Aggregates
-- ============================================

-- Store Performance Metrics
CREATE TABLE IF NOT EXISTS gold_store_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  -- Revenue metrics
  total_revenue DECIMAL(15,2),
  transaction_count INTEGER,
  avg_transaction_value DECIMAL(10,2),
  revenue_growth_rate DECIMAL(5,2),
  -- Environmental metrics
  avg_temperature DECIMAL(5,2),
  avg_humidity DECIMAL(5,2),
  optimal_conditions_hours INTEGER,
  -- Customer metrics
  unique_customers INTEGER,
  repeat_customer_rate DECIMAL(5,2),
  peak_hour INTEGER,
  -- Rankings
  revenue_rank INTEGER,
  efficiency_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IoT Fleet Health
CREATE TABLE IF NOT EXISTS gold_iot_fleet_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_timestamp TIMESTAMPTZ NOT NULL,
  -- Fleet overview
  total_devices INTEGER,
  online_devices INTEGER,
  warning_devices INTEGER,
  offline_devices INTEGER,
  -- Health metrics
  avg_battery_level DECIMAL(5,2),
  avg_signal_strength INTEGER,
  devices_needing_maintenance INTEGER,
  -- By device type
  device_health_by_type JSONB,
  -- Alerts
  critical_alerts INTEGER,
  warning_alerts INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business KPIs
CREATE TABLE IF NOT EXISTS gold_business_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_date DATE NOT NULL,
  -- Revenue KPIs
  total_revenue DECIMAL(15,2),
  revenue_growth_mom DECIMAL(5,2),
  revenue_growth_yoy DECIMAL(5,2),
  -- Operational KPIs
  total_stores INTEGER,
  active_stores INTEGER,
  avg_store_efficiency DECIMAL(5,2),
  -- Customer KPIs
  total_customers INTEGER,
  new_customers INTEGER,
  customer_retention_rate DECIMAL(5,2),
  avg_customer_lifetime_value DECIMAL(12,2),
  -- Product KPIs
  top_selling_products JSONB,
  category_performance JSONB,
  -- Calculated at
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gold indexes
CREATE INDEX idx_gold_store_period ON gold_store_performance(store_id, period_start, period_end);
CREATE INDEX idx_gold_iot_timestamp ON gold_iot_fleet_health(calculation_timestamp);
CREATE INDEX idx_gold_kpi_date ON gold_business_kpis(kpi_date);

-- ============================================
-- TRANSFORMATION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS lyra_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transformation_id TEXT UNIQUE NOT NULL,
  source_layer TEXT NOT NULL,
  target_layer TEXT NOT NULL,
  source_table TEXT NOT NULL,
  target_table TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DATA QUALITY METRICS
-- ============================================

CREATE TABLE IF NOT EXISTS lyra_data_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer TEXT NOT NULL,
  table_name TEXT NOT NULL,
  check_type TEXT NOT NULL,
  check_result JSONB NOT NULL,
  quality_score DECIMAL(5,2),
  issues_found INTEGER DEFAULT 0,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VIEWS FOR EASY ACCESS
-- ============================================

-- Current store status view
CREATE OR REPLACE VIEW v_current_store_status AS
SELECT 
  s.store_id,
  s.store_type,
  s.store_location,
  COUNT(DISTINCT t.transaction_id) as transaction_count_today,
  SUM(t.amount) as revenue_today,
  AVG(iot.temperature) as current_temperature,
  AVG(iot.humidity) as current_humidity,
  MAX(iot.timestamp) as last_sensor_reading
FROM silver_transactions t
LEFT JOIN silver_iot_telemetry iot ON iot.device_id LIKE t.store_id || '%'
WHERE t.timestamp >= CURRENT_DATE
  AND iot.timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY s.store_id, s.store_type, s.store_location;

-- Data lineage view
CREATE OR REPLACE VIEW v_data_lineage AS
SELECT 
  b.id as bronze_id,
  b.source,
  b.ingested_at,
  b.processing_status,
  s_iot.id as silver_iot_id,
  s_tx.id as silver_tx_id,
  g.id as gold_id,
  g.created_at as gold_created_at
FROM bronze_raw_events b
LEFT JOIN silver_iot_telemetry s_iot ON s_iot.bronze_id = b.id
LEFT JOIN silver_transactions s_tx ON s_tx.bronze_id = b.id
LEFT JOIN gold_store_performance g ON g.store_id = COALESCE(s_iot.device_id, s_tx.store_id)
ORDER BY b.ingested_at DESC;

-- ============================================
-- FUNCTIONS FOR LYRA
-- ============================================

-- Function to check data freshness
CREATE OR REPLACE FUNCTION check_data_freshness(
  p_layer TEXT,
  p_table TEXT,
  p_threshold_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  last_update TIMESTAMPTZ;
BEGIN
  EXECUTE format('SELECT MAX(created_at) FROM %I', p_table) INTO last_update;
  
  RETURN last_update > NOW() - (p_threshold_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old bronze data
CREATE OR REPLACE FUNCTION archive_bronze_data(p_days_old INTEGER DEFAULT 90) 
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  INSERT INTO bronze_archive
  SELECT *, NOW() as archived_at
  FROM bronze_raw_events
  WHERE ingested_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND processing_status = 'processed';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  DELETE FROM bronze_raw_events
  WHERE ingested_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND processing_status = 'processed';
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;