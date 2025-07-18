-- Scout Databank Full Schema for Philippine Sari-Sari Store Analytics
-- Based on comprehensive handshake dataset with socioeconomic factors

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create schema namespaces
CREATE SCHEMA IF NOT EXISTS master;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS analytics;

-- =====================================================
-- MASTER DATA TABLES
-- =====================================================

-- 1. Enhanced Locations Master with Socioeconomic Data
CREATE TABLE master.locations (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Geographic hierarchy
    region TEXT NOT NULL,
    province TEXT NOT NULL,
    city_municipality TEXT NOT NULL,
    barangay TEXT NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    geom geometry(Point, 4326),
    
    -- Administrative classification
    city_income_class TEXT CHECK (city_income_class IN ('First','Second','Third','Fourth','Fifth','Sixth')),
    urbanization_level NUMERIC(3,2) CHECK (urbanization_level BETWEEN 0 AND 1),
    is_island_province BOOLEAN DEFAULT FALSE,
    
    -- Socioeconomic indicators
    poverty_incidence NUMERIC(5,3) CHECK (poverty_incidence BETWEEN 0 AND 1),
    median_household_income NUMERIC(10,2),
    gini_coefficient NUMERIC(4,3),
    
    -- Demographics
    population INTEGER,
    population_density NUMERIC(10,2), -- per sq km
    household_count INTEGER,
    avg_household_size NUMERIC(3,1),
    youth_dependency_ratio NUMERIC(5,2),
    elderly_dependency_ratio NUMERIC(5,2),
    
    -- Health indicators
    malnutrition_rate NUMERIC(5,3),
    healthcare_access_score NUMERIC(3,2) CHECK (healthcare_access_score BETWEEN 0 AND 1),
    hospital_bed_ratio NUMERIC(6,2), -- beds per 1000 population
    life_expectancy NUMERIC(4,1),
    
    -- Infrastructure
    electricity_access NUMERIC(5,3) CHECK (electricity_access BETWEEN 0 AND 1),
    water_access NUMERIC(5,3) CHECK (water_access BETWEEN 0 AND 1),
    internet_penetration NUMERIC(5,3) CHECK (internet_penetration BETWEEN 0 AND 1),
    road_density_km_per_sqkm NUMERIC(6,2),
    mobile_signal_quality TEXT CHECK (mobile_signal_quality IN ('Excellent','Good','Fair','Poor','None')),
    
    -- Economic activity
    unemployment_rate NUMERIC(5,3),
    underemployment_rate NUMERIC(5,3),
    main_livelihood TEXT CHECK (main_livelihood IN ('Agriculture','Fishing','Manufacturing','Services','Mining','Tourism')),
    avg_daily_wage NUMERIC(8,2),
    remittance_recipient_rate NUMERIC(5,3),
    
    -- Education
    literacy_rate NUMERIC(5,3) CHECK (literacy_rate BETWEEN 0 AND 1),
    avg_years_education NUMERIC(4,1),
    college_graduate_rate NUMERIC(5,3),
    
    -- Retail environment
    sari_sari_density_per_1000 NUMERIC(6,2),
    public_market_present BOOLEAN DEFAULT FALSE,
    mall_present BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_source TEXT,
    last_census_year INTEGER
);

-- 2. Stores Master Table
CREATE TABLE master.stores (
    store_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_code TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL,
    
    -- Location
    location_id UUID REFERENCES master.locations(location_id),
    street_address TEXT,
    landmark TEXT,
    
    -- Store characteristics
    store_type TEXT CHECK (store_type IN ('Traditional_Sari_Sari','Modern_Sari_Sari','Convenience','Mini_Mart','Roadside_Stand')),
    store_size_sqm NUMERIC(6,2),
    years_in_operation NUMERIC(4,1),
    ownership_type TEXT CHECK (ownership_type IN ('Single_Owner','Family_Business','Cooperative','Corporate')),
    
    -- Economic classification
    store_economic_class TEXT CHECK (store_economic_class IN ('A','B','C','D','E')),
    avg_daily_sales NUMERIC(10,2),
    avg_daily_customers INTEGER,
    
    -- Facilities
    has_refrigeration BOOLEAN DEFAULT FALSE,
    has_freezer BOOLEAN DEFAULT FALSE,
    has_cooking_facilities BOOLEAN DEFAULT FALSE,
    has_seating_area BOOLEAN DEFAULT FALSE,
    accepts_gcash BOOLEAN DEFAULT FALSE,
    accepts_maya BOOLEAN DEFAULT FALSE,
    offers_credit BOOLEAN DEFAULT TRUE,
    offers_delivery BOOLEAN DEFAULT FALSE,
    
    -- Operations
    opening_time TIME,
    closing_time TIME,
    operates_24_7 BOOLEAN DEFAULT FALSE,
    staff_count INTEGER DEFAULT 1,
    
    -- Relationships
    owner_lives_on_premise BOOLEAN DEFAULT TRUE,
    customer_relationship_score NUMERIC(3,2), -- 0-1 scale
    community_trust_level TEXT CHECK (community_trust_level IN ('Very_High','High','Medium','Low')),
    
    -- Supply chain
    primary_supplier TEXT,
    delivery_frequency_days INTEGER,
    credit_terms_days INTEGER,
    
    -- Competition
    competitors_within_500m INTEGER DEFAULT 0,
    market_share_estimate NUMERIC(5,3),
    
    -- Digital adoption
    has_pos_system BOOLEAN DEFAULT FALSE,
    uses_inventory_app BOOLEAN DEFAULT FALSE,
    social_media_active BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Customers Master Table
CREATE TABLE master.customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code TEXT UNIQUE NOT NULL,
    
    -- Demographics
    age_bracket TEXT CHECK (age_bracket IN ('18-24','25-34','35-44','45-54','55-64','65+')),
    gender TEXT CHECK (gender IN ('Male','Female','Other')),
    economic_class TEXT CHECK (economic_class IN ('A','B','C','D','E')),
    
    -- Socioeconomic profile
    education_level TEXT CHECK (education_level IN ('Elementary','High_School','Vocational','College','Post_Graduate')),
    occupation_category TEXT CHECK (occupation_category IN ('Student','Employed','Self_Employed','Unemployed','Retired','Housewife')),
    household_size INTEGER,
    number_of_children INTEGER DEFAULT 0,
    
    -- Financial profile
    income_source TEXT CHECK (income_source IN ('Salary','Business','Remittance','Pension','Multiple')),
    has_bank_account BOOLEAN,
    has_gcash BOOLEAN,
    credit_risk_score NUMERIC(3,2), -- 0-1 scale
    
    -- Shopping behavior
    primary_store_id UUID REFERENCES master.stores(store_id),
    shopping_frequency TEXT CHECK (shopping_frequency IN ('Daily','Several_Per_Week','Weekly','Biweekly','Monthly')),
    avg_basket_size NUMERIC(10,2),
    price_sensitivity TEXT CHECK (price_sensitivity IN ('Very_High','High','Medium','Low')),
    brand_loyalty_index NUMERIC(3,2), -- 0-1 scale
    
    -- Digital profile
    smartphone_user BOOLEAN,
    internet_access_type TEXT CHECK (internet_access_type IN ('Fiber','DSL','Mobile_Data','WiFi_Only','None')),
    social_media_usage TEXT CHECK (social_media_usage IN ('Heavy','Moderate','Light','None')),
    online_shopping_experience BOOLEAN DEFAULT FALSE,
    
    -- Health consciousness
    health_awareness_level TEXT CHECK (health_awareness_level IN ('High','Medium','Low')),
    nutrition_conscious BOOLEAN DEFAULT FALSE,
    has_dietary_restrictions BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_transaction_date DATE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Products Master Table with TBWA Focus
CREATE TABLE master.products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT,
    
    -- Product identification
    product_name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    manufacturer TEXT,
    is_tbwa_client BOOLEAN DEFAULT FALSE,
    tbwa_client_name TEXT,
    
    -- Category hierarchy
    category_l1 TEXT NOT NULL, -- Major category
    category_l2 TEXT, -- Subcategory
    category_l3 TEXT, -- Micro-category
    
    -- Product details
    size_value NUMERIC(10,3),
    size_unit TEXT,
    pack_size INTEGER DEFAULT 1,
    flavor_variant TEXT,
    
    -- Pricing
    srp NUMERIC(10,2), -- Suggested Retail Price
    wholesale_price NUMERIC(10,2),
    typical_margin_percent NUMERIC(5,2),
    
    -- Attributes
    is_essential_good BOOLEAN DEFAULT FALSE,
    is_sin_product BOOLEAN DEFAULT FALSE,
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    shelf_life_days INTEGER,
    
    -- Nutritional/Health
    is_fortified BOOLEAN DEFAULT FALSE,
    has_health_claim BOOLEAN DEFAULT FALSE,
    sugar_content_level TEXT CHECK (sugar_content_level IN ('None','Low','Medium','High')),
    
    -- Market position
    market_segment TEXT CHECK (market_segment IN ('Premium','Mainstream','Economy','Sachet')),
    target_economic_class TEXT[],
    competitor_products TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    launch_date DATE
);

-- 5. Brands Master Table
CREATE TABLE master.brands (
    brand_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name TEXT UNIQUE NOT NULL,
    parent_company TEXT,
    is_tbwa_client BOOLEAN DEFAULT FALSE,
    
    -- Brand attributes
    brand_tier TEXT CHECK (brand_tier IN ('Premium','Mainstream','Value','Local')),
    country_of_origin TEXT,
    is_local_brand BOOLEAN,
    
    -- Market presence
    market_share_percent NUMERIC(5,2),
    distribution_coverage TEXT CHECK (distribution_coverage IN ('National','Regional','Provincial','Local')),
    years_in_market INTEGER,
    
    -- Marketing
    advertising_spend_level TEXT CHECK (advertising_spend_level IN ('Heavy','Moderate','Light','None')),
    promotion_frequency TEXT CHECK (promotion_frequency IN ('Weekly','Monthly','Quarterly','Seasonal')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRANSACTION TABLES
-- =====================================================

-- 6. Main Transactions Table
CREATE TABLE transactions.transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number TEXT UNIQUE NOT NULL,
    
    -- Core transaction data
    transaction_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    store_id UUID REFERENCES master.stores(store_id),
    customer_id UUID REFERENCES master.customers(customer_id),
    location_id UUID REFERENCES master.locations(location_id),
    
    -- Transaction details
    total_amount NUMERIC(10,2) NOT NULL,
    total_items INTEGER NOT NULL,
    unique_items INTEGER NOT NULL,
    
    -- Payment information
    payment_method TEXT CHECK (payment_method IN ('Cash','GCash','Maya','Credit','Mixed')),
    cash_amount NUMERIC(10,2),
    digital_amount NUMERIC(10,2),
    credit_amount NUMERIC(10,2),
    change_given NUMERIC(10,2),
    
    -- Context
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    hour_of_day INTEGER CHECK (hour_of_day BETWEEN 0 AND 23),
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    holiday_type TEXT,
    weather_condition TEXT CHECK (weather_condition IN ('Sunny','Cloudy','Rainy','Stormy')),
    
    -- Economic context
    is_payday_week BOOLEAN DEFAULT FALSE,
    is_remittance_day BOOLEAN DEFAULT FALSE,
    inflation_rate_at_time NUMERIC(5,2),
    
    -- Store context
    staff_on_duty INTEGER DEFAULT 1,
    queue_length_before INTEGER DEFAULT 0,
    competitor_promo_active BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_source TEXT DEFAULT 'POS',
    is_voided BOOLEAN DEFAULT FALSE,
    void_reason TEXT
);

-- 7. Transaction Items Detail Table
CREATE TABLE transactions.transaction_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions.transactions(transaction_id),
    line_number INTEGER NOT NULL,
    
    -- Product information
    product_id UUID REFERENCES master.products(product_id),
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    
    -- Quantities and amounts
    quantity NUMERIC(10,3) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    line_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    final_amount NUMERIC(10,2) NOT NULL,
    
    -- Handshake detection
    is_handshake BOOLEAN DEFAULT FALSE,
    handshake_brand TEXT,
    handshake_initiated_by TEXT CHECK (handshake_initiated_by IN ('Customer','Store','Both')),
    handshake_success BOOLEAN,
    time_to_handshake_seconds INTEGER,
    
    -- Promotion tracking
    promo_code TEXT,
    promo_type TEXT CHECK (promo_type IN ('Discount','BOGO','Bundle','Points')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(transaction_id, line_number)
);

-- 8. Handshake Events Table
CREATE TABLE analytics.handshake_events (
    handshake_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions.transactions(transaction_id),
    item_id UUID REFERENCES transactions.transaction_items(item_id),
    
    -- Handshake details
    handshake_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    requested_brand TEXT NOT NULL,
    offered_brand TEXT NOT NULL,
    handshake_type TEXT CHECK (handshake_type IN ('Direct_Request','Category_Browse','Price_Inquiry','Availability_Check')),
    
    -- Outcome
    handshake_result TEXT CHECK (handshake_result IN ('Success','Switch','Reject','Defer')),
    switch_reason TEXT CHECK (switch_reason IN ('Price','Availability','Preference','Promotion')),
    
    -- Context
    customer_conviction_level TEXT CHECK (customer_conviction_level IN ('Strong','Moderate','Weak')),
    store_recommendation_given BOOLEAN DEFAULT FALSE,
    competing_brands_shown TEXT[],
    
    -- Performance metrics
    interaction_duration_seconds INTEGER,
    number_of_alternatives_shown INTEGER DEFAULT 0,
    final_purchase_amount NUMERIC(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- 9. Customer Segmentation
CREATE TABLE analytics.customer_segments (
    segment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES master.customers(customer_id),
    
    -- Behavioral segments
    value_segment TEXT CHECK (value_segment IN ('High_Value','Medium_Value','Low_Value','Churned')),
    frequency_segment TEXT CHECK (frequency_segment IN ('Daily','Regular','Occasional','Rare')),
    recency_segment TEXT CHECK (recency_segment IN ('Active','Recent','Lapsing','Lost')),
    
    -- Psychographic segments
    lifestyle_segment TEXT CHECK (lifestyle_segment IN ('Health_Conscious','Value_Seeker','Premium_Buyer','Convenience_First')),
    brand_affinity_segment TEXT CHECK (brand_affinity_segment IN ('Brand_Loyal','Brand_Switcher','Price_Driven')),
    
    -- Calculated metrics
    customer_lifetime_value NUMERIC(12,2),
    avg_monthly_spend NUMERIC(10,2),
    visit_frequency_per_month NUMERIC(5,2),
    basket_size_trend TEXT CHECK (basket_size_trend IN ('Growing','Stable','Declining')),
    
    -- Handshake behavior
    handshake_responsiveness TEXT CHECK (handshake_responsiveness IN ('High','Medium','Low','None')),
    brand_switch_probability NUMERIC(3,2),
    
    -- Update tracking
    segment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Store Performance Analytics
CREATE TABLE analytics.store_performance (
    performance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES master.stores(store_id),
    performance_date DATE NOT NULL,
    
    -- Sales metrics
    total_sales NUMERIC(12,2),
    transaction_count INTEGER,
    unique_customers INTEGER,
    avg_basket_size NUMERIC(10,2),
    
    -- Product metrics
    unique_skus_sold INTEGER,
    out_of_stock_instances INTEGER,
    slow_moving_sku_count INTEGER,
    
    -- Category performance
    top_category TEXT,
    category_sales JSONB, -- {category: sales_amount}
    
    -- Brand performance
    tbwa_brand_sales NUMERIC(12,2),
    tbwa_brand_share NUMERIC(5,3),
    competitor_brand_sales NUMERIC(12,2),
    
    -- Handshake metrics
    handshake_attempts INTEGER,
    handshake_success_rate NUMERIC(5,3),
    avg_handshake_value NUMERIC(10,2),
    
    -- Customer metrics
    new_customers INTEGER,
    repeat_customer_rate NUMERIC(5,3),
    credit_sales_percent NUMERIC(5,3),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, performance_date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Location indexes
CREATE INDEX idx_locations_region ON master.locations(region);
CREATE INDEX idx_locations_city ON master.locations(city_municipality);
CREATE INDEX idx_locations_poverty ON master.locations(poverty_incidence);
CREATE INDEX idx_locations_geom ON master.locations USING GIST(geom);

-- Store indexes
CREATE INDEX idx_stores_location ON master.stores(location_id);
CREATE INDEX idx_stores_type ON master.stores(store_type);
CREATE INDEX idx_stores_economic_class ON master.stores(store_economic_class);

-- Customer indexes
CREATE INDEX idx_customers_economic_class ON master.customers(economic_class);
CREATE INDEX idx_customers_primary_store ON master.customers(primary_store_id);
CREATE INDEX idx_customers_last_transaction ON master.customers(last_transaction_date);

-- Product indexes
CREATE INDEX idx_products_brand ON master.products(brand_name);
CREATE INDEX idx_products_category ON master.products(category_l1, category_l2);
CREATE INDEX idx_products_tbwa ON master.products(is_tbwa_client);
CREATE INDEX idx_products_sku ON master.products(sku);

-- Transaction indexes
CREATE INDEX idx_transactions_datetime ON transactions.transactions(transaction_datetime);
CREATE INDEX idx_transactions_store ON transactions.transactions(store_id);
CREATE INDEX idx_transactions_customer ON transactions.transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions.transactions(DATE(transaction_datetime));

-- Transaction items indexes
CREATE INDEX idx_items_transaction ON transactions.transaction_items(transaction_id);
CREATE INDEX idx_items_product ON transactions.transaction_items(product_id);
CREATE INDEX idx_items_handshake ON transactions.transaction_items(is_handshake);
CREATE INDEX idx_items_brand ON transactions.transaction_items(brand_name);

-- Analytics indexes
CREATE INDEX idx_handshake_datetime ON analytics.handshake_events(handshake_datetime);
CREATE INDEX idx_handshake_result ON analytics.handshake_events(handshake_result);
CREATE INDEX idx_segments_customer ON analytics.customer_segments(customer_id);
CREATE INDEX idx_performance_store_date ON analytics.store_performance(store_id, performance_date);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- 1. Transaction Summary View
CREATE VIEW analytics.transaction_summary AS
SELECT 
    t.transaction_id,
    t.transaction_datetime,
    s.store_name,
    s.store_type,
    l.region,
    l.city_municipality,
    l.barangay,
    l.poverty_incidence,
    l.urbanization_level,
    c.economic_class as customer_economic_class,
    c.age_bracket,
    t.total_amount,
    t.total_items,
    t.payment_method,
    t.is_payday_week,
    t.weather_condition
FROM transactions.transactions t
JOIN master.stores s ON t.store_id = s.store_id
JOIN master.locations l ON t.location_id = l.location_id
LEFT JOIN master.customers c ON t.customer_id = c.customer_id;

-- 2. Handshake Performance View
CREATE VIEW analytics.handshake_performance AS
SELECT 
    DATE(h.handshake_datetime) as handshake_date,
    h.requested_brand,
    h.offered_brand,
    h.handshake_result,
    s.store_name,
    s.store_economic_class,
    l.region,
    l.poverty_incidence,
    COUNT(*) as handshake_count,
    AVG(h.final_purchase_amount) as avg_purchase_amount,
    SUM(CASE WHEN h.handshake_result = 'Success' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate
FROM analytics.handshake_events h
JOIN transactions.transactions t ON h.transaction_id = t.transaction_id
JOIN master.stores s ON t.store_id = s.store_id
JOIN master.locations l ON s.location_id = l.location_id
GROUP BY 1,2,3,4,5,6,7,8;

-- 3. TBWA Brand Performance View
CREATE VIEW analytics.tbwa_brand_performance AS
SELECT 
    ti.brand_name,
    DATE(t.transaction_datetime) as transaction_date,
    s.store_economic_class,
    l.region,
    l.urbanization_level,
    COUNT(DISTINCT t.transaction_id) as transaction_count,
    SUM(ti.quantity) as units_sold,
    SUM(ti.final_amount) as total_sales,
    AVG(ti.final_amount) as avg_sale_amount,
    SUM(CASE WHEN ti.is_handshake THEN 1 ELSE 0 END) as handshake_count
FROM transactions.transaction_items ti
JOIN transactions.transactions t ON ti.transaction_id = t.transaction_id
JOIN master.stores s ON t.store_id = s.store_id
JOIN master.locations l ON s.location_id = l.location_id
JOIN master.products p ON ti.product_id = p.product_id
WHERE p.is_tbwa_client = TRUE
GROUP BY 1,2,3,4,5;

-- =====================================================
-- FUNCTIONS FOR DATA ANALYSIS
-- =====================================================

-- Calculate market basket affinity
CREATE OR REPLACE FUNCTION analytics.calculate_product_affinity(
    p_product_id UUID,
    p_days_back INTEGER DEFAULT 30
) RETURNS TABLE(
    paired_product_id UUID,
    paired_product_name TEXT,
    co_purchase_count INTEGER,
    affinity_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH base_transactions AS (
        SELECT DISTINCT transaction_id
        FROM transactions.transaction_items
        WHERE product_id = p_product_id
        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days_back
    )
    SELECT 
        ti.product_id as paired_product_id,
        ti.product_name as paired_product_name,
        COUNT(*) as co_purchase_count,
        COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM base_transactions) as affinity_score
    FROM transactions.transaction_items ti
    WHERE ti.transaction_id IN (SELECT transaction_id FROM base_transactions)
    AND ti.product_id != p_product_id
    GROUP BY ti.product_id, ti.product_name
    ORDER BY affinity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE master.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions.transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies (example - customize based on your needs)
CREATE POLICY customer_privacy ON master.customers
    FOR ALL
    TO authenticated
    USING (auth.uid() = created_by OR auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE master.locations IS 'Master table for all geographic locations with comprehensive socioeconomic data from Philippine Statistics Authority';
COMMENT ON TABLE master.stores IS 'Master table for all sari-sari stores with operational and competitive intelligence';
COMMENT ON TABLE master.customers IS 'Customer master with behavioral and demographic profiling';
COMMENT ON TABLE master.products IS 'Product master with focus on TBWA client brands and competitive landscape';
COMMENT ON TABLE transactions.transactions IS 'Core transaction table capturing all sales with contextual data';
COMMENT ON TABLE transactions.transaction_items IS 'Transaction line items with handshake detection logic';
COMMENT ON TABLE analytics.handshake_events IS 'Detailed tracking of brand handshake interactions and outcomes';

COMMENT ON COLUMN master.locations.poverty_incidence IS 'Percentage of population below poverty threshold (PSA data)';
COMMENT ON COLUMN master.stores.customer_relationship_score IS 'Strength of personal relationships with regular customers (0-1 scale)';
COMMENT ON COLUMN transactions.transaction_items.is_handshake IS 'Whether this item involved a brand handshake conversation';
COMMENT ON COLUMN analytics.handshake_events.customer_conviction_level IS 'How strongly the customer insisted on the requested brand';