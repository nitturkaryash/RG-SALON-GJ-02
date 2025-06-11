-- ======================================================
-- INVENTORY TRIGGER CLEANUP AND REORGANIZATION
-- ======================================================
-- This script removes all conflicting inventory triggers and 
-- creates proper ones that work with the actual database structure

-- ======================================================
-- STEP 1: DROP ALL EXISTING CONFLICTING TRIGGERS
-- ======================================================

-- Drop inventory triggers that update wrong table (inventory_products vs products)
DROP TRIGGER IF EXISTS update_product_on_purchase ON inventory_purchases;
DROP TRIGGER IF EXISTS update_product_on_sale ON inventory_sales;
DROP TRIGGER IF EXISTS update_product_on_consumption ON inventory_consumption;

-- Drop old stock restore triggers
DROP TRIGGER IF EXISTS restore_stock_on_order_delete_trigger ON pos_orders;
DROP TRIGGER IF EXISTS restore_stock_on_order_item_delete_trigger ON pos_order_items;
DROP TRIGGER IF EXISTS refresh_views_after_stock_change ON products;

-- Drop other conflicting triggers
DROP TRIGGER IF EXISTS trg_update_product_stock_on_sale ON sales;
DROP TRIGGER IF EXISTS ensure_product_name_trigger ON inventory_sales_new;
DROP TRIGGER IF EXISTS ensure_product_name_trigger_sales ON inventory_sales;

-- ======================================================
-- STEP 2: DROP TRIGGER FUNCTIONS
-- ======================================================

DROP FUNCTION IF EXISTS update_product_stock_on_purchase();
DROP FUNCTION IF EXISTS update_product_stock_on_sale();
DROP FUNCTION IF EXISTS update_product_stock_on_consumption();
DROP FUNCTION IF EXISTS restore_stock_on_order_delete();
DROP FUNCTION IF EXISTS restore_stock_on_order_item_delete();
DROP FUNCTION IF EXISTS update_product_stock_on_sale_trigger();

-- ======================================================
-- STEP 3: CREATE PROPER INVENTORY TRIGGERS FOR PRODUCTS TABLE
-- ======================================================

-- Function to update stock in the correct 'products' table (not inventory_products)
CREATE OR REPLACE FUNCTION update_products_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock in the main 'products' table that the app actually uses
    -- Match by product_id if available, otherwise by product_name
    IF NEW.product_id IS NOT NULL THEN
        UPDATE products
        SET 
            stock_quantity = COALESCE(stock_quantity, 0) + NEW.purchase_qty,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    ELSE
        -- Fallback to name matching if product_id is not available
        UPDATE products
        SET 
            stock_quantity = COALESCE(stock_quantity, 0) + NEW.purchase_qty,
            updated_at = NOW()
        WHERE name = NEW.product_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for purchases - this handles regular purchases AND opening balance
CREATE TRIGGER update_products_stock_on_purchase_trigger
    AFTER INSERT ON inventory_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_products_stock_on_purchase();

-- ======================================================
-- STEP 4: CREATE STOCK RESTORE TRIGGER FOR POS DELETIONS
-- ======================================================

-- Function to restore stock when POS orders are deleted
CREATE OR REPLACE FUNCTION restore_products_stock_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- For each product in the deleted order, restore stock in the 'products' table
  FOR item_record IN 
    SELECT i.product_name, i.quantity, p.id AS product_id
    FROM pos_order_items i
    LEFT JOIN products p ON (i.product_name = p.name OR i.product_id::text = p.id::text)
    WHERE i.order_id = OLD.order_id AND i.type = 'Product'
  LOOP
    IF item_record.product_id IS NOT NULL THEN
      -- Get current stock
      SELECT stock_quantity INTO current_stock
      FROM products
      WHERE id = item_record.product_id;
      
      -- Calculate new stock (restore the quantity)
      new_stock := COALESCE(current_stock, 0) + item_record.quantity;
      
      -- Update products table with restored stock
      UPDATE products
      SET 
        stock_quantity = new_stock,
        updated_at = NOW()
      WHERE id = item_record.product_id;
      
      -- Log the operation
      RAISE NOTICE 'Stock restored: % units added to product % (new stock: %)', 
        item_record.quantity, 
        item_record.product_name, 
        new_stock;
    END IF;
  END LOOP;
  
  RETURN OLD;

EXCEPTION WHEN OTHERS THEN
  -- Log error but still allow the deletion to proceed
  RAISE NOTICE 'Error in restore_products_stock_on_order_delete: %', SQLERRM;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order deletions
CREATE TRIGGER restore_products_stock_on_order_delete_trigger
    BEFORE DELETE ON pos_orders
    FOR EACH ROW
    EXECUTE FUNCTION restore_products_stock_on_order_delete();

-- ======================================================
-- STEP 5: CREATE TRIGGER FOR INDIVIDUAL ITEM DELETIONS
-- ======================================================

-- Function to restore stock when individual POS order items are deleted
CREATE OR REPLACE FUNCTION restore_products_stock_on_item_delete()
RETURNS TRIGGER AS $$
DECLARE
  order_exists BOOLEAN;
  product_id UUID;
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Check if the parent order still exists
  SELECT EXISTS(SELECT 1 FROM pos_orders WHERE order_id = OLD.order_id) INTO order_exists;
  
  -- Only run this if the parent order still exists and this is a product
  IF order_exists AND OLD.type = 'Product' THEN
    -- Get product_id from products table
    SELECT id, stock_quantity INTO product_id, current_stock
    FROM products
    WHERE name = OLD.product_name OR id::text = OLD.product_id::text;
    
    IF FOUND THEN
      -- Calculate new stock (restore the quantity)
      new_stock := COALESCE(current_stock, 0) + OLD.quantity;
      
      -- Update products table
      UPDATE products
      SET 
        stock_quantity = new_stock,
        updated_at = NOW()
      WHERE id = product_id;
      
      -- Log the operation
      RAISE NOTICE 'Item stock restored: % units added to product % (new stock: %)', 
        OLD.quantity, 
        OLD.product_name, 
        new_stock;
    END IF;
  END IF;
  
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  -- Log error but still allow the deletion to proceed
  RAISE NOTICE 'Error in restore_products_stock_on_item_delete: %', SQLERRM;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for individual item deletions
CREATE TRIGGER restore_products_stock_on_item_delete_trigger
    BEFORE DELETE ON pos_order_items
    FOR EACH ROW
    EXECUTE FUNCTION restore_products_stock_on_item_delete();

-- ======================================================
-- STEP 6: VERIFICATION AND CLEANUP
-- ======================================================

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_products_stock_on_purchase() TO PUBLIC;
GRANT EXECUTE ON FUNCTION restore_products_stock_on_order_delete() TO PUBLIC;
GRANT EXECUTE ON FUNCTION restore_products_stock_on_item_delete() TO PUBLIC;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'INVENTORY TRIGGER CLEANUP COMPLETED';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Removed conflicting triggers that updated inventory_products table';
    RAISE NOTICE 'Created new triggers that update the correct products table';
    RAISE NOTICE 'Opening balance and inventory management should now work properly';
    RAISE NOTICE '==============================================';
END $$; 