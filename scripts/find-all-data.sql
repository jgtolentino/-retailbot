-- Find all tables in the database and check for data
-- Run this in Supabase SQL Editor

-- 1. List all tables in public schema
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Get row counts for all tables
CREATE OR REPLACE FUNCTION get_all_table_counts()
RETURNS TABLE(table_name text, row_count bigint) AS $$
DECLARE
    r record;
    sql text;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
    LOOP
        sql := format('SELECT %L, COUNT(*) FROM %I', r.tablename, r.tablename);
        RETURN QUERY EXECUTE sql;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT * FROM get_all_table_counts() WHERE row_count > 0;

-- 3. Check for any schema with data
SELECT 
    n.nspname as schema_name,
    COUNT(c.relname) as table_count
FROM pg_namespace n
JOIN pg_class c ON c.relnamespace = n.oid
WHERE c.relkind = 'r' 
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
GROUP BY n.nspname
ORDER BY table_count DESC;