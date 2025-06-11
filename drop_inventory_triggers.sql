-- This script removes all inventory-related triggers and functions that cause automatic inventory entries.

-- Drop inventory triggers that create automatic entries
DROP TRIGGER IF EXISTS update_product_on_purchase ON inventory_purchases;
DROP TRIGGER IF EXISTS update_product_on_sale ON inventory_sales;
DROP TRIGGER IF EXISTS update_product_on_consumption ON inventory_consumption;

-- Drop purchase history trigger that creates automatic entries when inserting into inventory_purchases
DROP TRIGGER IF EXISTS tr_inventory_purchases_insert ON public.inventory_purchases;

-- Drop old stock restore triggers
DROP TRIGGER IF EXISTS restore_stock_on_order_delete_trigger ON pos_orders;
DROP TRIGGER IF EXISTS restore_stock_on_order_item_delete_trigger ON pos_order_items;
DROP TRIGGER IF EXISTS refresh_views_after_stock_change ON products;

-- Drop updated triggers from clean_inventory_triggers.sql
DROP TRIGGER IF EXISTS update_products_stock_on_purchase_trigger ON inventory_purchases;
DROP TRIGGER IF EXISTS restore_products_stock_on_order_delete_trigger ON pos_orders;
DROP TRIGGER IF EXISTS restore_products_stock_on_item_delete_trigger ON pos_order_items;

-- Drop other conflicting triggers
DROP TRIGGER IF EXISTS trg_update_product_stock_on_sale ON sales;
DROP TRIGGER IF EXISTS ensure_product_name_trigger ON inventory_sales_new;
DROP TRIGGER IF EXISTS ensure_product_name_trigger_sales ON inventory_sales;

-- Drop trigger functions that create automatic inventory entries
DROP FUNCTION IF EXISTS public.fn_insert_purchase_history_stock();
DROP FUNCTION IF EXISTS update_product_stock_on_purchase();
DROP FUNCTION IF EXISTS update_product_stock_on_sale();
DROP FUNCTION IF EXISTS update_product_stock_on_consumption();
DROP FUNCTION IF EXISTS restore_stock_on_order_delete();
DROP FUNCTION IF EXISTS restore_stock_on_order_item_delete();
DROP FUNCTION IF EXISTS update_product_stock_on_sale_trigger();

-- Drop updated functions from clean_inventory_triggers.sql
DROP FUNCTION IF EXISTS update_products_stock_on_purchase();
DROP FUNCTION IF EXISTS restore_products_stock_on_order_delete();
DROP FUNCTION IF EXISTS restore_products_stock_on_item_delete();

-- Drop other system functions (be careful with these)
DROP FUNCTION IF EXISTS public.set_tenant_id();
DROP FUNCTION IF EXISTS sync_total_fields();
DROP FUNCTION IF EXISTS sync_customer_fields();
DROP FUNCTION IF EXISTS trigger_set_timestamp();

-- Drop stock increment function if it exists
DROP FUNCTION IF EXISTS increment_product_stock(UUID, INTEGER);

DO $$
BEGIN
  RAISE NOTICE 'All inventory-related triggers and functions have been removed.';
  RAISE NOTICE 'This will stop automatic inventory entries when creating POS orders.';
  RAISE NOTICE 'Manual inventory management will need to be done through the Inventory Manager.';
END $$; 