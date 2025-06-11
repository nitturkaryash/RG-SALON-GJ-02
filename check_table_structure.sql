-- ======================================================
-- TABLE STRUCTURE INVESTIGATION
-- ======================================================

-- 1. CHECK WHICH TABLES EXIST AND THEIR TYPE
SELECT 
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_name IN ('products', 'product_master', 'inventory_products')
ORDER BY table_name;

-- 2. CHECK STOCK COLUMNS IN ALL PRODUCT TABLES
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('products', 'product_master', 'inventory_products')
AND column_name LIKE '%stock%'
ORDER BY table_name, column_name;

-- 3. CHECK IF THESE ARE VIEWS OR ACTUAL TABLES
SELECT 
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename IN ('products', 'product_master', 'inventory_products', 'sales', 'inventory_purchases');

-- 4. CHECK FOR VIEWS
SELECT 
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_name IN ('products', 'product_master', 'inventory_products', 'sales', 'inventory_purchases');

-- 5. CHECK CONFLICTING SALES TRIGGERS
SELECT 
    t.tgname AS trigger_name,
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
    END AS trigger_event,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'sales'
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 6. CHECK THE INVENTORY_PURCHASES TRIGGER FUNCTION
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE p.proname = 'fn_insert_purchase_history_stock';

-- 7. CHECK PRODUCT_MASTER COLUMNS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_master'
ORDER BY ordinal_position; 