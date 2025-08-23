-- Test Stock Snapshot Functionality
-- Run this in Supabase SQL Editor to test

-- 1. Check if we have any products with stock
SELECT 
    id,
    name,
    stock_quantity,
    created_at
FROM product_master 
WHERE stock_quantity > 0
LIMIT 3;

-- 2. Check if the trigger function exists and is working
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'reduce_stock_on_pos_order_insert'
    AND routine_schema = 'public';

-- 3. Check if the trigger is properly attached
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pos_orders'
    AND trigger_name = 'trg_reduce_stock_on_insert';

-- 4. Check foreign key constraint
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'pos_order_items'
    AND kcu.column_name = 'pos_order_id';

-- 5. Check if record_stock_transaction function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'record_stock_transaction'
    AND routine_schema = 'public';

-- 6. TEST: Create a test order to verify stock snapshot functionality
-- (Uncomment the lines below to test)

/*
-- Get a product ID to test with
DO $$
DECLARE
    test_product_id UUID;
    test_order_id UUID;
    initial_stock INTEGER;
    final_stock INTEGER;
BEGIN
    -- Get a product with stock
    SELECT id, stock_quantity INTO test_product_id, initial_stock
    FROM product_master 
    WHERE stock_quantity > 0 
    LIMIT 1;
    
    IF test_product_id IS NULL THEN
        RAISE NOTICE 'No products with stock found for testing';
        RETURN;
    END IF;
    
    -- Generate test order ID
    test_order_id := gen_random_uuid();
    
    RAISE NOTICE 'Testing with product ID: %, initial stock: %', test_product_id, initial_stock;
    
    -- Create test order
    INSERT INTO pos_orders (
        id,
        client_name,
        total_amount,
        services,
        source,
        stock_snapshot,
        created_at
    ) VALUES (
        test_order_id,
        'Test Client',
        100,
        jsonb_build_array(
            jsonb_build_object(
                'product_id', test_product_id,
                'type', 'product',
                'quantity', 1,
                'price', 100,
                'name', 'Test Product'
            )
        ),
        'pos',
        '{}',
        NOW()
    );
    
    -- Check final stock
    SELECT stock_quantity INTO final_stock
    FROM product_master 
    WHERE id = test_product_id;
    
    RAISE NOTICE 'Order created with ID: %', test_order_id;
    RAISE NOTICE 'Stock changed from % to %', initial_stock, final_stock;
    
    -- Check stock snapshot
    SELECT stock_snapshot FROM pos_orders WHERE id = test_order_id;
    
    -- Clean up test order
    DELETE FROM pos_orders WHERE id = test_order_id;
    
    RAISE NOTICE 'Test completed successfully!';
END $$;
*/
