-- SQL script to remove all triggers and functions related to stock restoration
-- Run this if you want to disable or remove the stock restoration functionality

-- 1. Drop the triggers first
DROP TRIGGER IF EXISTS restore_stock_on_order_delete_trigger ON pos_orders;
DROP TRIGGER IF EXISTS restore_stock_on_order_item_delete_trigger ON pos_order_items;

-- 2. Then drop the functions
DROP FUNCTION IF EXISTS restore_stock_on_order_delete();
DROP FUNCTION IF EXISTS restore_stock_on_order_item_delete();
DROP FUNCTION IF EXISTS update_stock_transaction_history();

-- Notification to refresh schema
NOTIFY pgrst, 'reload schema';

-- Confirmation message
DO $$
BEGIN
  RAISE NOTICE 'All stock restoration triggers and functions have been removed';
END $$; 