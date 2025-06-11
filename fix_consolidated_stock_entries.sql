-- Fix two issues with stock transactions:
-- 1. Consolidate multiple units into a single transaction (rather than separate -1 entries)
-- 2. Fix incorrect deduction amount when consuming multiple units

-- =====================================================
-- Fix incorrect stock deduction for multi-unit transactions
-- =====================================================

-- Create or replace the function that handles stock changes from POS orders
CREATE OR REPLACE FUNCTION record_pos_order_stock_change()
RETURNS TRIGGER AS $$
DECLARE
  product_quantities JSONB = '{}';
  item JSONB;
  product_id UUID;
  quantity INTEGER;
  product_name TEXT;
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Skip if this isn't a sale or insertion
  IF TG_OP != 'INSERT' OR (NEW.type != 'sale' AND NEW.type != 'salon_consumption') THEN
    RETURN NEW;
  END IF;
  
  -- First pass: aggregate quantities by product
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    -- Handle products in the services array
    IF (item->>'type') = 'product' THEN
      product_id := (item->>'id')::UUID;
      product_name := item->>'name';
      quantity := COALESCE((item->>'quantity')::INTEGER, 1);
      
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
    
    -- Calculate total quantity for this product
    quantity := (product_quantities->>product_id)::INTEGER;
    
    -- Ensure correct quantity is deducted (fix for issue #2)
    new_stock := GREATEST(0, current_stock - quantity);
    
    -- Update the stock (ensure ALL units are deducted)
    UPDATE product_master
    SET stock_quantity = new_stock
    WHERE id = product_id::UUID;
    
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
      quantity,
      current_stock,
      new_stock,
      NEW.id,
      format('Stock reduced by %s units via %s', quantity, NEW.type),
      CASE WHEN NEW.type = 'sale' THEN 'sale' ELSE 'salon_consumption' END,
      'order',
      CASE WHEN NEW.type = 'sale' THEN 'pos_sale' ELSE 'pos_salon_consumption' END,
      NEW.id || '_' || product_id || '_consolidated_' || now()
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
        'change', -quantity,
        'name', product_name
      )
    );
  END LOOP;
  
  -- Update the order with the stock snapshot
  UPDATE pos_orders
  SET stock_snapshot = NEW.stock_snapshot
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in record_pos_order_stock_change: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop any existing triggers
DROP TRIGGER IF EXISTS record_pos_order_stock_change_trigger ON pos_orders;

-- Create new trigger on pos_orders to handle multi-unit consolidation
CREATE TRIGGER record_pos_order_stock_change_trigger
AFTER INSERT ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION record_pos_order_stock_change();

-- =====================================================
-- Log completion 
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'FIXED STOCK TRANSACTION CONSOLIDATION';
  RAISE NOTICE '============================================';
  RAISE NOTICE '1. Multiple units now consolidated into a SINGLE transaction';
  RAISE NOTICE '2. Fixed incorrect deduction amount for multi-unit sales';
  RAISE NOTICE '3. Added additional stock snapshot to orders';
  RAISE NOTICE '============================================';
END $$; 