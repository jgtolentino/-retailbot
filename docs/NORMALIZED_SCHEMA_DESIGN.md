# Normalized Schema Design for Scout Databank

## Overview
The original `transactions` table with 50+ columns has been normalized into 9 related tables following database normalization principles (3NF).

## Schema Structure

### 1. **stores** - Store/Location Master Data
- `store_id` (UUID) - Primary key
- `external_store_id` (TEXT) - Original store ID from source
- Store details: name, type, location hierarchy (barangay → city → province → region)
- Geographic coordinates (lat/long)
- `economic_class` - Store area economic classification

### 2. **customers** - Customer Demographics
- `customer_id` (UUID) - Primary key
- `customer_type`, `gender`, `age_range`
- `loyalty_status` - Customer loyalty program status
- `language` - Preferred language

### 3. **products** - Product Catalog
- `product_id` (UUID) - Primary key
- `sku` (TEXT) - Unique product identifier
- Product details: name, brand, category, subcategory
- `is_tbwa_client` - Flag for TBWA client products

### 4. **campaigns** - Marketing Campaigns
- `campaign_id` (UUID) - Primary key
- Campaign details: name, dates
- Links to track campaign effectiveness

### 5. **transactions_normalized** - Core Transaction Data
- `transaction_id` (UUID) - Primary key
- Foreign keys: `store_id`, `customer_id`
- Transaction details: timestamp, values, payment method
- Summary data: duration, total units

### 6. **transaction_items** - Line Items/Products in Transaction
- `item_id` (UUID) - Primary key
- Links to: `transaction_id`, `product_id`
- Item details: quantity, price, substitution info
- Supports multiple items per transaction

### 7. **transaction_context** - Environmental Context
- `context_id` (UUID) - Primary key
- Links to: `transaction_id`
- Contextual data: day/time, weather, payday status
- Store owner influence factors

### 8. **transaction_interactions** - Customer Interaction Data
- `interaction_id` (UUID) - Primary key
- Links to: `transaction_id`
- Interaction details: suggestions, transcripts, sentiment
- Video analysis: objects detected, handshake metrics

### 9. **transaction_campaigns** - Campaign Associations
- Links transactions to campaigns
- Tracks campaign influence on purchases

## Benefits of Normalization

1. **Eliminates Redundancy**
   - Store information stored once, not repeated for every transaction
   - Customer profiles maintained separately
   - Product catalog centralized

2. **Data Integrity**
   - Foreign key constraints ensure referential integrity
   - Consistent data types and constraints
   - No conflicting or duplicate data

3. **Query Performance**
   - Targeted indexes on foreign keys and common query fields
   - Smaller tables = faster scans
   - Efficient joins on indexed columns

4. **Flexibility**
   - Easy to add new attributes to any entity
   - Can track multiple items per transaction
   - Supports complex relationships (many-to-many campaigns)

5. **Maintenance**
   - Update store info in one place
   - Product changes don't affect historical transactions
   - Clear separation of concerns

## Migration Strategy

The included migration function (`migrate_transactions_to_normalized()`) will:
1. Read existing flat transactions
2. Extract and deduplicate entities (stores, customers, products)
3. Create normalized transaction records
4. Preserve all relationships and data

## Views for Backward Compatibility

The `transaction_summary` view provides a denormalized view similar to the original structure, making it easy to:
- Support existing queries
- Gradually migrate applications
- Provide familiar data structure while using normalized storage

## Realtime Support

All tables have Realtime enabled, allowing:
- Live updates on new transactions
- Real-time inventory changes
- Dynamic dashboard updates
- WebSocket subscriptions for all entities