-- DEBUG VERSION: Stock restoration trigger with extensive logging
-- This will help identify exactly why stock isn't being restored correctly

-- First, create a log table to track what's happening during trigger execution
CREATE TABLE IF NOT EXISTS trigger_debug_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  operation TEXT,
  details TEXT,
  error_message TEXT
);

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS restore_stock_on_order_delete_trigger ON pos_orders;
DROP FUNCTION IF EXISTS restore_stock_on_order_delete();

-- Create debug version of trigger function
CREATE OR REPLACE FUNCTION restore_stock_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
  product_record RECORD;
  product_id TEXT;
  table_count INTEGER;
  current_stock INTEGER;
  new_stock INTEGER;
  item_count INTEGER;
  update_count INTEGER;
  can_query_product_master BOOLEAN;
  product_exists BOOLEAN;
  has_stock_quantity BOOLEAN;
  debug_id INTEGER;
BEGIN
  -- Start logging: Create initial debug log entry
  INSERT INTO trigger_debug_log(operation, details)
  VALUES('TRIGGER_START', 'Order ID: ' || OLD.order_id || ', Trigger function started')
  RETURNING id INTO debug_id;

  -- 1. VALIDATE TABLES & COLUMNS EXIST
  
  -- Check if product_master table exists
  BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'product_master';
    
    INSERT INTO trigger_debug_log(operation, details)
    VALUES('TABLE_CHECK', 'product_master table exists: ' || (table_count > 0));
    
    can_query_product_master := (table_count > 0);
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO trigger_debug_log(operation, details, error_message)
    VALUES('TABLE_CHECK', 'Error checking product_master', SQLERRM);
    can_query_product_master := FALSE;
  END;
  
  -- Check if stock_quantity column exists in product_master
  IF can_query_product_master THEN
    BEGIN
      SELECT COUNT(*) INTO table_count FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'product_master' AND column_name = 'stock_quantity';
      
      INSERT INTO trigger_debug_log(operation, details)
      VALUES('COLUMN_CHECK', 'stock_quantity column exists: ' || (table_count > 0));
      
      has_stock_quantity := (table_count > 0);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO trigger_debug_log(operation, details, error_message)
      VALUES('COLUMN_CHECK', 'Error checking stock_quantity column', SQLERRM);
      has_stock_quantity := FALSE;
    END;
  END IF;
  
  -- 2. CHECK ORDER ITEMS
  
  -- Count items in the order
  BEGIN
    SELECT COUNT(*) INTO item_count FROM pos_order_items
    WHERE order_id = OLD.order_id AND type = 'Product';
    
    INSERT INTO trigger_debug_log(operation, details)
    VALUES('ORDER_ITEMS', 'Order has ' || item_count || ' product items');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO trigger_debug_log(operation, details, error_message)
    VALUES('ORDER_ITEMS', 'Error counting order items', SQLERRM);
    item_count := 0;
  END;
  
  -- If we can't query the necessary tables or there are no items, exit early
  IF NOT can_query_product_master OR NOT has_stock_quantity OR item_count = 0 THEN
    INSERT INTO trigger_debug_log(operation, details)
    VALUES('EARLY_EXIT', 'Conditions not met for stock restoration');
    RETURN OLD;
  END IF;
  
  -- 3. PROCESS EACH ITEM
  
  -- Loop through items
  FOR item_record IN 
    SELECT * FROM pos_order_items 
    WHERE order_id = OLD.order_id AND type = 'Product'
  LOOP
    INSERT INTO trigger_debug_log(operation, details)
    VALUES('ITEM_PROCESS', 'Processing item: ' || item_record.product_name || ' with quantity: ' || item_record.quantity);
    
    -- Try exact match
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM product_master
        WHERE LOWER(name) = LOWER(item_record.product_name)
      ) INTO product_exists;
      
      INSERT INTO trigger_debug_log(operation, details)
      VALUES('EXACT_MATCH', 'Exact match found for ' || item_record.product_name || ': ' || product_exists);
      
      IF product_exists THEN
        SELECT * INTO product_record FROM product_master
        WHERE LOWER(name) = LOWER(item_record.product_name);
      ELSE
        -- Try partial match
        SELECT EXISTS (
          SELECT 1 FROM product_master
          WHERE LOWER(name) LIKE '%' || LOWER(item_record.product_name) || '%'
          LIMIT 1
        ) INTO product_exists;
        
        INSERT INTO trigger_debug_log(operation, details)
        VALUES('PARTIAL_MATCH', 'Partial match found for ' || item_record.product_name || ': ' || product_exists);
        
        IF product_exists THEN
          SELECT * INTO product_record FROM product_master
          WHERE LOWER(name) LIKE '%' || LOWER(item_record.product_name) || '%'
          LIMIT 1;
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO trigger_debug_log(operation, details, error_message)
      VALUES('PRODUCT_MATCH', 'Error matching product ' || item_record.product_name, SQLERRM);
      product_exists := FALSE;
    END;
    
    -- Skip to next item if no product match
    IF NOT product_exists THEN
      CONTINUE;
    END IF;
    
    -- 4. UPDATE STOCK QUANTITY
    
    BEGIN
      -- Get current stock value and log it
      SELECT stock_quantity INTO current_stock FROM product_master WHERE id = product_record.id;
      INSERT INTO trigger_debug_log(operation, details)
      VALUES('CURRENT_STOCK', 'Product: ' || product_record.name || ', Current stock: ' || COALESCE(current_stock::TEXT, 'NULL'));
      
      -- Calculate new stock
      new_stock := COALESCE(current_stock, 0) + item_record.quantity;
      
      -- Update product_master with new stock
      UPDATE product_master
      SET stock_quantity = new_stock, updated_at = NOW()
      WHERE id = product_record.id;
      
      GET DIAGNOSTICS update_count = ROW_COUNT;
      
      INSERT INTO trigger_debug_log(operation, details)
      VALUES(
        'STOCK_UPDATE', 
        'Product: ' || product_record.name || 
        ', Old stock: ' || COALESCE(current_stock::TEXT, '0') || 
        ', New stock: ' || new_stock || 
        ', Rows updated: ' || update_count
      );
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO trigger_debug_log(operation, details, error_message)
      VALUES('STOCK_UPDATE', 'Error updating stock for ' || product_record.name, SQLERRM);
    END;
    
    -- 5. RECORD IN TRANSACTION HISTORY
    
    BEGIN
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
        'DEBUG TRIGGER - POS Order Deleted: ' || OLD.order_id,
        'Debug-Restore-' || OLD.order_id || '-' || item_record.id,
        item_record.quantity,
        new_stock
      );
      
      INSERT INTO trigger_debug_log(operation, details)
      VALUES('HISTORY_INSERT', 'Added transaction history record for ' || product_record.name);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO trigger_debug_log(operation, details, error_message)
      VALUES('HISTORY_INSERT', 'Error adding transaction history for ' || product_record.name, SQLERRM);
    END;
  END LOOP;
  
  -- 6. FINAL CLEANUP
  
  INSERT INTO trigger_debug_log(operation, details)
  VALUES('TRIGGER_END', 'Stock restoration process completed for order ' || OLD.order_id);
  
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO trigger_debug_log(operation, details, error_message)
  VALUES('FATAL_ERROR', 'Trigger execution failed for order ' || OLD.order_id, SQLERRM);
  
  -- Always allow deletion to proceed
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER restore_stock_on_order_delete_trigger
BEFORE DELETE ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_order_delete();

-- Grant permissions
GRANT EXECUTE ON FUNCTION restore_stock_on_order_delete() TO PUBLIC;

-- Create helper function to check logs after deletion
CREATE OR REPLACE FUNCTION check_debug_logs(order_id TEXT)
RETURNS TABLE (
  "timestamp" TIMESTAMP,
  operation TEXT,
  details TEXT,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT dl.timestamp, dl.operation, dl.details, dl.error_message
  FROM trigger_debug_log dl
  WHERE dl.details LIKE '%' || order_id || '%'
  ORDER BY dl.id;
END;
$$ LANGUAGE plpgsql;

-- Usage example (run after deleting an order):
-- SELECT * FROM check_debug_logs('your-order-id-here'); 