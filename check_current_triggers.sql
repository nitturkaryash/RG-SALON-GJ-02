-- Check what triggers currently exist related to inventory
-- This will help verify if tr_inventory_purchases_insert is causing the issue

-- Check if the trigger exists using information_schema
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%inventory%' OR trigger_name LIKE '%purchase%'
ORDER BY event_object_table, trigger_name;

-- Check if the function exists
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines
WHERE routine_name LIKE '%purchase%' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Check recent entries in inventory_purchases to see transaction_type values
SELECT 
    purchase_id,
    date,
    product_name,
    transaction_type,
    purchase_invoice_number,
    "Vendor",
    created_at
FROM inventory_purchases 
ORDER BY created_at DESC 
LIMIT 10; 