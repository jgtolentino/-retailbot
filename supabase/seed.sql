-- Simple seed data for local development
-- No foreign key dependencies

-- Sample consumer profiles (without user_id dependency)
INSERT INTO consumer_profiles (email, name, age, gender, location, income_bracket, lifestyle_segment, preferences)
VALUES 
    ('john.doe@email.com', 'John Doe', 28, 'male', 'Makati, Philippines', '75k-100k', 'urban_professional', '{"preferred_categories": ["Food & Beverage", "Technology"]}'),
    ('jane.smith@email.com', 'Jane Smith', 34, 'female', 'BGC, Philippines', '100k-150k', 'luxury_consumer', '{"preferred_categories": ["Fashion", "Beauty"]}'),
    ('mike.jones@email.com', 'Mike Jones', 22, 'male', 'Quezon City, Philippines', '25k-50k', 'budget_conscious', '{"preferred_categories": ["Food & Beverage", "Entertainment"]}')
ON CONFLICT (email) DO NOTHING;

-- Sample product mix
INSERT INTO product_mix (product_id, product_name, category, subcategory, brand, price, cost, margin, value, volume, popularity_score, seasonality_factor, inventory_level, supplier, launch_date, status)
VALUES 
    ('FOOD001', 'Artisan Coffee Blend', 'Food & Beverage', 'Coffee', 'Local Roasters', 299.00, 180.00, 39.8, 25000.00, 150, 4.6, 1.2, 500, 'Coffee Suppliers Inc', '2024-01-15', 'active'),
    ('TECH001', 'Wireless Earbuds Pro', 'Technology', 'Audio', 'SoundWave', 2499.00, 1200.00, 52.0, 180000.00, 80, 4.8, 1.0, 150, 'Tech Distributors', '2024-03-10', 'active'),
    ('FASH001', 'Designer Handbag', 'Fashion', 'Accessories', 'Luxe Brand', 8999.00, 3500.00, 61.1, 120000.00, 25, 4.7, 1.5, 75, 'Fashion Imports', '2024-04-20', 'active')
ON CONFLICT (product_id) DO NOTHING;

-- Add some simple transactions
WITH consumer_ids AS (
    SELECT id FROM consumer_profiles LIMIT 3
)
INSERT INTO transactions (consumer_id, transaction_id, amount, category, date, payment_method, status)
SELECT 
    id,
    'TXN-' || gen_random_uuid()::text,
    (RANDOM() * 1000 + 100)::DECIMAL(10,2),
    'Food & Beverage',
    CURRENT_DATE,
    'credit_card',
    'completed'
FROM consumer_ids;