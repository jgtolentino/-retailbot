# Apply Master Data Tables Schema

The Master Toggle Agent requires master data tables for storing filter dimensions.

## Apply Schema Steps

1. Go to the [Supabase SQL Editor](https://supabase.com/dashboard/project/cxzllzyxwpyptfretryc/sql/new)
2. Copy the contents of `schema/master_data_tables.sql`
3. Paste and run in the SQL editor

## What This Creates

The schema creates a `master_data` schema with tables for:

### Geographic Dimensions
- `master_regions`
- `master_provinces` 
- `master_cities`
- `master_barangays`

### Store Dimensions
- `master_store_types`
- `master_store_classes`
- `master_store_facilities`

### Product Dimensions
- `master_brands`
- `master_categories`
- `master_subcategories`
- `master_tbwa_clients`

### Customer Dimensions
- `master_customer_classes`
- `master_age_groups`
- `master_genders`
- `master_shopping_frequencies`
- `master_price_sensitivities`

### Transaction Dimensions
- `master_payment_methods`
- `master_handshake_types`
- `master_handshake_results`

### Temporal Dimensions
- `master_hours` (pre-populated with 0-23)
- `master_days` (pre-populated with days of week)

### Contextual Dimensions
- `master_weather_conditions`
- `master_poverty_levels`
- `master_urbanization_levels`

## Verification

After applying, verify the schema was created:

```sql
-- Check if schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'master_data';

-- List all master tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'master_data'
ORDER BY table_name;
```