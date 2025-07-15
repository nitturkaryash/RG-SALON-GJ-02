-- ===============================================
-- EXAMPLE: USING THE AGGREGATED ORDER SYSTEM
-- ===============================================
-- This file demonstrates how to use the new aggregation system 
-- with your existing batch import data

-- First, load the migration to add aggregation functions
-- Run this in your Supabase SQL editor:
-- \i supabase/migrations/20250105000000_add_order_aggregation_system.sql

-- ===============================================
-- OPTION 1: Use the upsert function for new imports
-- ===============================================

-- Example: Import Tarun Vatiani's services using upsert function
-- This will automatically aggregate multiple services into one order

-- First service
SELECT upsert_aggregated_order(
    'Tarun Vatiani',                    -- client_name
    'Tarun Vatiani',                    -- customer_name  
    'Vandan Gohil',                     -- stylist_name
    '[{"name":"Hair Cut With Senior Hairdresser (Male)","category":"HAIR - Hair Cut","stylist":"Vandan Gohil","quantity":1,"unitPrice":1000,"discount":0,"taxPercent":18,"subtotal":1000,"netAmount":1000,"taxAmount":180,"totalAmount":1180}]'::jsonb,  -- services
    '[{"method":"gpay","amount":1180}]'::jsonb,  -- payments
    1000,                               -- subtotal
    180,                                -- tax
    0,                                  -- discount
    1180,                               -- total
    'gpay',                             -- payment_method
    'completed',                        -- status
    'sale',                             -- type
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,  -- user_id
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,  -- tenant_id
    '2025-03-31T18:38:50.000Z'::timestamptz         -- created_at
);

-- Second service (will be aggregated with the first)
SELECT upsert_aggregated_order(
    'Tarun Vatiani',                    -- client_name (same as above)
    'Tarun Vatiani',                    -- customer_name
    'Vandan Gohil',                     -- stylist_name
    '[{"name":"Beard Trim","category":"HAIR - Beard Trim","stylist":"Vandan Gohil","quantity":1,"unitPrice":400,"discount":0,"taxPercent":18,"subtotal":400,"netAmount":400,"taxAmount":72,"totalAmount":472}]'::jsonb,  -- services
    '[{"method":"gpay","amount":472}]'::jsonb,   -- payments
    400,                                -- subtotal
    72,                                 -- tax
    0,                                  -- discount
    472,                                -- total
    'gpay',                             -- payment_method
    'completed',                        -- status
    'sale',                             -- type
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,  -- user_id
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,  -- tenant_id
    '2025-03-31T18:38:50.000Z'::timestamptz         -- created_at (same date)
);

-- Result: Only ONE order for Tarun Vatiani with:
-- - Both services combined in the services array
-- - Aggregated payment: gpay: 1652 (1180 + 472)
-- - Total: 1652, Subtotal: 1400, Tax: 252, Discount: 0

-- ===============================================
-- OPTION 2: Clean up existing duplicate orders
-- ===============================================

-- If you already have duplicate orders in your database, 
-- use this function to merge them:

SELECT merge_duplicate_orders_by_date();

-- This will:
-- 1. Find all groups of orders with same client_name and date
-- 2. Merge them into single orders
-- 3. Combine services, payments, and totals
-- 4. Delete the duplicate entries

-- ===============================================
-- OPTION 3: Enable automatic aggregation trigger
-- ===============================================

-- If you want ALL future INSERT operations to automatically aggregate,
-- run this (CAUTION: This affects all inserts):

/*
DROP TRIGGER IF EXISTS trigger_aggregate_orders ON pos_orders;
CREATE TRIGGER trigger_aggregate_orders
    BEFORE INSERT ON pos_orders
    FOR EACH ROW
    EXECUTE FUNCTION aggregate_orders_by_client_and_date();
*/

-- With this trigger enabled, your existing INSERT statements will
-- automatically aggregate by client name and date

-- ===============================================
-- CONVERTING YOUR EXISTING BATCH FILES
-- ===============================================

-- Here's how to convert your batch_001_invoices_1_to_10.sql file:

-- BEFORE (creates separate orders):
/*
INSERT INTO pos_orders (...) VALUES (..., 'Tarun Vatiani', ..., haircut_service, ...);
INSERT INTO pos_orders (...) VALUES (..., 'Tarun Vatiani', ..., beard_trim_service, ...);
*/

-- AFTER (using upsert - creates one aggregated order):
/*
SELECT upsert_aggregated_order('Tarun Vatiani', ..., haircut_service, ...);
SELECT upsert_aggregated_order('Tarun Vatiani', ..., beard_trim_service, ...);
*/

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================

-- Check aggregated orders
SELECT 
    client_name,
    DATE(created_at) as order_date,
    stylist_name,
    jsonb_array_length(services) as service_count,
    jsonb_array_length(payments) as payment_count,
    subtotal,
    tax,
    discount,
    total_amount,
    payment_method
FROM pos_orders 
WHERE client_name = 'Tarun Vatiani'
ORDER BY created_at;

-- Check for remaining duplicates
SELECT 
    client_name,
    DATE(created_at) as order_date,
    COUNT(*) as order_count
FROM pos_orders 
GROUP BY client_name, DATE(created_at)
HAVING COUNT(*) > 1
ORDER BY order_count DESC;

-- Summary by date
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    COUNT(DISTINCT client_name) as unique_clients,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM pos_orders 
GROUP BY DATE(created_at)
ORDER BY order_date;

-- ===============================================
-- FRONTEND COMPATIBILITY
-- ===============================================

-- The aggregated orders are fully compatible with your existing 
-- Orders.tsx component because:

-- 1. The aggregatedOrders logic already handles multiple services
-- 2. Services are combined in the services JSONB array
-- 3. Payments are aggregated in the payments JSONB array
-- 4. Stylist names are combined (e.g., "Vandan Gohil, Another Stylist")
-- 5. All totals are correctly calculated

-- The frontend will display:
-- - Single row for each client per date
-- - Combined services in the "Items" column
-- - Aggregated payment methods
-- - Correct totals

-- ===============================================
-- PERFORMANCE CONSIDERATIONS
-- ===============================================

-- 1. The upsert function is more efficient than triggers for batch imports
-- 2. The merge function can be run periodically to clean up duplicates
-- 3. Consider adding an index for faster aggregation:

CREATE INDEX IF NOT EXISTS idx_pos_orders_client_date 
ON pos_orders(client_name, DATE(created_at));

-- ===============================================
-- MIGRATION STRATEGY
-- ===============================================

-- Recommended approach:
-- 1. Run the migration to add the functions
-- 2. Use merge_duplicate_orders_by_date() to clean existing data
-- 3. Use upsert_aggregated_order() for all new imports
-- 4. Optionally enable the trigger for automatic aggregation

-- This ensures:
-- - Clean data with no duplicates
-- - Consistent order structure
-- - Frontend compatibility
-- - Better performance and analytics 