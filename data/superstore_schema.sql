-- Scout Retail Dashboard - Superstore Schema
-- Production-ready schema for retail analytics and KPI tracking

-- Drop existing tables if they exist
DROP TABLE IF EXISTS superstore_orders CASCADE;
DROP TABLE IF EXISTS superstore_customers CASCADE;
DROP TABLE IF EXISTS superstore_products CASCADE;
DROP TABLE IF EXISTS superstore_regions CASCADE;
DROP TABLE IF EXISTS superstore_segments CASCADE;
DROP TABLE IF EXISTS superstore_categories CASCADE;

-- Create core dimension tables
CREATE TABLE superstore_regions (
    id SERIAL PRIMARY KEY,
    region_name VARCHAR(50) NOT NULL UNIQUE,
    region_code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE superstore_segments (
    id SERIAL PRIMARY KEY,
    segment_name VARCHAR(50) NOT NULL UNIQUE,
    segment_code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE superstore_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE superstore_customers (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    segment_id INTEGER REFERENCES superstore_segments(id),
    region_id INTEGER REFERENCES superstore_regions(id),
    state VARCHAR(50),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE superstore_products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES superstore_categories(id),
    sub_category VARCHAR(100),
    unit_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create fact table for orders
CREATE TABLE superstore_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    order_date DATE NOT NULL,
    customer_id INTEGER REFERENCES superstore_customers(id),
    product_id INTEGER REFERENCES superstore_products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,4) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    revenue DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount)) STORED,
    profit DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orders_date ON superstore_orders(order_date);
CREATE INDEX idx_orders_customer ON superstore_orders(customer_id);
CREATE INDEX idx_orders_product ON superstore_orders(product_id);
CREATE INDEX idx_orders_revenue ON superstore_orders(revenue);
CREATE INDEX idx_customers_segment ON superstore_customers(segment_id);
CREATE INDEX idx_customers_region ON superstore_customers(region_id);
CREATE INDEX idx_products_category ON superstore_products(category_id);

-- Enable RLS
ALTER TABLE superstore_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE superstore_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE superstore_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE superstore_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE superstore_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE superstore_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access" ON superstore_orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON superstore_customers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON superstore_products FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON superstore_regions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON superstore_segments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON superstore_categories FOR SELECT TO anon USING (true);

-- Insert reference data
INSERT INTO superstore_regions (region_name, region_code) VALUES
    ('West', 'WEST'),
    ('East', 'EAST'),
    ('Central', 'CENTRAL'),
    ('South', 'SOUTH');

INSERT INTO superstore_segments (segment_name, segment_code, description) VALUES
    ('Consumer', 'CONS', 'Individual consumers and households'),
    ('Corporate', 'CORP', 'Large corporate clients'),
    ('Home Office', 'HOME', 'Small business and home office customers');

INSERT INTO superstore_categories (category_name, category_code, description) VALUES
    ('Technology', 'TECH', 'Computers, phones, and tech accessories'),
    ('Furniture', 'FURN', 'Office furniture and home furnishings'),
    ('Office Supplies', 'SUPP', 'Stationery, supplies, and office materials');

-- Insert sample customers
INSERT INTO superstore_customers (customer_id, customer_name, segment_id, region_id, state, city, postal_code)
SELECT 
    'CUST-' || LPAD(i::TEXT, 6, '0'),
    'Customer ' || i,
    (i % 3) + 1, -- Cycle through segments
    (i % 4) + 1, -- Cycle through regions
    CASE (i % 4)
        WHEN 0 THEN 'California'
        WHEN 1 THEN 'Texas'
        WHEN 2 THEN 'New York'
        ELSE 'Florida'
    END,
    CASE (i % 4)
        WHEN 0 THEN 'Los Angeles'
        WHEN 1 THEN 'Houston'
        WHEN 2 THEN 'New York'
        ELSE 'Miami'
    END,
    LPAD((90000 + i)::TEXT, 5, '0')
FROM generate_series(1, 100) i;

-- Insert sample products
INSERT INTO superstore_products (product_id, product_name, category_id, sub_category, unit_price)
SELECT 
    'PROD-' || LPAD(i::TEXT, 6, '0'),
    CASE (i % 3)
        WHEN 0 THEN 'Tech Product ' || i
        WHEN 1 THEN 'Furniture Item ' || i
        ELSE 'Office Supply ' || i
    END,
    (i % 3) + 1,
    CASE (i % 3)
        WHEN 0 THEN 'Electronics'
        WHEN 1 THEN 'Chairs'
        ELSE 'Paper'
    END,
    (random() * 500 + 50)::DECIMAL(10,2)
FROM generate_series(1, 200) i;

-- Insert sample orders (2 years of data)
INSERT INTO superstore_orders (order_id, order_date, customer_id, product_id, quantity, unit_price, discount, shipping_cost, profit)
SELECT 
    'ORD-' || LPAD(i::TEXT, 8, '0'),
    CURRENT_DATE - (random() * 730)::INTEGER, -- Random date within last 2 years
    (random() * 100 + 1)::INTEGER, -- Random customer
    (random() * 200 + 1)::INTEGER, -- Random product
    (random() * 10 + 1)::INTEGER, -- Random quantity 1-10
    (random() * 500 + 50)::DECIMAL(10,2), -- Random unit price
    (random() * 0.3)::DECIMAL(5,4), -- Random discount 0-30%
    (random() * 50 + 5)::DECIMAL(10,2), -- Random shipping cost
    (random() * 200 + 20)::DECIMAL(10,2) -- Random profit
FROM generate_series(1, 5000) i;

-- Create materialized views for performance
CREATE MATERIALIZED VIEW superstore_kpi_summary AS
SELECT 
    DATE_TRUNC('month', o.order_date) as month,
    r.region_name,
    s.segment_name,
    c.category_name,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    SUM(o.quantity) as total_items_sold,
    SUM(o.revenue) as total_revenue,
    SUM(o.profit) as total_profit,
    AVG(o.revenue) as avg_order_value,
    SUM(o.profit) / NULLIF(SUM(o.revenue), 0) as profit_margin
FROM superstore_orders o
JOIN superstore_customers cust ON o.customer_id = cust.id
JOIN superstore_products prod ON o.product_id = prod.id
JOIN superstore_regions r ON cust.region_id = r.id
JOIN superstore_segments s ON cust.segment_id = s.id
JOIN superstore_categories c ON prod.category_id = c.id
GROUP BY DATE_TRUNC('month', o.order_date), r.region_name, s.segment_name, c.category_name;

-- Create daily revenue trends view
CREATE MATERIALIZED VIEW superstore_daily_trends AS
SELECT 
    o.order_date,
    COUNT(DISTINCT o.order_id) as daily_orders,
    SUM(o.revenue) as daily_revenue,
    SUM(o.profit) as daily_profit,
    AVG(o.revenue) as avg_order_value
FROM superstore_orders o
WHERE o.order_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY o.order_date
ORDER BY o.order_date;

-- Create customer analytics view
CREATE MATERIALIZED VIEW superstore_customer_analytics AS
SELECT 
    cust.customer_id,
    cust.customer_name,
    r.region_name,
    s.segment_name,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.revenue) as total_revenue,
    SUM(o.profit) as total_profit,
    AVG(o.revenue) as avg_order_value,
    MAX(o.order_date) as last_order_date,
    MIN(o.order_date) as first_order_date
FROM superstore_customers cust
LEFT JOIN superstore_orders o ON cust.id = o.customer_id
LEFT JOIN superstore_regions r ON cust.region_id = r.id
LEFT JOIN superstore_segments s ON cust.segment_id = s.id
GROUP BY cust.customer_id, cust.customer_name, r.region_name, s.segment_name
ORDER BY total_revenue DESC;

-- Create state performance view
CREATE MATERIALIZED VIEW superstore_state_performance AS
SELECT 
    cust.state,
    r.region_name,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.revenue) as total_revenue,
    SUM(o.profit) as total_profit,
    COUNT(DISTINCT cust.id) as unique_customers,
    AVG(o.revenue) as avg_order_value
FROM superstore_customers cust
LEFT JOIN superstore_orders o ON cust.id = o.customer_id
LEFT JOIN superstore_regions r ON cust.region_id = r.id
GROUP BY cust.state, r.region_name
ORDER BY total_revenue DESC;

-- Create indexes on materialized views
CREATE INDEX idx_kpi_summary_month ON superstore_kpi_summary(month);
CREATE INDEX idx_daily_trends_date ON superstore_daily_trends(order_date);
CREATE INDEX idx_customer_analytics_revenue ON superstore_customer_analytics(total_revenue);
CREATE INDEX idx_state_performance_revenue ON superstore_state_performance(total_revenue);

-- Refresh materialized views
REFRESH MATERIALIZED VIEW superstore_kpi_summary;
REFRESH MATERIALIZED VIEW superstore_daily_trends;
REFRESH MATERIALIZED VIEW superstore_customer_analytics;
REFRESH MATERIALIZED VIEW superstore_state_performance;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE superstore_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE superstore_customers;
ALTER PUBLICATION supabase_realtime ADD TABLE superstore_products;

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_superstore_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW superstore_kpi_summary;
    REFRESH MATERIALIZED VIEW superstore_daily_trends;
    REFRESH MATERIALIZED VIEW superstore_customer_analytics;
    REFRESH MATERIALIZED VIEW superstore_state_performance;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function for auto-refresh (optional)
CREATE OR REPLACE FUNCTION auto_refresh_superstore_views()
RETURNS trigger AS $$
BEGIN
    -- Only refresh if it's been more than 5 minutes since last refresh
    IF (SELECT MAX(last_refresh) FROM pg_stat_user_tables WHERE relname LIKE 'superstore_%') < NOW() - INTERVAL '5 minutes' THEN
        PERFORM refresh_superstore_views();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verification queries
SELECT 'Superstore schema setup completed successfully!' as status;
SELECT 'Total orders: ' || COUNT(*) as order_count FROM superstore_orders;
SELECT 'Total customers: ' || COUNT(*) as customer_count FROM superstore_customers;
SELECT 'Total products: ' || COUNT(*) as product_count FROM superstore_products;
SELECT 'Total revenue: $' || ROUND(SUM(revenue), 2) as total_revenue FROM superstore_orders;