-- Fix transaction_type constraints to use 'opening_balance' instead of 'inventory_update'
-- This migration updates the check constraints to replace 'inventory_update' with 'opening_balance'

-- Drop existing constraints
ALTER TABLE inventory_purchases DROP CONSTRAINT IF EXISTS inventory_purchases_transaction_type_check;
ALTER TABLE purchase_history_with_stock DROP CONSTRAINT IF EXISTS purchase_history_transaction_type_check;

-- Add updated constraint for inventory_purchases table
ALTER TABLE inventory_purchases 
ADD CONSTRAINT inventory_purchases_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'opening_balance', 'stock_increment', 'stock_decrement', 'pos_sale'));

-- Add updated constraint for purchase_history_with_stock table
ALTER TABLE purchase_history_with_stock 
ADD CONSTRAINT purchase_history_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'opening_balance', 'stock_increment', 'stock_decrement', 'pos_sale'));

-- Update existing records that have 'inventory_update' to 'opening_balance'
UPDATE inventory_purchases 
SET transaction_type = 'opening_balance' 
WHERE transaction_type = 'inventory_update';

UPDATE purchase_history_with_stock 
SET transaction_type = 'opening_balance' 
WHERE transaction_type = 'inventory_update';

-- Add comment to document the updated transaction type
COMMENT ON COLUMN inventory_purchases.transaction_type IS 'Type of transaction: purchase (normal purchase), opening_balance (initial stock), stock_increment/stock_decrement (stock adjustments), pos_sale (point of sale)';
COMMENT ON COLUMN purchase_history_with_stock.transaction_type IS 'Type of transaction: purchase (normal purchase), opening_balance (initial stock), stock_increment/stock_decrement (stock adjustments), pos_sale (point of sale)';

-- Verify the constraints are updated
SELECT 
    table_name,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%transaction_type_check%'
ORDER BY table_name; 