-- FIX FOR DUPLICATE PRODUCT ENTRIES IN SERVICES ARRAY
-- When an order has multiple entries of the same product, each with quantity=1

-- =====================================================
-- Create a function that aggregates identical products
-- =====================================================

CREATE OR REPLACE FUNCTION process_pos_order_with_duplicates()
RETURNS TRIGGER AS $$
DECLARE
  service jsonb;
  product_id_text TEXT;
  product_id UUID;
  product_name TEXT;
  current_stock INTEGER;
  new_stock INTEGER;
  existing_transaction BOOLEAN;
  -- Create a map to store aggregated quantities by product_id
  product_quantities JSONB := '{}'::JSONB;
BEGIN
  -- Skip if this isn't a sale or insertion
  IF TG_OP != 'INSERT' OR (NEW.type != 'sale' AND NEW.type != 'salon_consumption') THEN
    RETURN NEW;
  END IF;
  
  RAISE NOTICE 'Processing order % with % services', NEW.id, jsonb_array_length(NEW.services);
  
  -- First pass: Count how many times each product appears, aggregating quantity
  FOR service IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    -- Only process products
    IF service->>'type' = 'product' THEN
      product_id_text := service->>'product_id';
      IF product_id_text IS NULL THEN
        product_id_text := service->>'service_id';
      END IF;
      
      -- Skip if no product ID found
      IF product_id_text IS NULL THEN
        CONTINUE;
      END IF;
      
      -- Extract quantity, defaulting to 1 if not specified
      DECLARE
        item_quantity INTEGER := 1; -- Default to 1
      BEGIN
        IF service ? 'quantity' AND service->>'quantity' ~ '^[0-9]+$' THEN
          item_quantity := (service->>'quantity')::INTEGER;
        END IF;
      END;
      
      -- Record product ID and increment its count
      IF product_quantities ? product_id_text THEN
        -- Product already exists, increment count
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id_text],
          to_jsonb((product_quantities->>product_id_text)::INTEGER + item_quantity)
        );
      ELSE
        -- First occurrence of this product
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id_text],
          to_jsonb(item_quantity)
        );
      END IF;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Aggregated product quantities: %', product_quantities;
  
  -- Second pass: Update stock for each unique product
  FOR product_id_text IN SELECT * FROM jsonb_object_keys(product_quantities)
  LOOP
    -- Convert text ID to UUID
    product_id := product_id_text::UUID;
    
    -- Get product info and current stock
    SELECT name, stock_quantity INTO product_name, current_stock
    FROM product_master
    WHERE id = product_id;
    
    IF product_name IS NULL THEN
      RAISE NOTICE 'Product with ID % not found, skipping', product_id;
      CONTINUE;
    END IF;
    
    -- Get total quantity for this product from our aggregated map
    DECLARE
      total_quantity INTEGER := (product_quantities->>product_id_text)::INTEGER;
      protection_key TEXT := NEW.id || '_' || product_id || '_grouped_' || to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
      system_protection_key TEXT := product_id || '_' || current_stock || '_' || (current_stock - total_quantity) || '_' || extract(epoch from now());
    BEGIN
      -- Ensure quantity is at least 1
      IF total_quantity < 1 THEN
        total_quantity := 1;
      END IF;
      
      -- Check if a transaction already exists for this product and order
      -- Check both the grouped and system protection keys, including manual reductions
      SELECT EXISTS (
        SELECT 1 FROM product_stock_transactions 
        WHERE (
          (order_id = NEW.id AND product_id = product_id)
          OR (
            order_id IS NULL 
            AND product_id = product_id 
            AND source = 'manual_reduction'
            AND previous_stock = current_stock
            AND new_stock = (current_stock - total_quantity)
          )
        )
        AND (
          duplicate_protection_key LIKE NEW.id || '_' || product_id || '_grouped_%'
          OR duplicate_protection_key LIKE product_id || '_' || current_stock || '_' || (current_stock - total_quantity) || '_%'
        )
      ) INTO existing_transaction;
      
      IF existing_transaction THEN
        RAISE NOTICE 'Transaction already exists for product % in order %, skipping', product_id, NEW.id;
        CONTINUE;
      END IF;
      
      RAISE NOTICE 'Processing product % (ID: %): deducting % units from stock of %', 
        product_name, product_id, total_quantity, current_stock;
      
      -- Calculate new stock
      new_stock := GREATEST(0, current_stock - total_quantity);
      
      -- Update the product_master table
      UPDATE product_master
      SET stock_quantity = new_stock,
          updated_at = NOW()
      WHERE id = product_id;
      
      -- Record a SINGLE transaction for all units of this product
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
        total_quantity,
        current_stock,
        new_stock,
        NEW.id,
        format('GROUPED: Stock reduced by %s units from %s entries', 
              total_quantity, total_quantity),
        CASE WHEN NEW.type = 'sale' THEN 'sale' ELSE 'salon_consumption' END,
        'order',
        CASE WHEN NEW.type = 'sale' THEN 'pos_sale' ELSE 'pos_salon_consumption' END,
        protection_key
      );
      
      RAISE NOTICE 'Updated stock for %: % -> % (deducted %)', 
        product_name, current_stock, new_stock, total_quantity;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Apply the new trigger
-- =====================================================

-- Drop existing triggers that might interfere
DROP TRIGGER IF EXISTS fix_pos_order_stock_deduction_trigger ON pos_orders;
DROP TRIGGER IF EXISTS record_pos_order_stock_change_trigger ON pos_orders;
DROP TRIGGER IF EXISTS record_pos_order_stock_change_debug_trigger ON pos_orders;
DROP TRIGGER IF EXISTS update_product_stock_after_consumption ON pos_orders;
DROP TRIGGER IF EXISTS record_stock_transactions_after_order ON pos_orders;
DROP TRIGGER IF EXISTS order_item_stock_record_trigger ON pos_order_items;
DROP TRIGGER IF EXISTS process_pos_order_with_duplicates_trigger ON pos_orders;

-- Create the new trigger
CREATE TRIGGER process_pos_order_with_duplicates_trigger
AFTER INSERT ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION process_pos_order_with_duplicates();

-- =====================================================
-- Completion message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'FIXED DUPLICATE PRODUCT ENTRIES ISSUE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'This script addresses the specific issue where:';
  RAISE NOTICE '1. The same product appears multiple times in the order';
  RAISE NOTICE '2. Each entry has quantity=1';
  RAISE NOTICE '';
  RAISE NOTICE 'Now the system will:';
  RAISE NOTICE '1. Count the total number of each unique product';
  RAISE NOTICE '2. Apply a single stock deduction for the total quantity';
  RAISE NOTICE '3. Show one transaction entry with the full amount';
  RAISE NOTICE '4. Prevent duplicate transactions for the same product/order';
  RAISE NOTICE '5. Check both grouped and system protection keys';
  RAISE NOTICE '6. Handle manual reduction entries';
  RAISE NOTICE '';
  RAISE NOTICE 'Example: 3 separate entries of the same product';
  RAISE NOTICE 'will now deduct 3 units in a single transaction';
  RAISE NOTICE '============================================';
END $$; 