-- Check what the trigger functions actually do
-- This will help us understand if they're causing duplicate stock updates

-- Get the source code of the record_order_item_stock_change function
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'record_order_item_stock_change'
  AND routine_type = 'FUNCTION';

-- Get the source code of the restore_stock_on_order_item_delete function  
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'restore_stock_on_order_item_delete'
  AND routine_type = 'FUNCTION';

-- Also check if there are any other stock-related functions we missed
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE (routine_definition ILIKE '%stock_quantity%' OR routine_definition ILIKE '%UPDATE products%')
  AND routine_type = 'FUNCTION'
ORDER BY routine_name; 