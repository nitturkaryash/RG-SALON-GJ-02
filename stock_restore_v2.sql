-- Improved stock restoration triggers with better product matching
-- Handles stock restoration in both product_master and ensures visibility in balance stock

-- 1. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS restore_stock_on_order_delete_trigger ON pos_orders;
DROP TRIGGER IF EXISTS restore_stock_on_order_item_delete_trigger ON pos_order_items;
DROP FUNCTION IF EXISTS restore_stock_on_order_delete();
DROP FUNCTION IF EXISTS restore_stock_on_order_item_delete();

-- 2. Improved trigger function with better product matching
CREATE OR REPLACE FUNCTION restore_stock_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
  product_record RECORD;
  current_stock INTEGER;
  new_stock INTEGER;
  items_processed INTEGER := 0;
  items_restored INTEGER := 0;
BEGIN
  -- Debug log
  RAISE NOTICE 'Starting stock restoration for order %', OLD.order_id;
  
  -- For each product in the order
  FOR item_record IN 
    SELECT i.* 
    FROM pos_order_items i
    WHERE i.order_id = OLD.order_id AND i.type = 'Product'
  LOOP
    items_processed := items_processed + 1;
    RAISE NOTICE 'Processing item: % (quantity: %)', item_record.product_name, item_record.quantity;
    
    -- Try to find product in product_master with exact name match first
    SELECT * INTO product_record 
    FROM product_master 
    WHERE LOWER(name) = LOWER(item_record.product_name);
    
    -- If not found, try a more flexible match (contains)
    IF NOT FOUND THEN
      SELECT * INTO product_record 
      FROM product_master 
      WHERE LOWER(name) LIKE '%' || LOWER(item_record.product_name) || '%'
      LIMIT 1;
      
      IF FOUND THEN
        RAISE NOTICE 'Found product with fuzzy match: % for %', product_record.name, item_record.product_name;
      END IF;
    END IF;
    
    -- If we found the product, restore stock
    IF FOUND THEN
      items_restored := items_restored + 1;
      
      -- Get current stock, calculate new stock
      current_stock := COALESCE(product_record.stock_quantity, 0);
      new_stock := current_stock + item_record.quantity;
      
      -- Update product_master stock
      UPDATE product_master
      SET 
        stock_quantity = new_stock,
        updated_at = NOW()
      WHERE id = product_record.id;
      
      RAISE NOTICE 'Updated product_master: % - stock changed from % to %', 
        product_record.name, current_stock, new_stock;
      
      -- Insert a record in the transaction history with clear details
      INSERT INTO product_stock_transaction_history(
        "Date",
        "Product Name",
        "HSN Code",
        "Units",
        "Change Type",
        "Source",
        "Reference ID",
        "Quantity Change",
        "Quantity After Change"
      ) VALUES (
        NOW(),
        product_record.name,
        product_record.hsn_code,
        product_record.units,
        'Order Deletion - Stock Restored',
        'POS Order Deleted: ' || OLD.order_id,
        'Restore-' || OLD.order_id || '-' || item_record.id,
        item_record.quantity,
        new_stock
      );
    ELSE
      RAISE NOTICE 'Could not find product % in product_master', item_record.product_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Processed % items, restored stock for % products', items_processed, items_restored;
  
  -- Try to clean up related inventory entries
  BEGIN
    -- Delete from salon_consumption_new if it exists
    DELETE FROM salon_consumption_new
    WHERE order_id = OLD.order_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error deleting from salon_consumption_new: %', SQLERRM;
  END;
  
  BEGIN
    -- Delete from inventory_consumption
    DELETE FROM inventory_consumption
    WHERE requisition_voucher_no = OLD.order_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error deleting from inventory_consumption: %', SQLERRM;
  END;
  
  BEGIN
    -- Delete from inventory_sales
    DELETE FROM inventory_sales
    WHERE reference_id = OLD.order_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error deleting from inventory_sales: %', SQLERRM;
  END;
  
  -- Return original record for deletion
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error during stock restoration: %', SQLERRM;
  RETURN OLD; -- Allow deletion to continue even if stock restoration fails
END;
$$ LANGUAGE plpgsql;

-- 3. Create the main trigger
CREATE TRIGGER restore_stock_on_order_delete_trigger
BEFORE DELETE ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_order_delete();

-- 4. Improved function for individual item deletions
CREATE OR REPLACE FUNCTION restore_stock_on_order_item_delete()
RETURNS TRIGGER AS $$
DECLARE
  order_exists BOOLEAN;
  product_record RECORD;
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Only process product items
  IF OLD.type <> 'Product' THEN
    RETURN OLD;
  END IF;
  
  -- Check if the parent order still exists
  SELECT EXISTS(SELECT 1 FROM pos_orders WHERE order_id = OLD.order_id) INTO order_exists;
  
  -- Only run this if the parent order still exists (individual item deletion)
  IF order_exists THEN
    RAISE NOTICE 'Processing individual item deletion: % from order %', OLD.product_name, OLD.order_id;
    
    -- Try to find product in product_master with exact name match first
    SELECT * INTO product_record 
    FROM product_master 
    WHERE LOWER(name) = LOWER(OLD.product_name);
    
    -- If not found, try a more flexible match
    IF NOT FOUND THEN
      SELECT * INTO product_record 
      FROM product_master 
      WHERE LOWER(name) LIKE '%' || LOWER(OLD.product_name) || '%'
      LIMIT 1;
      
      IF FOUND THEN
        RAISE NOTICE 'Found product with fuzzy match: % for %', product_record.name, OLD.product_name;
      END IF;
    END IF;
    
    -- If we found the product, restore stock
    IF FOUND THEN
      -- Get current stock, calculate new stock
      current_stock := COALESCE(product_record.stock_quantity, 0);
      new_stock := current_stock + OLD.quantity;
      
      -- Update product_master stock
      UPDATE product_master
      SET 
        stock_quantity = new_stock,
        updated_at = NOW()
      WHERE id = product_record.id;
      
      RAISE NOTICE 'Updated product_master: % - stock changed from % to %', 
        product_record.name, current_stock, new_stock;
      
      -- Insert a record in the transaction history
      INSERT INTO product_stock_transaction_history(
        "Date",
        "Product Name",
        "HSN Code",
        "Units",
        "Change Type",
        "Source",
        "Reference ID",
        "Quantity Change",
        "Quantity After Change"
      ) VALUES (
        NOW(),
        product_record.name,
        product_record.hsn_code,
        product_record.units,
        'Order Item Deletion - Stock Restored',
        'POS Order Item Deleted: ' || OLD.order_id,
        'Restore-Item-' || OLD.id,
        OLD.quantity,
        new_stock
      );
      
      -- Try to delete from related inventory tables
      BEGIN
        DELETE FROM salon_consumption_new
        WHERE order_id = OLD.order_id AND "Product Name" = OLD.product_name;
        EXCEPTION WHEN OTHERS THEN
          -- Ignore errors
      END;
      
      BEGIN
        DELETE FROM inventory_consumption
        WHERE requisition_voucher_no = OLD.order_id AND product_name = OLD.product_name;
        EXCEPTION WHEN OTHERS THEN
          -- Ignore errors
      END;
      
      BEGIN
        DELETE FROM inventory_sales
        WHERE reference_id = OLD.order_id AND product_name = OLD.product_name;
        EXCEPTION WHEN OTHERS THEN
          -- Ignore errors
      END;
    ELSE
      RAISE NOTICE 'Could not find product % in product_master', OLD.product_name;
    END IF;
  END IF;
  
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in restore_stock_on_order_item_delete: %', SQLERRM;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. Create the item trigger
CREATE TRIGGER restore_stock_on_order_item_delete_trigger
BEFORE DELETE ON pos_order_items
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_order_item_delete();

-- 6. Function to refresh materialized views if needed
-- Uncomment this if you have materialized views that need refreshing
/*
CREATE OR REPLACE FUNCTION refresh_inventory_views()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW inventory_balance_stock;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_views_after_stock_change
AFTER INSERT ON product_stock_transaction_history
FOR EACH ROW
EXECUTE FUNCTION refresh_inventory_views();
*/

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION restore_stock_on_order_delete() TO PUBLIC;
GRANT EXECUTE ON FUNCTION restore_stock_on_order_item_delete() TO PUBLIC;

-- 8. Refresh schema
NOTIFY pgrst, 'reload schema'; 