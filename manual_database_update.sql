-- Manual Database Update Script
-- Run this script in your Supabase SQL Editor to fix the opening balance issues
-- Updated to work only with purchase_history_with_stock table

-- Step 1: Drop existing constraints
ALTER TABLE purchase_history_with_stock DROP CONSTRAINT IF EXISTS purchase_history_transaction_type_check;

-- Step 2: Update existing records that have 'inventory_update' to 'opening_balance'
UPDATE purchase_history_with_stock 
SET transaction_type = 'opening_balance' 
WHERE transaction_type = 'inventory_update';

-- Step 3: Add updated constraints (without inventory_update, with opening_balance)
ALTER TABLE purchase_history_with_stock 
ADD CONSTRAINT purchase_history_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'opening_balance', 'stock_increment', 'stock_decrement', 'pos_sale'));

-- Step 4: Update comments to reflect the change
COMMENT ON COLUMN purchase_history_with_stock.transaction_type IS 'Type of transaction: purchase (normal purchase), opening_balance (initial stock), stock_increment/stock_decrement (stock adjustments), pos_sale (point of sale)';

-- Step 5: Verify the constraints are created (Fixed query)
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_name LIKE '%transaction_type_check%'
ORDER BY tc.table_name;

-- Step 6: Check if any records still have 'inventory_update'
SELECT 'purchase_history_with_stock' as table_name, COUNT(*) as count 
FROM purchase_history_with_stock 
WHERE transaction_type = 'inventory_update';

-- Step 7: Show sample records with opening_balance type
SELECT 
    purchase_id,
    product_name,
    transaction_type,
    supplier,
    purchase_invoice_number,
    purchase_qty,
    date
FROM purchase_history_with_stock 
WHERE transaction_type = 'opening_balance'
ORDER BY date DESC
LIMIT 5; 