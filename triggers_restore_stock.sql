-- Triggers to restore product stock when POS orders are deleted
-- These triggers will maintain data integrity by returning stock to inventory when orders are deleted

-- 1. Trigger function to restore stock when an order is deleted
CREATE OR REPLACE FUNCTION restore_stock_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  order_type TEXT;
  item_record RECORD;
BEGIN
  -- Get the order type to handle different order types accordingly
  SELECT purchase_type INTO order_type FROM pos_orders WHERE order_id = OLD.order_id;
  
  -- Log the deletion with detailed change type and source
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
    CASE 
      WHEN order_type = 'salon_consumption' THEN 'stock_restore_from_deleted_salon_consumption'
      WHEN order_type = 'regular' THEN 'stock_restore_from_deleted_sale'
      ELSE 'stock_restore_from_deleted_order'
    END AS "Change Type",
    'POS Order #' || OLD.order_id || ' Deletion' AS "Source",
    'Restore-' || OLD.order_id AS "Reference ID",
    i.quantity AS "Quantity Change",
    (
      SELECT 
        (balance_qty + i.quantity) -- New quantity after addition
      FROM 
        inventory_balance_stock 
      WHERE 
        product_name = i.product_name
    ) AS "Quantity After Change"
  FROM 
    pos_order_items i
  JOIN 
    products p ON i.product_name = p.name
  WHERE 
    i.order_id = OLD.order_id AND
    i.type = 'Product';
  
  -- If it was a salon consumption order, delete corresponding entries in inventory_consumption
  IF order_type = 'salon_consumption' THEN
    DELETE FROM inventory_consumption
    WHERE requisition_voucher_no = OLD.order_id;
  
  -- If it was a regular sale, delete corresponding entries in inventory_sales
  ELSIF order_type = 'regular' THEN
    -- Delete from inventory_sales if the record exists
    DELETE FROM inventory_sales
    WHERE reference_id = OLD.order_id;
  END IF;
  
  -- Update stock in products table if it has a stock/quantity column
  -- Uncomment and adjust if your products table tracks quantities directly
  /*
  UPDATE products p
  SET current_stock = current_stock + item_qty.quantity
  FROM (
    SELECT product_name, SUM(quantity) as quantity
    FROM pos_order_items
    WHERE order_id = OLD.order_id AND type = 'Product'
    GROUP BY product_name
  ) item_qty
  WHERE p.name = item_qty.product_name;
  */
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger to execute restore stock function when a pos_order is deleted
DROP TRIGGER IF EXISTS restore_stock_on_order_delete_trigger ON pos_orders;
CREATE TRIGGER restore_stock_on_order_delete_trigger
BEFORE DELETE ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_order_delete();

-- 3. Function to track pos_order_items deletion separately (as a safeguard)
CREATE OR REPLACE FUNCTION restore_stock_on_order_item_delete()
RETURNS TRIGGER AS $$
DECLARE
  order_exists BOOLEAN;
  order_type TEXT;
  current_stock INTEGER;
BEGIN
  -- Check if the parent order still exists (if not, the main trigger already ran)
  SELECT EXISTS(SELECT 1 FROM pos_orders WHERE order_id = OLD.order_id) INTO order_exists;
  
  -- Only run this if the parent order still exists (individual item deletion)
  IF order_exists THEN
    -- Get the order type
    SELECT purchase_type INTO order_type FROM pos_orders WHERE order_id = OLD.order_id;
    
    -- Get current stock for this product
    SELECT balance_qty INTO current_stock
    FROM inventory_balance_stock 
    WHERE product_name = OLD.product_name;
    
    -- Log the item deletion and stock change with better reason
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
      CASE 
        WHEN order_type = 'salon_consumption' THEN 'stock_restore_from_deleted_salon_item'
        WHEN order_type = 'regular' THEN 'stock_restore_from_deleted_sale_item'
        ELSE 'stock_restore_from_deleted_order_item'
      END AS "Change Type",
      'POS Order #' || OLD.order_id || ' Item Deletion' AS "Source",
      'Restore-Item-' || OLD.id AS "Reference ID",
      OLD.quantity AS "Quantity Change",
      (COALESCE(current_stock, 0) + OLD.quantity) AS "Quantity After Change"
    FROM 
      products p
    WHERE 
      p.name = OLD.product_name AND
      OLD.type = 'Product';
    
    -- Handle inventory record deletion based on order type
    IF order_type = 'salon_consumption' THEN
      -- Delete from inventory_consumption if the record exists for this specific product
      DELETE FROM inventory_consumption
      WHERE requisition_voucher_no = OLD.order_id AND product_name = OLD.product_name;
      
    ELSIF order_type = 'regular' THEN
      -- Delete from inventory_sales if the record exists for this specific product
      DELETE FROM inventory_sales
      WHERE reference_id = OLD.order_id AND product_name = OLD.product_name;
    END IF;
    
    -- Update stock in products table if it has a stock/quantity column
    -- Uncomment and adjust if your products table tracks quantities directly
    /*
    UPDATE products
    SET current_stock = current_stock + OLD.quantity
    WHERE name = OLD.product_name;
    */
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to execute restore stock function when a pos_order_item is deleted
DROP TRIGGER IF EXISTS restore_stock_on_order_item_delete_trigger ON pos_order_items;
CREATE TRIGGER restore_stock_on_order_item_delete_trigger
BEFORE DELETE ON pos_order_items
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_order_item_delete();

-- 5. Function to record changes in inventory_balance_stock for auditing
CREATE OR REPLACE FUNCTION update_stock_transaction_history()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    -- Record stock reduction with detailed reason
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
    VALUES(
      NOW(),
      OLD.product_name,
      OLD.hsn_code,
      OLD.units,
      'stock_reduction_from_' || TG_TABLE_NAME,
      TG_TABLE_NAME || ' Record Deletion',
      OLD.id,
      -1 * OLD.quantity,
      (SELECT balance_qty FROM inventory_balance_stock WHERE product_name = OLD.product_name)
    );
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    -- Record stock addition with detailed reason
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
    VALUES(
      NOW(),
      NEW.product_name,
      (SELECT hsn_code FROM products WHERE name = NEW.product_name),
      (SELECT units FROM products WHERE name = NEW.product_name),
      'stock_addition_from_' || TG_TABLE_NAME,
      TG_TABLE_NAME || ' Record Creation',
      NEW.id,
      NEW.quantity,
      (SELECT balance_qty FROM inventory_balance_stock WHERE product_name = NEW.product_name)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant appropriate permissions
GRANT EXECUTE ON FUNCTION restore_stock_on_order_delete() TO PUBLIC;
GRANT EXECUTE ON FUNCTION restore_stock_on_order_item_delete() TO PUBLIC;
GRANT EXECUTE ON FUNCTION update_stock_transaction_history() TO PUBLIC;

-- Refresh schema
NOTIFY pgrst, 'reload schema'; 