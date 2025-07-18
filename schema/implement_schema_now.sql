-- Immediate Implementation Schema for Scout Databank
-- This creates the essential tables matching your JSON structure

-- Drop existing tables if needed (be careful!)
-- DROP TABLE IF EXISTS transactions CASCADE;

-- Main transactions table matching your JSON structure
CREATE TABLE IF NOT EXISTS transactions (
    -- Core identifiers
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    
    -- Temporal data
    order_date DATE NOT NULL,
    ship_date DATE,
    transaction_datetime TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Store information
    store_id UUID NOT NULL,
    store_name TEXT NOT NULL,
    store_location TEXT NOT NULL,
    store_type TEXT DEFAULT 'Traditional_Sari_Sari',
    
    -- Location hierarchy
    region TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Philippines',
    city_municipality TEXT,
    barangay TEXT,
    
    -- Customer information
    customer_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_economic_class TEXT CHECK (customer_economic_class IN ('A','B','C','D','E')),
    
    -- Product information
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    product_subcategory TEXT,
    brand TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    
    -- Transaction details
    quantity INTEGER NOT NULL,
    discount NUMERIC(5,3) DEFAULT 0,
    sales NUMERIC(10,2) NOT NULL,
    profit NUMERIC(10,2),
    ship_mode TEXT,
    
    -- Handshake detection fields
    is_handshake BOOLEAN DEFAULT FALSE,
    handshake_brand_requested TEXT,
    handshake_brand_purchased TEXT,
    handshake_success BOOLEAN,
    handshake_type TEXT CHECK (handshake_type IN ('Direct_Request','Browse_Mention','Price_Compare','Availability_Check')),
    
    -- Payment and context
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash','GCash','Maya','Credit','Mixed')),
    is_credit_purchase BOOLEAN DEFAULT FALSE,
    weather_condition TEXT,
    is_payday_week BOOLEAN DEFAULT FALSE,
    
    -- Socioeconomic context
    poverty_incidence NUMERIC(5,3),
    median_household_income NUMERIC(10,2),
    urbanization_level NUMERIC(3,2),
    store_economic_class TEXT CHECK (store_economic_class IN ('A','B','C','D','E')),
    
    -- TBWA client tracking
    is_tbwa_brand BOOLEAN DEFAULT FALSE,
    tbwa_client_name TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_source TEXT DEFAULT 'synthetic'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trans_datetime ON transactions(transaction_datetime);
CREATE INDEX IF NOT EXISTS idx_trans_store ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_trans_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_trans_product ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_trans_brand ON transactions(brand);
CREATE INDEX IF NOT EXISTS idx_trans_handshake ON transactions(is_handshake);
CREATE INDEX IF NOT EXISTS idx_trans_tbwa ON transactions(is_tbwa_brand);
CREATE INDEX IF NOT EXISTS idx_trans_region ON transactions(region);
CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions(order_date);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create a policy for read access (adjust as needed)
CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
ON transactions FOR SELECT 
USING (true);

-- Create summary view for quick analytics
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    DATE(transaction_datetime) as transaction_date,
    region,
    store_name,
    store_economic_class,
    customer_economic_class,
    brand,
    product_category,
    is_tbwa_brand,
    is_handshake,
    COUNT(*) as transaction_count,
    SUM(quantity) as total_units,
    SUM(sales) as total_sales,
    AVG(sales) as avg_transaction_value,
    SUM(CASE WHEN is_handshake THEN 1 ELSE 0 END) as handshake_count,
    SUM(CASE WHEN is_handshake AND handshake_success THEN 1 ELSE 0 END) as successful_handshakes
FROM transactions
GROUP BY 1,2,3,4,5,6,7,8,9;

-- Create handshake analytics view
CREATE OR REPLACE VIEW handshake_analytics AS
SELECT 
    brand as requested_brand,
    handshake_brand_purchased as purchased_brand,
    handshake_type,
    store_economic_class,
    customer_economic_class,
    region,
    COUNT(*) as handshake_attempts,
    SUM(CASE WHEN handshake_success THEN 1 ELSE 0 END) as successful_handshakes,
    AVG(CASE WHEN handshake_success THEN 1 ELSE 0 END) as success_rate,
    AVG(sales) as avg_handshake_value
FROM transactions
WHERE is_handshake = TRUE
GROUP BY 1,2,3,4,5,6;

-- Create TBWA brand performance view
CREATE OR REPLACE VIEW tbwa_brand_performance AS
SELECT 
    tbwa_client_name,
    brand,
    product_category,
    DATE_TRUNC('month', transaction_datetime) as month,
    COUNT(*) as transactions,
    SUM(quantity) as units_sold,
    SUM(sales) as total_revenue,
    SUM(profit) as total_profit,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(DISTINCT store_id) as unique_stores,
    SUM(CASE WHEN is_handshake THEN sales ELSE 0 END) / NULLIF(SUM(sales), 0) as handshake_sales_ratio
FROM transactions
WHERE is_tbwa_brand = TRUE
GROUP BY 1,2,3,4;

-- Function to import JSON data
CREATE OR REPLACE FUNCTION import_json_transactions(json_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    record JSONB;
    imported_count INTEGER := 0;
BEGIN
    FOR record IN SELECT * FROM jsonb_array_elements(json_data)
    LOOP
        INSERT INTO transactions (
            transaction_id,
            order_id,
            order_date,
            ship_date,
            ship_mode,
            customer_id,
            customer_name,
            customer_email,
            customer_phone,
            store_id,
            store_name,
            store_location,
            region,
            country,
            product_id,
            product_name,
            product_category,
            product_subcategory,
            brand,
            sku,
            unit_price,
            quantity,
            discount,
            sales,
            profit,
            created_at,
            updated_at
        ) VALUES (
            COALESCE((record->>'transaction_id')::UUID, gen_random_uuid()),
            record->>'order_id',
            (record->>'order_date')::DATE,
            (record->>'ship_date')::DATE,
            record->>'ship_mode',
            (record->>'customer_id')::UUID,
            record->>'customer_name',
            record->>'customer_email',
            record->>'customer_phone',
            (record->>'store_id')::UUID,
            record->>'store_name',
            record->>'store_location',
            record->>'region',
            record->>'country',
            (record->>'product_id')::UUID,
            record->>'product_name',
            record->>'product_category',
            record->>'product_subcategory',
            record->>'brand',
            record->>'sku',
            (record->>'unit_price')::NUMERIC,
            (record->>'quantity')::INTEGER,
            (record->>'discount')::NUMERIC,
            (record->>'sales')::NUMERIC,
            (record->>'profit')::NUMERIC,
            (record->>'created_at')::TIMESTAMP WITH TIME ZONE,
            (record->>'updated_at')::TIMESTAMP WITH TIME ZONE
        )
        ON CONFLICT (order_id) DO NOTHING;
        
        imported_count := imported_count + 1;
    END LOOP;
    
    RETURN imported_count;
END;
$$ LANGUAGE plpgsql;

-- Add computed columns for analytics
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS day_of_week INTEGER GENERATED ALWAYS AS (EXTRACT(DOW FROM transaction_datetime)) STORED,
ADD COLUMN IF NOT EXISTS hour_of_day INTEGER GENERATED ALWAYS AS (EXTRACT(HOUR FROM transaction_datetime)) STORED,
ADD COLUMN IF NOT EXISTS is_weekend BOOLEAN GENERATED ALWAYS AS (EXTRACT(DOW FROM transaction_datetime) IN (0,6)) STORED,
ADD COLUMN IF NOT EXISTS month_year TEXT GENERATED ALWAYS AS (TO_CHAR(transaction_datetime, 'YYYY-MM')) STORED;