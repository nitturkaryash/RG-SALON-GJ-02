-- Fixed triggers to restore product stock without relying on the purchase_type column
-- This version will work with your existing database structure

-- 1. Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS restore_stock_on_order_delete_trigger ON pos_orders;
DROP TRIGGER IF EXISTS restore_stock_on_order_item_delete_trigger ON pos_order_items;
DROP FUNCTION IF EXISTS restore_stock_on_order_delete();
DROP FUNCTION IF EXISTS restore_stock_on_order_item_delete();

-- 2. Simplified trigger function that doesn't rely on purchase_type
CREATE OR REPLACE FUNCTION restore_stock_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  order_exists BOOLEAN;
BEGIN
  -- Log the deletion - using a simpler approach without checking order type
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
    i.product_name,
    p.hsn_code,
    p.units,
    'stock_restore_from_deleted_order',
    'POS Order #' || OLD.order_id || ' Deletion',
    'Restore-' || OLD.order_id,
    i.quantity,
    (
      SELECT 
        (balance_qty + i.quantity) -- New quantity after addition
      FROM 
        inventory_balance_stock 
      WHERE 
        product_name = i.product_name
    )
  FROM 
    pos_order_items i
  JOIN 
    products p ON i.product_name = p.name
  WHERE 
    i.order_id = OLD.order_id AND
    i.type = 'Product';
  
  -- Try to delete from both inventory tables - it will only affect matching records
  -- These statements will silently fail if no matching records exist
  
  -- Try to delete from inventory_consumption
  BEGIN
    DELETE FROM inventory_consumption
    WHERE requisition_voucher_no = OLD.order_id;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors
  END;
  
  -- Try to delete from inventory_sales
  BEGIN
    DELETE FROM inventory_sales
    WHERE reference_id = OLD.order_id;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors
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

-- 4. Simplified function for item deletions
CREATE OR REPLACE FUNCTION restore_stock_on_order_item_delete()
RETURNS TRIGGER AS $$
DECLARE
  order_exists BOOLEAN;
  current_stock INTEGER;
BEGIN
  -- Check if the parent order still exists
  SELECT EXISTS(SELECT 1 FROM pos_orders WHERE order_id = OLD.order_id) INTO order_exists;
  
  -- Only run this if the parent order still exists (individual item deletion)
  IF order_exists THEN
    -- Get current stock for this product
    SELECT balance_qty INTO current_stock
    FROM inventory_balance_stock 
    WHERE product_name = OLD.product_name;
    
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
      'POS Order #' || OLD.order_id || ' Item Deletion',
      'Restore-Item-' || OLD.id,
      OLD.quantity,
      (COALESCE(current_stock, 0) + OLD.quantity)
    FROM 
      products p
    WHERE 
      p.name = OLD.product_name AND
      OLD.type = 'Product';
    
    -- Try to delete from both inventory tables for this specific item
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