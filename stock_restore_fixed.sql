-- Fixed triggers to directly restore stock in the product_master table
-- This version will work with your existing database structure

-- 1. Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS restore_stock_on_order_delete_trigger ON pos_orders;
DROP TRIGGER IF EXISTS restore_stock_on_order_item_delete_trigger ON pos_order_items;
DROP FUNCTION IF EXISTS restore_stock_on_order_delete();
DROP FUNCTION IF EXISTS restore_stock_on_order_item_delete();

-- 2. Simplified trigger function that directly updates product_master
CREATE OR REPLACE FUNCTION restore_stock_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- For each product in the order, restore stock in the product_master table
  FOR item_record IN 
    SELECT i.product_name, i.quantity, p.id AS product_id
    FROM pos_order_items i
    JOIN product_master p ON i.product_name = p.name
    WHERE i.order_id = OLD.order_id AND i.type = 'Product'
  LOOP
    -- Get current stock
    SELECT stock_quantity INTO current_stock
    FROM product_master
    WHERE id = item_record.product_id;
    
    -- Calculate new stock
    new_stock := COALESCE(current_stock, 0) + item_record.quantity;
    
    -- Update product_master table with restored stock
    UPDATE product_master
    SET 
      stock_quantity = new_stock,
      updated_at = NOW()
    WHERE id = item_record.product_id;
    
    -- Log the stock restoration in transaction history
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
    )
    SELECT 
      NOW(),
      item_record.product_name,
      p.hsn_code,
      p.units,
      'stock_restore_from_deleted_order',
      'POS Order #' || OLD.order_id || ' Deleted',
      'Restore-' || OLD.order_id,
      item_record.quantity,
      new_stock
    FROM product_master p
    WHERE p.id = item_record.product_id;
    
    -- Log the operation
    RAISE NOTICE 'Restored % units to product % (new stock: %)', 
      item_record.quantity, 
      item_record.product_name, 
      new_stock;
  END LOOP;
  
  -- Try to clean up related entries in inventory tracking tables
  -- These are wrapped in exception blocks to prevent failures
  
  -- Try to delete from inventory_consumption
  BEGIN
    DELETE FROM inventory_consumption
    WHERE requisition_voucher_no = OLD.order_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not delete from inventory_consumption: %', SQLERRM;
  END;
  
  -- Try to delete from inventory_sales
  BEGIN
    DELETE FROM inventory_sales
    WHERE reference_id = OLD.order_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not delete from inventory_sales: %', SQLERRM;
  END;
  
  RETURN OLD;

EXCEPTION WHEN OTHERS THEN
  -- Log error but still allow the deletion to proceed
  RAISE NOTICE 'Error in restore_stock_on_order_delete: %', SQLERRM;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
CREATE TRIGGER restore_stock_on_order_delete_trigger
BEFORE DELETE ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_order_delete();

-- 4. Function for item deletions that directly updates product_master
CREATE OR REPLACE FUNCTION restore_stock_on_order_item_delete()
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
    -- Get product_id and current stock
    SELECT id, stock_quantity INTO product_id, current_stock
    FROM product_master
    WHERE name = OLD.product_name;
    
    IF FOUND THEN
      -- Calculate new stock
      new_stock := COALESCE(current_stock, 0) + OLD.quantity;
      
      -- Update product_master table
      UPDATE product_master
      SET 
        stock_quantity = new_stock,
        updated_at = NOW()
      WHERE id = product_id;
      
      -- Log the item deletion and stock change
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
      )
      SELECT 
        NOW(),
        OLD.product_name,
        p.hsn_code,
        p.units,
        'stock_restore_from_deleted_order_item',
        'POS Order #' || OLD.order_id || ' Item Deleted',
        'Restore-Item-' || OLD.id,
        OLD.quantity,
        new_stock
      FROM product_master p
      WHERE p.id = product_id;
      
      -- Log the operation
      RAISE NOTICE 'Restored % units to product % (new stock: %)', 
        OLD.quantity, 
        OLD.product_name, 
        new_stock;
      
      -- Try to delete from inventory tracking tables if needed
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
    END IF;
  END IF;
  
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  -- Log error but still allow the deletion to proceed
  RAISE NOTICE 'Error in restore_stock_on_order_item_delete: %', SQLERRM;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. Create the order items trigger
CREATE TRIGGER restore_stock_on_order_item_delete_trigger
BEFORE DELETE ON pos_order_items
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_order_item_delete();

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION restore_stock_on_order_delete() TO PUBLIC;
GRANT EXECUTE ON FUNCTION restore_stock_on_order_item_delete() TO PUBLIC;

-- Refresh schema
NOTIFY pgrst, 'reload schema'; 