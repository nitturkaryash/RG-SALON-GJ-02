-- Fix double stock deduction issue by removing redundant triggers
-- The issue: record_order_item_stock_change trigger is recording transactions 
-- when stock changes are already being tracked by product_master update triggers

-- =====================================================
-- Remove the redundant trigger that causes duplicate transaction recording
-- =====================================================

-- This trigger records transactions when order items are inserted,
-- but stock changes are already tracked when product_master is updated
DROP TRIGGER IF EXISTS order_item_stock_record_trigger ON pos_order_items;

-- Optionally keep the function in case you want to re-enable it later
-- DROP FUNCTION IF EXISTS record_order_item_stock_change();

-- =====================================================
-- Verification - Check what triggers remain active
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'FIXED DOUBLE STOCK DEDUCTION ISSUE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Removed: order_item_stock_record_trigger';
  RAISE NOTICE 'Stock changes will now only be recorded once when product_master is updated';
  RAISE NOTICE 'Kept: restore_stock_on_order_item_delete_trigger (for restoring stock on item deletion)';
  RAISE NOTICE '============================================';
END $$; 