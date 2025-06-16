-- Fix transaction_type constraints to allow 'opening_balance'
-- This migration updates the check constraints to include 'opening_balance' as a valid value

-- Drop existing constraints
ALTER TABLE inventory_purchases DROP CONSTRAINT IF EXISTS inventory_purchases_transaction_type_check;
ALTER TABLE purchase_history_with_stock DROP CONSTRAINT IF EXISTS purchase_history_transaction_type_check;

-- Add updated constraint for inventory_purchases table
ALTER TABLE inventory_purchases 
ADD CONSTRAINT inventory_purchases_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'inventory_update', 'stock_increment', 'stock_decrement', 'pos_sale', 'opening_balance'));

-- Add updated constraint for purchase_history_with_stock table
ALTER TABLE purchase_history_with_stock 
ADD CONSTRAINT purchase_history_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'inventory_update', 'stock_increment', 'stock_decrement', 'pos_sale', 'opening_balance'));

-- Add comment to document the new transaction type
COMMENT ON COLUMN inventory_purchases.transaction_type IS 'Type of transaction: purchase (normal purchase), inventory_update (stock adjustment), opening_balance (initial stock), stock_increment/stock_decrement (stock adjustments), pos_sale (point of sale)';
COMMENT ON COLUMN purchase_history_with_stock.transaction_type IS 'Type of transaction: purchase (normal purchase), inventory_update (stock adjustment), opening_balance (initial stock), stock_increment/stock_decrement (stock adjustments), pos_sale (point of sale)';

-- Verify the constraints are updated
SELECT 
    table_name,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%transaction_type_check%'
ORDER BY table_name; 