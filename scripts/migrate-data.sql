-- Migrate existing flat transactions to normalized tables
-- Run this in Supabase SQL Editor

-- First, check if we have data to migrate
SELECT COUNT(*) as total_transactions FROM transactions;

-- Run the migration (this is safe - it won't duplicate data)
SELECT migrate_transactions_to_normalized();

-- Verify migration results
SELECT 
    (SELECT COUNT(*) FROM stores) as total_stores,
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM transactions_normalized) as total_normalized_transactions;

-- Test the backward-compatible view
SELECT * FROM transaction_summary LIMIT 10;