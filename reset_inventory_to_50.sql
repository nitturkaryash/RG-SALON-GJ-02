-- ===============================================
-- RESET INVENTORY SYSTEM TO 50 QUANTITY
-- This script will:
-- 1. Reset all product stock to 50
-- 2. Delete all POS orders
-- 3. Clear all stock transactions
-- 4. Clear inventory data
-- ===============================================

-- Step 1: Reset all product stock quantities to 50
UPDATE product_master 
SET stock_quantity = 50, 
    updated_at = NOW()
WHERE stock_quantity IS NOT NULL;

-- Verify the update
SELECT COUNT(*) as total_products_updated 
FROM product_master 
WHERE stock_quantity = 50;

-- Step 2: Delete all POS orders and related data
DELETE FROM pos_orders;

-- Step 3: Clear all product stock transactions
DELETE FROM product_stock_transactions;

-- Step 4: Clear inventory consumption data
DELETE FROM inventory_consumption;

-- Step 5: Clear inventory sales data  
DELETE FROM inventory_sales;

-- Step 6: Clear purchase history with stock (if exists)
DELETE FROM purchase_history_with_stock;

-- Step 7: Reset balance stock to match product stock
-- Update balance_stock table to reflect the reset quantities
UPDATE balance_stock 
SET qty = 50,
    balance_qty = 50,
    closing_stock = 50,
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM product_master pm 
    WHERE pm.id = balance_stock.product_id
);

-- Step 8: Insert balance stock records for products that don't have them
INSERT INTO balance_stock (
    id,
    product_id,
    product_name,
    hsn_code,
    units,
    qty,
    balance_qty,
    closing_stock,
    opening_stock,
    purchases,
    sales,
    consumption,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    pm.id,
    pm.name,
    pm.hsn_code,
    pm.units,
    50,
    50,
    50,
    0,
    50,
    0,
    0,
    NOW(),
    NOW()
FROM product_master pm
WHERE NOT EXISTS (
    SELECT 1 FROM balance_stock bs 
    WHERE bs.product_id = pm.id
);

-- Step 9: Verification queries
SELECT 'Product Master Stock Reset' as operation, COUNT(*) as count 
FROM product_master 
WHERE stock_quantity = 50

UNION ALL

SELECT 'POS Orders Deleted' as operation, COUNT(*) as count 
FROM pos_orders

UNION ALL  

SELECT 'Stock Transactions Deleted' as operation, COUNT(*) as count 
FROM product_stock_transactions

UNION ALL

SELECT 'Balance Stock Updated' as operation, COUNT(*) as count 
FROM balance_stock 
WHERE qty = 50;

-- Final status message
SELECT 'RESET COMPLETE: All products set to 50 quantity, POS orders and transactions cleared' as status; 