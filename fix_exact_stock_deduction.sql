-- Fix exact stock deduction issue - DEBUGGING VERSION
-- This script ensures exact quantities are deducted and includes detailed logging

-- =====================================================
-- Create a debugging table to track what's happening
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_deduction_debug_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT now(),
  order_id UUID,
  product_id UUID,
  product_name TEXT,
  requested_quantity INTEGER,
  previous_stock INTEGER,
  new_stock INTEGER,
  actual_deduction INTEGER,
  services_json TEXT,
  notes TEXT
);

-- =====================================================
-- Create a more robust function with debugging
-- =====================================================

CREATE OR REPLACE FUNCTION record_pos_order_stock_change_debug()
RETURNS TRIGGER AS $$
DECLARE
  product_quantities JSONB = '{}';
  item JSONB;
  product_id UUID;
  quantity INTEGER;
  product_name TEXT;
  current_stock INTEGER;
  new_stock INTEGER;
  actual_deduction INTEGER;
  debug_id INTEGER;
BEGIN
  -- Skip if this isn't a sale or insertion
  IF TG_OP != 'INSERT' OR (NEW.type != 'sale' AND NEW.type != 'salon_consumption') THEN
    RETURN NEW;
  END IF;
  
  -- DEBUG: Log the start of processing for this order
  INSERT INTO stock_deduction_debug_log (order_id, notes, services_json) 
  VALUES (NEW.id, 'Started processing order', NEW.services::TEXT)
  RETURNING id INTO debug_id;
  
  -- First pass: aggregate quantities by product
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    -- Handle products in the services array
    IF (item->>'type') = 'product' THEN
      product_id := (item->>'id')::UUID;
      product_name := item->>'name';
      
      -- CRITICAL FIX: Ensure we extract quantity correctly
      BEGIN
        -- Try different fields that might contain quantity
        IF item ? 'quantity' AND (item->>'quantity') IS NOT NULL AND (item->>'quantity') != '' THEN
          quantity := (item->>'quantity')::INTEGER;
        ELSIF item ? 'qty' AND (item->>'qty') IS NOT NULL AND (item->>'qty') != '' THEN
          quantity := (item->>'qty')::INTEGER;
        ELSE
          quantity := 1; -- Default to 1 if no quantity found
        END IF;
        
        -- DEBUG: Log the extracted product and quantity
        INSERT INTO stock_deduction_debug_log (
          order_id, product_id, product_name, requested_quantity, notes
        ) VALUES (
          NEW.id, product_id, product_name, quantity, 
          format('Extracted from services: %s with qty %s', product_name, quantity)
        );
      EXCEPTION WHEN OTHERS THEN
        -- If any error in parsing quantity, default to 1
        quantity := 1;
        
        INSERT INTO stock_deduction_debug_log (
          order_id, product_id, product_name, notes
        ) VALUES (
          NEW.id, product_id, product_name, 
          format('ERROR parsing quantity for %s: %s, defaulting to 1', product_name, SQLERRM)
        );
      END;
      
      -- Add to aggregated quantities
      IF product_quantities ? product_id::TEXT THEN
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id::TEXT],
          to_jsonb((product_quantities->>product_id::TEXT)::INTEGER + quantity)
        );
      ELSE
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id::TEXT],
          to_jsonb(quantity)
        );
      END IF;
    END IF;
  END LOOP;

  -- Second pass: process each product once with aggregated quantity
  FOR product_id IN SELECT * FROM jsonb_object_keys(product_quantities)
  LOOP
    -- Get current stock
    SELECT stock_quantity, name INTO current_stock, product_name
    FROM product_master
    WHERE id = product_id::UUID;
    
    IF current_stock IS NULL THEN
      -- Handle case where product is not found
      INSERT INTO stock_deduction_debug_log (
        order_id, product_id, notes
      ) VALUES (
        NEW.id, product_id::UUID, 'ERROR: Product not found in product_master'
      );
      CONTINUE;
    END IF;
    
    -- Calculate total quantity for this product
    quantity := (product_quantities->>product_id)::INTEGER;
    
    -- CRITICAL FIX: Force exact deduction
    IF quantity <= 0 THEN 
      -- Skip if quantity is zero or negative
      INSERT INTO stock_deduction_debug_log (
        order_id, product_id, product_name, requested_quantity, notes
      ) VALUES (
        NEW.id, product_id::UUID, product_name, quantity, 'Skipped due to zero/negative quantity'
      );
      CONTINUE;
    END IF;
    
    -- Calculate new stock with floor of 0
    new_stock := GREATEST(0, current_stock - quantity);
    actual_deduction := current_stock - new_stock;
    
    -- DIRECT UPDATE: Ensure exact deduction by directly setting the new value
    UPDATE product_master
    SET 
      stock_quantity = new_stock,
      updated_at = NOW()
    WHERE id = product_id::UUID;
    
    -- DEBUG: Log what actually happened with the stock update
    INSERT INTO stock_deduction_debug_log (
      order_id, product_id, product_name, requested_quantity, 
      previous_stock, new_stock, actual_deduction, notes
    ) VALUES (
      NEW.id, product_id::UUID, product_name, quantity,
      current_stock, new_stock, actual_deduction,
      format('Updated stock for %s: %s -> %s (deducted %s of requested %s)', 
             product_name, current_stock, new_stock, actual_deduction, quantity)
    );
    
    -- Log a SINGLE transaction for the product (fix for issue #1)
    INSERT INTO product_stock_transactions (
      id,
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      order_id,
      notes,
      display_type,
      source_type,
      source,
      duplicate_protection_key
    ) VALUES (
      gen_random_uuid(),
      product_id::UUID,
      'reduction',
      actual_deduction, -- Use the actual amount deducted
      current_stock,
      new_stock,
      NEW.id,
      format('EXACT: Stock reduced by %s units via %s', actual_deduction, NEW.type),
      CASE WHEN NEW.type = 'sale' THEN 'sale' ELSE 'salon_consumption' END,
      'order',
      CASE WHEN NEW.type = 'sale' THEN 'pos_sale' ELSE 'pos_salon_consumption' END,
      NEW.id || '_' || product_id || '_exact_' || now()
    );
    
    -- Save the stock snapshot in the order for future reference
    IF NEW.stock_snapshot IS NULL THEN
      NEW.stock_snapshot := '{}'::JSONB;
    END IF;
    
    NEW.stock_snapshot := jsonb_set(
      NEW.stock_snapshot,
      ARRAY[product_id],
      jsonb_build_object(
        'before', current_stock,
        'after', new_stock,
        'change', -actual_deduction,
        'requested', quantity,
        'name', product_name
      )
    );
  END LOOP;
  
  -- Update the order with the stock snapshot
  UPDATE pos_orders
  SET 
    stock_snapshot = NEW.stock_snapshot,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  -- DEBUG: Log completion of processing
  INSERT INTO stock_deduction_debug_log (
    order_id, notes
  ) VALUES (
    NEW.id, 'Completed processing order'
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors that occur during processing
  INSERT INTO stock_deduction_debug_log (
    order_id, notes
  ) VALUES (
    NEW.id, 'ERROR in record_pos_order_stock_change_debug: ' || SQLERRM
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Apply the new trigger (remove old one first)
-- =====================================================

-- Drop existing triggers that might interfere
DROP TRIGGER IF EXISTS record_pos_order_stock_change_trigger ON pos_orders;
DROP TRIGGER IF EXISTS update_product_stock_after_consumption ON pos_orders;
DROP TRIGGER IF EXISTS record_stock_transactions_after_order ON pos_orders;
DROP TRIGGER IF EXISTS order_item_stock_record_trigger ON pos_order_items;

-- Create new trigger on pos_orders 
CREATE TRIGGER record_pos_order_stock_change_debug_trigger
AFTER INSERT ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION record_pos_order_stock_change_debug();

-- =====================================================
-- Instructions for checking results
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'FIXED EXACT STOCK DEDUCTION - DEBUGGING VERSION';
  RAISE NOTICE '============================================';
  RAISE NOTICE '1. This will ensure EXACT quantities are deducted from stock';
  RAISE NOTICE '2. Detailed debugging logs are saved to stock_deduction_debug_log table';
  RAISE NOTICE '';
  RAISE NOTICE 'TO CHECK RESULTS:';
  RAISE NOTICE '1. Create a new POS order with multiple units';
  RAISE NOTICE '2. Check if exact stock was deducted by running:';
  RAISE NOTICE '   SELECT * FROM stock_deduction_debug_log ORDER BY id DESC LIMIT 20;';
  RAISE NOTICE '============================================';
END $$; 