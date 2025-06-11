-- ======================================================
-- COMPREHENSIVE TRIGGER INSPECTION QUERIES
-- ======================================================
-- Run these queries to see all existing triggers and their functions

-- ======================================================
-- 1. LIST ALL TRIGGERS IN THE DATABASE
-- ======================================================
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
ORDER BY n.nspname, c.relname, t.tgname;

-- ======================================================
-- 2. LIST ALL TRIGGER FUNCTIONS
-- ======================================================
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    l.lanname as language
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE p.prorettype = 'trigger'::regtype
ORDER BY n.nspname, p.proname;

-- ======================================================
-- 3. DETAILED VIEW OF INVENTORY-RELATED TRIGGERS
-- ======================================================
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name,
    CASE t.tgtype & 66
        WHEN 2 THEN 'BEFORE'
        WHEN 64 THEN 'AFTER'
        ELSE 'INSTEAD OF'
    END AS trigger_timing,
    CASE t.tgtype & 28
        WHEN 4 THEN 'INSERT'
        WHEN 8 THEN 'DELETE'
        WHEN 16 THEN 'UPDATE'
        WHEN 12 THEN 'INSERT OR DELETE'
        WHEN 20 THEN 'INSERT OR UPDATE'
        WHEN 24 THEN 'DELETE OR UPDATE'
        WHEN 28 THEN 'INSERT OR DELETE OR UPDATE'
    END AS trigger_event,
    t.tgenabled AS enabled,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN (
    'inventory_purchases', 
    'inventory_sales', 
    'inventory_consumption',
    'products',
    'inventory_products',
    'pos_orders',
    'pos_order_items',
    'sales'
)
AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- ======================================================
-- 4. CHECK SPECIFIC PROBLEMATIC TRIGGERS
-- ======================================================
-- Check for triggers that might be causing inventory issues

-- Triggers on inventory_purchases table
SELECT 
    'inventory_purchases' as table_name,
    t.tgname as trigger_name,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'inventory_purchases'
AND NOT t.tgisinternal

UNION ALL

-- Triggers on products table
SELECT 
    'products' as table_name,
    t.tgname as trigger_name,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'products'
AND NOT t.tgisinternal

UNION ALL

-- Triggers on pos_orders table
SELECT 
    'pos_orders' as table_name,
    t.tgname as trigger_name,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'pos_orders'
AND NOT t.tgisinternal;

-- ======================================================
-- 5. CHECK TRIGGER FUNCTION DEFINITIONS
-- ======================================================
-- Get the actual code of trigger functions
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prorettype = 'trigger'::regtype
AND (
    p.proname LIKE '%stock%'
    OR p.proname LIKE '%inventory%'
    OR p.proname LIKE '%product%'
    OR p.proname LIKE '%purchase%'
)
ORDER BY p.proname;

-- ======================================================
-- 6. CHECK FOR DUPLICATE OR CONFLICTING TRIGGERS
-- ======================================================
-- Find triggers that might be acting on the same events
SELECT 
    c.relname as table_name,
    COUNT(*) as trigger_count,
    STRING_AGG(t.tgname, ', ') as trigger_names
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('inventory_purchases', 'products', 'pos_orders', 'pos_order_items')
AND NOT t.tgisinternal
GROUP BY c.relname
HAVING COUNT(*) > 1;

-- ======================================================
-- 7. CHECK TABLE STRUCTURES
-- ======================================================
-- Verify which tables have stock_quantity columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('products', 'inventory_products', 'product_master')
AND column_name LIKE '%stock%'
ORDER BY table_name, column_name;

-- ======================================================
-- 8. SIMPLE TRIGGER SUMMARY
-- ======================================================
-- Quick overview of all triggers
SELECT 
    c.relname AS table_name,
    t.tgname AS trigger_name,
    p.proname AS function_name,
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 64 = 64 THEN 'AFTER'
        ELSE 'INSTEAD OF'
    END AS timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'MULTIPLE'
    END AS event_type
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
AND (
    c.relname LIKE '%inventory%' 
    OR c.relname LIKE '%product%' 
    OR c.relname = 'pos_orders'
    OR c.relname = 'pos_order_items'
    OR c.relname = 'sales'
)
ORDER BY c.relname, t.tgname; 