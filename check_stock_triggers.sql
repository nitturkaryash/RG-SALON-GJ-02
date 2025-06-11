-- Check what stock-related triggers are currently active
-- This will help identify why stock is being deducted twice

SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE (trigger_name LIKE '%stock%' OR trigger_name LIKE '%sale%' OR trigger_name LIKE '%inventory%')
ORDER BY event_object_table, trigger_name;

-- Check for stock-related functions
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines
WHERE (routine_name LIKE '%stock%' OR routine_name LIKE '%sale%' OR routine_name LIKE '%inventory%') 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Check for any triggers on sales table specifically
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'sales'
ORDER BY trigger_name;

-- Check for any triggers on pos_order_items table
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'pos_order_items'
ORDER BY trigger_name; 