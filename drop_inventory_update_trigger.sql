-- Drop only the trigger that causes unwanted automatic inventory entries
-- This trigger creates entries in purchase_history_with_stock when items are added to inventory_purchases

-- This is the main culprit - it runs every time something is inserted into inventory_purchases
DROP TRIGGER IF EXISTS tr_inventory_purchases_insert ON public.inventory_purchases;

-- Keep the function in case you want to re-enable it later
-- DROP FUNCTION IF EXISTS public.fn_insert_purchase_history_stock();

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'DROPPED AUTOMATIC INVENTORY TRIGGER';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Dropped tr_inventory_purchases_insert trigger';
  RAISE NOTICE 'This will stop automatic creation of entries in purchase_history_with_stock';
  RAISE NOTICE 'when items are inserted into inventory_purchases table';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Your manual "Add Opening Balance" button will still work normally';
  RAISE NOTICE 'Only automatic entries from POS orders will be prevented';
  RAISE NOTICE '==============================================';
END $$; 