-- Master Data Tables for Scout Dash Master Toggle Agent
-- These tables store distinct values for all filter dimensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create master data schema
CREATE SCHEMA IF NOT EXISTS master_data;

-- =====================================================
-- GEOGRAPHIC MASTER TABLES
-- =====================================================

-- Master Regions
CREATE TABLE IF NOT EXISTS master_data.master_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region TEXT UNIQUE NOT NULL,
    display_name TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Provinces
CREATE TABLE IF NOT EXISTS master_data.master_provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province TEXT UNIQUE NOT NULL,
    region_id UUID REFERENCES master_data.master_regions(id),
    display_name TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Cities
CREATE TABLE IF NOT EXISTS master_data.master_cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_municipality TEXT UNIQUE NOT NULL,
    province_id UUID REFERENCES master_data.master_provinces(id),
    display_name TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Barangays
CREATE TABLE IF NOT EXISTS master_data.master_barangays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barangay TEXT UNIQUE NOT NULL,
    city_id UUID REFERENCES master_data.master_cities(id),
    display_name TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STORE MASTER TABLES
-- =====================================================

-- Master Store Types
CREATE TABLE IF NOT EXISTS master_data.master_store_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_type TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Store Classes
CREATE TABLE IF NOT EXISTS master_data.master_store_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_economic_class TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Store Facilities
CREATE TABLE IF NOT EXISTS master_data.master_store_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_facilities TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT MASTER TABLES
-- =====================================================

-- Master Brands
CREATE TABLE IF NOT EXISTS master_data.master_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT UNIQUE NOT NULL,
    display_name TEXT,
    parent_company TEXT,
    is_tbwa_client BOOLEAN DEFAULT false,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Categories
CREATE TABLE IF NOT EXISTS master_data.master_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_category TEXT UNIQUE NOT NULL,
    display_name TEXT,
    parent_category TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Subcategories
CREATE TABLE IF NOT EXISTS master_data.master_subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_subcategory TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES master_data.master_categories(id),
    display_name TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master TBWA Clients
CREATE TABLE IF NOT EXISTS master_data.master_tbwa_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tbwa_client_name TEXT UNIQUE NOT NULL,
    display_name TEXT,
    industry TEXT,
    account_manager TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CUSTOMER MASTER TABLES
-- =====================================================

-- Master Customer Classes
CREATE TABLE IF NOT EXISTS master_data.master_customer_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_economic_class TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Age Groups
CREATE TABLE IF NOT EXISTS master_data.master_age_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    age_bracket TEXT UNIQUE NOT NULL,
    display_name TEXT,
    min_age INTEGER,
    max_age INTEGER,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Genders
CREATE TABLE IF NOT EXISTS master_data.master_genders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gender TEXT UNIQUE NOT NULL,
    display_name TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Shopping Frequencies
CREATE TABLE IF NOT EXISTS master_data.master_shopping_frequencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopping_frequency TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Price Sensitivities
CREATE TABLE IF NOT EXISTS master_data.master_price_sensitivities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    price_sensitivity TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRANSACTION MASTER TABLES
-- =====================================================

-- Master Payment Methods
CREATE TABLE IF NOT EXISTS master_data.master_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_method TEXT UNIQUE NOT NULL,
    display_name TEXT,
    is_digital BOOLEAN DEFAULT false,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Handshake Types
CREATE TABLE IF NOT EXISTS master_data.master_handshake_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handshake_type TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Handshake Results
CREATE TABLE IF NOT EXISTS master_data.master_handshake_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handshake_result TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TEMPORAL MASTER TABLES
-- =====================================================

-- Master Hours
CREATE TABLE IF NOT EXISTS master_data.master_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hour_of_day INTEGER UNIQUE NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
    display_name TEXT,
    period_name TEXT, -- Morning, Afternoon, Evening, Night
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Days
CREATE TABLE IF NOT EXISTS master_data.master_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER UNIQUE NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    display_name TEXT,
    day_name TEXT, -- Monday, Tuesday, etc.
    is_weekend BOOLEAN DEFAULT false,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CONTEXTUAL MASTER TABLES
-- =====================================================

-- Master Weather Conditions
CREATE TABLE IF NOT EXISTS master_data.master_weather_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weather_condition TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Poverty Levels
CREATE TABLE IF NOT EXISTS master_data.master_poverty_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poverty_level_category TEXT UNIQUE NOT NULL,
    display_name TEXT,
    min_threshold NUMERIC(5,3),
    max_threshold NUMERIC(5,3),
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Urbanization Levels
CREATE TABLE IF NOT EXISTS master_data.master_urbanization_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    urbanization_category TEXT UNIQUE NOT NULL,
    display_name TEXT,
    min_threshold NUMERIC(3,2),
    max_threshold NUMERIC(3,2),
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Geographic indexes
CREATE INDEX IF NOT EXISTS idx_master_regions_name ON master_data.master_regions(region);
CREATE INDEX IF NOT EXISTS idx_master_provinces_name ON master_data.master_provinces(province);
CREATE INDEX IF NOT EXISTS idx_master_cities_name ON master_data.master_cities(city_municipality);
CREATE INDEX IF NOT EXISTS idx_master_barangays_name ON master_data.master_barangays(barangay);

-- Store indexes
CREATE INDEX IF NOT EXISTS idx_master_store_types_name ON master_data.master_store_types(store_type);
CREATE INDEX IF NOT EXISTS idx_master_store_classes_name ON master_data.master_store_classes(store_economic_class);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_master_brands_name ON master_data.master_brands(brand);
CREATE INDEX IF NOT EXISTS idx_master_categories_name ON master_data.master_categories(product_category);
CREATE INDEX IF NOT EXISTS idx_master_subcategories_name ON master_data.master_subcategories(product_subcategory);
CREATE INDEX IF NOT EXISTS idx_master_tbwa_clients_name ON master_data.master_tbwa_clients(tbwa_client_name);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_master_customer_classes_name ON master_data.master_customer_classes(customer_economic_class);
CREATE INDEX IF NOT EXISTS idx_master_age_groups_name ON master_data.master_age_groups(age_bracket);
CREATE INDEX IF NOT EXISTS idx_master_genders_name ON master_data.master_genders(gender);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_master_payment_methods_name ON master_data.master_payment_methods(payment_method);
CREATE INDEX IF NOT EXISTS idx_master_handshake_types_name ON master_data.master_handshake_types(handshake_type);
CREATE INDEX IF NOT EXISTS idx_master_handshake_results_name ON master_data.master_handshake_results(handshake_result);

-- Temporal indexes
CREATE INDEX IF NOT EXISTS idx_master_hours_value ON master_data.master_hours(hour_of_day);
CREATE INDEX IF NOT EXISTS idx_master_days_value ON master_data.master_days(day_of_week);

-- Contextual indexes
CREATE INDEX IF NOT EXISTS idx_master_weather_name ON master_data.master_weather_conditions(weather_condition);

-- Common query indexes
CREATE INDEX IF NOT EXISTS idx_master_regions_active ON master_data.master_regions(is_active);
CREATE INDEX IF NOT EXISTS idx_master_brands_tbwa ON master_data.master_brands(is_tbwa_client);

-- =====================================================
-- FUNCTIONS FOR MASTER DATA MANAGEMENT
-- =====================================================

-- Function to create a master table for a new dimension
CREATE OR REPLACE FUNCTION create_master_table_if_not_exists(
    table_name TEXT,
    column_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'master_data' 
        AND table_name = table_name
    ) INTO table_exists;
    
    -- Create table if it doesn't exist
    IF NOT table_exists THEN
        EXECUTE format('
            CREATE TABLE master_data.%I (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                %I TEXT UNIQUE NOT NULL,
                display_name TEXT,
                sort_order INTEGER,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )', table_name, column_name);
        
        -- Create index
        EXECUTE format('
            CREATE INDEX idx_%I_%I ON master_data.%I(%I)',
            table_name, column_name, table_name, column_name);
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to get all filter options for a dimension
CREATE OR REPLACE FUNCTION get_filter_options(
    dimension_table TEXT,
    dimension_column TEXT DEFAULT NULL
) RETURNS TABLE(
    value TEXT,
    display_name TEXT,
    sort_order INTEGER
) AS $$
BEGIN
    IF dimension_column IS NULL THEN
        -- Default column name pattern
        dimension_column := REPLACE(dimension_table, 'master_', '');
    END IF;
    
    RETURN QUERY EXECUTE format('
        SELECT %I::TEXT, display_name, sort_order
        FROM master_data.%I
        WHERE is_active = true
        ORDER BY sort_order NULLS LAST, %I',
        dimension_column, dimension_table, dimension_column);
END;
$$ LANGUAGE plpgsql;

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_master_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all master tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'master_data' 
        AND table_name LIKE 'master_%'
    LOOP
        EXECUTE format('
            CREATE TRIGGER trigger_update_%I_timestamp
            BEFORE UPDATE ON master_data.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_master_data_timestamp()',
            t, t);
    END LOOP;
END $$;

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Populate temporal master tables with fixed values
INSERT INTO master_data.master_hours (hour_of_day, display_name, period_name, sort_order) VALUES
(0, '12:00 AM', 'Night', 0),
(1, '1:00 AM', 'Night', 1),
(2, '2:00 AM', 'Night', 2),
(3, '3:00 AM', 'Night', 3),
(4, '4:00 AM', 'Night', 4),
(5, '5:00 AM', 'Night', 5),
(6, '6:00 AM', 'Morning', 6),
(7, '7:00 AM', 'Morning', 7),
(8, '8:00 AM', 'Morning', 8),
(9, '9:00 AM', 'Morning', 9),
(10, '10:00 AM', 'Morning', 10),
(11, '11:00 AM', 'Morning', 11),
(12, '12:00 PM', 'Afternoon', 12),
(13, '1:00 PM', 'Afternoon', 13),
(14, '2:00 PM', 'Afternoon', 14),
(15, '3:00 PM', 'Afternoon', 15),
(16, '4:00 PM', 'Afternoon', 16),
(17, '5:00 PM', 'Afternoon', 17),
(18, '6:00 PM', 'Evening', 18),
(19, '7:00 PM', 'Evening', 19),
(20, '8:00 PM', 'Evening', 20),
(21, '9:00 PM', 'Evening', 21),
(22, '10:00 PM', 'Night', 22),
(23, '11:00 PM', 'Night', 23)
ON CONFLICT (hour_of_day) DO NOTHING;

INSERT INTO master_data.master_days (day_of_week, display_name, day_name, is_weekend, sort_order) VALUES
(0, 'Sunday', 'Sunday', true, 0),
(1, 'Monday', 'Monday', false, 1),
(2, 'Tuesday', 'Tuesday', false, 2),
(3, 'Wednesday', 'Wednesday', false, 3),
(4, 'Thursday', 'Thursday', false, 4),
(5, 'Friday', 'Friday', false, 5),
(6, 'Saturday', 'Saturday', true, 6)
ON CONFLICT (day_of_week) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA master_data IS 'Master data tables for Scout Dash filter dimensions managed by Master Toggle Agent';

COMMENT ON TABLE master_data.master_regions IS 'Master table for all geographic regions';
COMMENT ON TABLE master_data.master_brands IS 'Master table for all product brands with TBWA client identification';
COMMENT ON TABLE master_data.master_categories IS 'Master table for all product categories';
COMMENT ON TABLE master_data.master_payment_methods IS 'Master table for all payment methods';
COMMENT ON TABLE master_data.master_handshake_types IS 'Master table for all handshake interaction types';

COMMENT ON FUNCTION create_master_table_if_not_exists IS 'Creates a new master table for a dimension if it does not exist';
COMMENT ON FUNCTION get_filter_options IS 'Returns all active filter options for a dimension with display names and sort order';