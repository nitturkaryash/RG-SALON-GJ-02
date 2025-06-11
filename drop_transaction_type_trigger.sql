-- Script to drop the specific trigger and function that uses transaction_type column
-- This will stop automatic inventory entries when inserting into inventory_purchases table

-- Drop the trigger that automatically creates purchase history entries
DROP TRIGGER IF EXISTS tr_inventory_purchases_insert ON public.inventory_purchases;

-- Drop the function that handles transaction_type and creates automatic entries
DROP FUNCTION IF EXISTS public.fn_insert_purchase_history_stock();

-- Drop related indexes for transaction_type
DROP INDEX IF EXISTS idx_purchase_history_transaction_type;
DROP INDEX IF EXISTS idx_inventory_purchases_transaction_type;

-- Optionally, drop the transaction_type column constraints (uncomment if needed)
-- ALTER TABLE inventory_purchases DROP CONSTRAINT IF EXISTS inventory_purchases_transaction_type_check;
-- ALTER TABLE purchase_history_with_stock DROP CONSTRAINT IF EXISTS purchase_history_transaction_type_check;

-- Optionally, drop the transaction_type columns entirely (uncomment if needed)
-- ALTER TABLE inventory_purchases DROP COLUMN IF EXISTS transaction_type;
-- ALTER TABLE purchase_history_with_stock DROP COLUMN IF EXISTS transaction_type;

DO $$
BEGIN
  RAISE NOTICE 'Dropped tr_inventory_purchases_insert trigger and fn_insert_purchase_history_stock function';
  RAISE NOTICE 'This will stop automatic creation of inventory entries with transaction_type';
  RAISE NOTICE 'Manual inventory management will be required through the application interface';
END $$; 