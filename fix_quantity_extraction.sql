-- SPECIALIZED FIX for quantity extraction issues
-- This script identifies the exact JSON structure and ensures correct quantity extraction

-- =====================================================
-- Create a function to examine the JSON structure
-- =====================================================

CREATE OR REPLACE FUNCTION examine_pos_order_structure()
RETURNS SETOF jsonb AS $$
DECLARE
  sample_order record;
  service jsonb;
BEGIN
  -- Get the most recent POS order for examination
  SELECT * INTO sample_order 
  FROM pos_orders
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No POS orders found for examination';
    RETURN;
  END IF;
  
  -- Return the services array for inspection
  RETURN QUERY SELECT jsonb_agg(service)
  FROM jsonb_array_elements(sample_order.services) AS service;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Display order structure for diagnosis
-- =====================================================

DO $$
DECLARE
  service_json jsonb;
  product_service jsonb;
  key_name text;
BEGIN
  -- Find a product service to examine
  SELECT json FROM examine_pos_order_structure() INTO service_json;
  
  -- Extract the first service with type='product'
  FOR product_service IN 
    SELECT elem FROM jsonb_array_elements(service_json) AS elem
    WHERE elem->>'type' = 'product'
  LOOP
    RAISE NOTICE 'SAMPLE PRODUCT JSON STRUCTURE:';
    RAISE NOTICE '-----------------------------';
    RAISE NOTICE '%', product_service;
    RAISE NOTICE '-----------------------------';
    
    -- Check which field contains the quantity
    IF product_service ? 'quantity' THEN
      RAISE NOTICE 'FOUND: quantity field = %', product_service->>'quantity';
    END IF;
    
    IF product_service ? 'qty' THEN
      RAISE NOTICE 'FOUND: qty field = %', product_service->>'qty';
    END IF;
    
    IF product_service ? 'count' THEN
      RAISE NOTICE 'FOUND: count field = %', product_service->>'count';
    END IF;
    
    RAISE NOTICE 'Field names in product JSON:';
    FOR key_name IN SELECT * FROM jsonb_object_keys(product_service)
    LOOP
      RAISE NOTICE '- %: %', key_name, product_service->>key_name;
    END LOOP;
    
    EXIT; -- Only examine the first product service
  END LOOP;
END $$;

-- =====================================================
-- Create a more targeted function based on the actual JSON structure
-- =====================================================

CREATE OR REPLACE FUNCTION fix_pos_order_stock_deduction()
RETURNS TRIGGER AS $$
DECLARE
  service jsonb;
  product_id UUID;
  product_name TEXT;
  quantity INTEGER;
  service_id TEXT;
  current_stock INTEGER;
  new_stock INTEGER;
  found_quantity_field BOOLEAN;
  quantity_field_name TEXT;
  quantity_value TEXT;
BEGIN
  -- Skip if this isn't a sale or insertion
  IF TG_OP != 'INSERT' OR (NEW.type != 'sale' AND NEW.type != 'salon_consumption') THEN
    RETURN NEW;
  END IF;
  
  RAISE NOTICE 'Processing order % of type % with % services', 
    NEW.id, NEW.type, jsonb_array_length(NEW.services);
  
  -- Process each service in the order
  FOR service IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    -- Only process product services
    IF service->>'type' = 'product' THEN
      -- Extract product information
      product_id := (service->>'id')::UUID;
      product_name := service->>'name';
      service_id := service->>'service_id'; -- This might be the product ID in some setups
      
      -- EXTENSIVE QUANTITY FIELD DETECTION
      -- Try all possible fields where quantity might be stored
      found_quantity_field := FALSE;
      
      -- Check for quantity field
      IF service ? 'quantity' AND service->>'quantity' ~ '^[0-9]+$' THEN
        quantity := (service->>'quantity')::INTEGER;
        quantity_field_name := 'quantity';
        quantity_value := service->>'quantity';
        found_quantity_field := TRUE;
      -- Check for qty field
      ELSIF service ? 'qty' AND service->>'qty' ~ '^[0-9]+$' THEN
        quantity := (service->>'qty')::INTEGER;
        quantity_field_name := 'qty';
        quantity_value := service->>'qty';
        found_quantity_field := TRUE;
      -- Check for count field
      ELSIF service ? 'count' AND service->>'count' ~ '^[0-9]+$' THEN
        quantity := (service->>'count')::INTEGER;
        quantity_field_name := 'count';
        quantity_value := service->>'count';
        found_quantity_field := TRUE;
      -- Check service_amount field
      ELSIF service ? 'service_amount' AND service->>'service_amount' ~ '^[0-9]+$' THEN
        quantity := (service->>'service_amount')::INTEGER;
        quantity_field_name := 'service_amount';
        quantity_value := service->>'service_amount';
        found_quantity_field := TRUE;
      -- Check number field
      ELSIF service ? 'number' AND service->>'number' ~ '^[0-9]+$' THEN
        quantity := (service->>'number')::INTEGER;
        quantity_field_name := 'number';
        quantity_value := service->>'number';
        found_quantity_field := TRUE;
      -- Check amount field
      ELSIF service ? 'amount' AND service->>'amount' ~ '^[0-9]+$' THEN
        quantity := (service->>'amount')::INTEGER;
        quantity_field_name := 'amount';
        quantity_value := service->>'amount';
        found_quantity_field := TRUE;
      ELSE
        -- Default to 1 if no quantity field found
        quantity := 1;
        quantity_field_name := 'default';
        quantity_value := '1';
      END IF;

      -- Safety check - ensure quantity is at least 1
      IF quantity < 1 THEN
        quantity := 1;
      END IF;
      
      -- LOG DETAILED EXTRACTION INFO
      RAISE NOTICE 'Product: % (ID: %)', product_name, product_id;
      RAISE NOTICE 'Quantity extracted: % (from field: % with value: %)', 
        quantity, quantity_field_name, quantity_value;
      RAISE NOTICE 'Full service JSON: %', service;
      
      -- Get current stock
      IF product_id IS NOT NULL THEN
        -- First try to look up by UUID
        SELECT stock_quantity INTO current_stock
        FROM product_master
        WHERE id = product_id;
      ELSIF service_id IS NOT NULL THEN
        -- If product_id not found but service_id exists, try that
        SELECT stock_quantity INTO current_stock
        FROM product_master
        WHERE id = service_id::UUID;
      ELSIF product_name IS NOT NULL THEN
        -- Last resort - look up by product name
        SELECT stock_quantity INTO current_stock
        FROM product_master
        WHERE name = product_name;
      ELSE
        -- If no identifying information found, skip this item
        RAISE NOTICE 'Could not identify product - skipping';
        CONTINUE;
      END IF;
      
      IF current_stock IS NULL THEN
        RAISE NOTICE 'Product not found in inventory - skipping';
        CONTINUE;
      END IF;

      -- Calculate new stock ensuring exact quantity deduction
      new_stock := GREATEST(0, current_stock - quantity);
      
      -- Update stock directly with the new value
      IF product_id IS NOT NULL THEN
        UPDATE product_master
        SET stock_quantity = new_stock,
            updated_at = NOW()
        WHERE id = product_id;
        
        RAISE NOTICE 'Updated stock for % (ID: %): % -> % (deducted: %)', 
          product_name, product_id, current_stock, new_stock, quantity;
        
        -- Record transaction in product_stock_transactions
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
          product_id,
          'reduction',
          quantity, -- Use the extracted quantity
          current_stock,
          new_stock,
          NEW.id,
          format('FIXED: Stock reduced by %s units via %s (field: %s)', 
                quantity, NEW.type, quantity_field_name),
          CASE WHEN NEW.type = 'sale' THEN 'sale' ELSE 'salon_consumption' END,
          'order',
          CASE WHEN NEW.type = 'sale' THEN 'pos_sale' ELSE 'pos_salon_consumption' END,
          NEW.id || '_' || product_id || '_quantity_fix_' || now()
        );
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Apply the new trigger and remove any conflicting ones
-- =====================================================

-- Drop existing triggers that might interfere
DROP TRIGGER IF EXISTS record_pos_order_stock_change_trigger ON pos_orders;
DROP TRIGGER IF EXISTS record_pos_order_stock_change_debug_trigger ON pos_orders;
DROP TRIGGER IF EXISTS update_product_stock_after_consumption ON pos_orders;
DROP TRIGGER IF EXISTS record_stock_transactions_after_order ON pos_orders;
DROP TRIGGER IF EXISTS order_item_stock_record_trigger ON pos_order_items;

-- Create the new trigger
CREATE TRIGGER fix_pos_order_stock_deduction_trigger
AFTER INSERT ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION fix_pos_order_stock_deduction();

-- =====================================================
-- Completion message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SPECIALIZED FIX FOR QUANTITY EXTRACTION';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'This script specifically analyzes your order structure';
  RAISE NOTICE 'to find where quantities are actually stored.';
  RAISE NOTICE '';
  RAISE NOTICE 'It tries multiple field names: quantity, qty, count, etc.';
  RAISE NOTICE 'And provides detailed logging of what was found.';
  RAISE NOTICE '';
  RAISE NOTICE 'To test: Create a new POS order with multiple units';
  RAISE NOTICE 'The script will print detailed info about what it found.';
  RAISE NOTICE '============================================';
END $$; 