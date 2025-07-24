-- ===============================================
-- FIX POS INVENTORY SYSTEM TO MATCH CSV IMPORT
-- This script ensures POS orders reduce stock exactly like CSV import
-- ===============================================

-- Step 1: Create or replace the import_decrement_product_stock function
-- This is the function used by CSV import that works correctly
CREATE OR REPLACE FUNCTION import_decrement_product_stock(
  p_hsn_code TEXT,
  p_quantity_sold INTEGER,
  p_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_product_id UUID;
  v_product_name TEXT;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_duplicate_key TEXT;
BEGIN
  -- Find the product by HSN code and user ID
  SELECT id, name, stock_quantity INTO v_product_id, v_product_name, v_current_stock
  FROM public.product_master
  WHERE hsn_code = p_hsn_code AND user_id = p_user_id;

  -- If product is found, decrement its stock
  IF v_product_id IS NOT NULL THEN
    -- Calculate new stock (prevent negative)
    v_new_stock := GREATEST(0, v_current_stock - p_quantity_sold);
    
    -- Update stock quantity
    UPDATE public.product_master
    SET
      stock_quantity = v_new_stock,
      updated_at = NOW()
    WHERE id = v_product_id;
    
    -- Generate unique duplicate protection key
    v_duplicate_key := v_product_id::text || '_' || p_quantity_sold::text || '_' || extract(epoch from now())::bigint::text || '_' || random()::text;
    
    -- Log the stock transaction with conflict handling
    INSERT INTO public.product_stock_transactions (
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      notes,
      source,
      duplicate_protection_key,
      user_id,
      created_at
    ) VALUES (
      v_product_id,
      'reduction',
      p_quantity_sold,
      v_current_stock,
      v_new_stock,
      'Stock decrement from import via RPC',
      'import',
      v_duplicate_key,
      p_user_id,
      NOW()
    )
    ON CONFLICT (duplicate_protection_key) DO NOTHING;
    
    -- Update balance_stock if it exists
    UPDATE balance_stock 
    SET 
      qty = v_new_stock,
      balance_qty = v_new_stock,
      closing_stock = v_new_stock,
      updated_at = NOW()
    WHERE product_id = v_product_id;
    
    RETURN 'Stock updated for ' || v_product_name || ' from ' || v_current_stock || ' to ' || v_new_stock;
  ELSE
    RETURN 'Warning: Product not found for HSN code: ' || p_hsn_code;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a function to handle POS stock reduction exactly like import
CREATE OR REPLACE FUNCTION pos_decrement_product_stock(
  p_product_id UUID,
  p_quantity_sold INTEGER,
  p_order_id UUID,
  p_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_product_name TEXT;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_duplicate_key TEXT;
BEGIN
  -- Get product details
  SELECT name, stock_quantity INTO v_product_name, v_current_stock
  FROM public.product_master
  WHERE id = p_product_id;

  -- If product is found, decrement its stock
  IF v_product_name IS NOT NULL THEN
    -- Calculate new stock (prevent negative)
    v_new_stock := GREATEST(0, v_current_stock - p_quantity_sold);
    
    -- Update stock quantity
    UPDATE public.product_master
    SET
      stock_quantity = v_new_stock,
      updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Generate unique duplicate protection key
    v_duplicate_key := p_product_id::text || '_' || p_order_id::text || '_' || p_quantity_sold::text || '_' || extract(epoch from now())::bigint::text;
    
    -- Log the stock transaction with conflict handling
    INSERT INTO public.product_stock_transactions (
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      order_id,
      notes,
      source,
      duplicate_protection_key,
      user_id,
      created_at
    ) VALUES (
      p_product_id,
      'reduction',
      p_quantity_sold,
      v_current_stock,
      v_new_stock,
      p_order_id,
      'Stock decrement from POS order',
      'pos_order',
      v_duplicate_key,
      p_user_id,
      NOW()
    )
    ON CONFLICT (duplicate_protection_key) DO NOTHING;
    
    -- Update balance_stock if it exists
    UPDATE balance_stock 
    SET 
      qty = v_new_stock,
      balance_qty = v_new_stock,
      closing_stock = v_new_stock,
      updated_at = NOW()
    WHERE product_id = p_product_id;
    
    RETURN 'Stock updated for ' || v_product_name || ' from ' || v_current_stock || ' to ' || v_new_stock;
  ELSE
    RETURN 'Warning: Product not found for ID: ' || p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Replace the existing POS order trigger with a better one
-- Drop existing triggers that may conflict
DROP TRIGGER IF EXISTS trigger_pos_order_stock_update ON pos_orders;
DROP TRIGGER IF EXISTS process_pos_order_with_duplicates_trigger ON pos_orders;
DROP TRIGGER IF EXISTS trg_reduce_stock_on_salon_consumption ON pos_orders;

-- Create new improved trigger function
CREATE OR REPLACE FUNCTION improved_pos_order_stock_reduction()
RETURNS TRIGGER AS $$
DECLARE
  service JSONB;
  product_id UUID;
  quantity INTEGER;
  user_id UUID;
  result TEXT;
BEGIN
  -- Skip if not a sale type order
  IF NEW.type IS NULL OR NEW.type != 'sale' THEN
    RETURN NEW;
  END IF;

  -- Get user_id from the order
  user_id := NEW.user_id;
  
  -- Process each service in the order
  FOR service IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    -- Check if this is a product
    IF (service->>'type') = 'product' AND service ? 'id' THEN
      -- Extract product details
      product_id := (service->>'id')::UUID;
      quantity := COALESCE((service->>'quantity')::INTEGER, 1);
      
      -- Use our new function to reduce stock exactly like import
      SELECT pos_decrement_product_stock(product_id, quantity, NEW.id, user_id) INTO result;
      
      -- Log the result for debugging
      RAISE NOTICE 'POS Stock Update: %', result;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
CREATE TRIGGER improved_pos_order_stock_trigger
  AFTER INSERT ON pos_orders
  FOR EACH ROW 
  EXECUTE FUNCTION improved_pos_order_stock_reduction();

-- Step 4: Create a function to manually fix existing POS orders that didn't reduce stock
CREATE OR REPLACE FUNCTION fix_existing_pos_orders()
RETURNS TEXT AS $$
DECLARE
  order_record RECORD;
  service JSONB;
  product_id UUID;
  quantity INTEGER;
  user_id UUID;
  result TEXT;
  total_fixed INTEGER := 0;
BEGIN
  -- Process all existing POS orders that are sales
  FOR order_record IN 
    SELECT id, services, user_id, created_at
    FROM pos_orders 
    WHERE type = 'sale' 
    AND created_at > NOW() - INTERVAL '30 days'  -- Only recent orders
    ORDER BY created_at DESC
  LOOP
    -- Process each service in the order
    FOR service IN SELECT * FROM jsonb_array_elements(order_record.services)
    LOOP
      -- Check if this is a product
      IF (service->>'type') = 'product' AND service ? 'id' THEN
        -- Extract product details
        product_id := (service->>'id')::UUID;
        quantity := COALESCE((service->>'quantity')::INTEGER, 1);
        user_id := order_record.user_id;
        
        -- Check if transaction already exists
        IF NOT EXISTS (
          SELECT 1 FROM product_stock_transactions 
          WHERE order_id = order_record.id 
          AND product_id = product_id
        ) THEN
          -- Use our function to reduce stock
          SELECT pos_decrement_product_stock(product_id, quantity, order_record.id, user_id) INTO result;
          total_fixed := total_fixed + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN 'Fixed stock for ' || total_fixed || ' product entries from existing POS orders';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Grant necessary permissions
GRANT EXECUTE ON FUNCTION import_decrement_product_stock(TEXT, INTEGER, UUID) TO PUBLIC;
GRANT EXECUTE ON FUNCTION pos_decrement_product_stock(UUID, INTEGER, UUID, UUID) TO PUBLIC;
GRANT EXECUTE ON FUNCTION fix_existing_pos_orders() TO PUBLIC;

-- Step 6: Refresh schema
NOTIFY pgrst, 'reload schema';

-- Final verification message
SELECT 'POS Inventory System Fixed: Now POS orders will reduce stock exactly like CSV import' as status; 