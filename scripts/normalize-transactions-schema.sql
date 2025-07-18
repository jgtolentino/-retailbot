-- Normalize Scout Databank Transactions Schema
-- This script creates a properly normalized database structure

-- 1. STORES TABLE (Location and Store Information)
CREATE TABLE IF NOT EXISTS stores (
    store_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_store_id TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL,
    store_type TEXT,
    barangay TEXT,
    city_municipality TEXT,
    province TEXT,
    region TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    economic_class TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE (Customer Demographics)
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_type TEXT,
    gender TEXT,
    age_range TEXT,
    loyalty_status TEXT,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE (Product Catalog)
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    subcategory TEXT,
    is_tbwa_client BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGNS TABLE (Marketing Campaigns)
CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_campaign_id TEXT UNIQUE,
    campaign_name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NORMALIZED TRANSACTIONS TABLE (Core Transaction Data)
CREATE TABLE IF NOT EXISTS transactions_normalized (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_transaction_id TEXT UNIQUE,
    store_id UUID REFERENCES stores(store_id),
    customer_id UUID REFERENCES customers(customer_id),
    timestamp TIMESTAMPTZ NOT NULL,
    transaction_value DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    payment_method TEXT,
    duration_seconds INTEGER,
    units_total INTEGER,
    request_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTION_ITEMS TABLE (Line Items)
CREATE TABLE IF NOT EXISTS transaction_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions_normalized(transaction_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    was_substituted BOOLEAN DEFAULT FALSE,
    original_product_id UUID REFERENCES products(product_id),
    item_order INTEGER, -- Position in transaction
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TRANSACTION_CONTEXT TABLE (Environmental/Contextual Data)
CREATE TABLE IF NOT EXISTS transaction_context (
    context_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions_normalized(transaction_id) ON DELETE CASCADE,
    day_of_week TEXT,
    hour_of_day INTEGER,
    weather TEXT,
    is_payday BOOLEAN,
    storeowner_influence TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRANSACTION_INTERACTIONS TABLE (Customer Interactions)
CREATE TABLE IF NOT EXISTS transaction_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions_normalized(transaction_id) ON DELETE CASCADE,
    suggestion_accepted BOOLEAN,
    full_transcript TEXT,
    sentiment_score DECIMAL(3,2),
    video_objects_detected TEXT[],
    handshake_detected BOOLEAN,
    handshake_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TRANSACTION_CAMPAIGNS TABLE (Campaign Associations)
CREATE TABLE IF NOT EXISTS transaction_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions_normalized(transaction_id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(campaign_id),
    influenced_by_campaign BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_normalized_store_id ON transactions_normalized(store_id);
CREATE INDEX idx_transactions_normalized_customer_id ON transactions_normalized(customer_id);
CREATE INDEX idx_transactions_normalized_timestamp ON transactions_normalized(timestamp);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);
CREATE INDEX idx_stores_external_id ON stores(external_store_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_customers_type_loyalty ON customers(customer_type, loyalty_status);

-- Create views for common queries
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    t.transaction_id,
    t.external_transaction_id,
    t.timestamp,
    s.store_name,
    s.city_municipality,
    s.region,
    c.gender as customer_gender,
    c.age_range as customer_age,
    c.loyalty_status,
    t.final_amount,
    t.units_total,
    tc.weather,
    tc.is_payday,
    ti.suggestion_accepted
FROM transactions_normalized t
JOIN stores s ON t.store_id = s.store_id
LEFT JOIN customers c ON t.customer_id = c.customer_id
LEFT JOIN transaction_context tc ON t.transaction_id = tc.transaction_id
LEFT JOIN transaction_interactions ti ON t.transaction_id = ti.transaction_id;

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_normalized ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read" ON stores FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON transactions_normalized FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON transaction_items FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON transaction_context FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON transaction_interactions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON transaction_campaigns FOR SELECT USING (true);

-- Enable Realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE stores;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions_normalized;
ALTER PUBLICATION supabase_realtime ADD TABLE transaction_items;
ALTER PUBLICATION supabase_realtime ADD TABLE transaction_context;
ALTER PUBLICATION supabase_realtime ADD TABLE transaction_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE transaction_campaigns;

-- Migration function to populate normalized tables from existing flat table
CREATE OR REPLACE FUNCTION migrate_transactions_to_normalized()
RETURNS void AS $$
DECLARE
    r RECORD;
    v_store_id UUID;
    v_customer_id UUID;
    v_product_id UUID;
    v_transaction_id UUID;
    v_campaign_id UUID;
BEGIN
    FOR r IN SELECT * FROM transactions LOOP
        -- Insert or get store
        INSERT INTO stores (external_store_id, store_name, store_type, barangay, city_municipality, province, region, latitude, longitude, economic_class)
        VALUES (r.store_id, r.store_name, r.store_type, r.barangay, r.city_municipality, r.province, r.region, r.latitude, r.longitude, r.economic_class)
        ON CONFLICT (external_store_id) DO UPDATE SET store_name = EXCLUDED.store_name
        RETURNING store_id INTO v_store_id;
        
        -- Insert or get customer
        INSERT INTO customers (customer_type, gender, age_range, loyalty_status, language)
        VALUES (r.customer_type, r.customer_gender, r.customer_age, r.loyalty_status, r.language)
        RETURNING customer_id INTO v_customer_id;
        
        -- Insert transaction
        INSERT INTO transactions_normalized (
            external_transaction_id, store_id, customer_id, timestamp,
            transaction_value, discount_amount, final_amount, payment_method,
            duration_seconds, units_total, request_type
        ) VALUES (
            r.transaction_id, v_store_id, v_customer_id, r.timestamp,
            r.transaction_value, CASE WHEN r.discount_amount ~ '^[0-9.]+$' THEN r.discount_amount::DECIMAL ELSE 0 END,
            r.final_amount, r.payment_method, r.duration_seconds, r.units_total, r.request_type
        ) RETURNING transaction_id INTO v_transaction_id;
        
        -- Insert transaction context
        INSERT INTO transaction_context (
            transaction_id, day_of_week, hour_of_day, weather, is_payday, storeowner_influence
        ) VALUES (
            v_transaction_id, r.day_of_week, r.hour_of_day, r.weather, r.is_payday, r.storeowner_influence
        );
        
        -- Insert transaction interactions
        INSERT INTO transaction_interactions (
            transaction_id, suggestion_accepted, full_transcript, sentiment_score,
            handshake_detected, handshake_score
        ) VALUES (
            v_transaction_id, r.suggestion_accepted, r.full_transcript, r.sentiment_score,
            r.handshake_detected, r.handshake_score
        );
        
        -- Handle first item (simplified - in real migration would handle all items)
        IF r.first_item_sku IS NOT NULL THEN
            INSERT INTO products (sku, product_name, brand, category, subcategory, is_tbwa_client)
            VALUES (r.first_item_sku, r.first_item_product, r.first_item_brand, r.first_item_category, r.product_subcategory, r.is_tbwa_client)
            ON CONFLICT (sku) DO UPDATE SET product_name = EXCLUDED.product_name
            RETURNING product_id INTO v_product_id;
            
            INSERT INTO transaction_items (
                transaction_id, product_id, quantity, unit_price, total_price, was_substituted, item_order
            ) VALUES (
                v_transaction_id, v_product_id, r.first_item_quantity, r.first_item_price,
                r.first_item_price * r.first_item_quantity, r.was_substituted, 1
            );
        END IF;
        
        -- Handle campaign if present
        IF r.campaign_id IS NOT NULL THEN
            INSERT INTO campaigns (external_campaign_id, campaign_name)
            VALUES (r.campaign_id, r.campaign_name)
            ON CONFLICT (external_campaign_id) DO UPDATE SET campaign_name = EXCLUDED.campaign_name
            RETURNING campaign_id INTO v_campaign_id;
            
            INSERT INTO transaction_campaigns (transaction_id, campaign_id, influenced_by_campaign)
            VALUES (v_transaction_id, v_campaign_id, r.influenced_by_campaign);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- To run migration (commented out for safety):
-- SELECT migrate_transactions_to_normalized();