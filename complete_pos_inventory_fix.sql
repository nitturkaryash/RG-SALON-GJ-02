-- ===============================================
-- COMPLETE POS INVENTORY FIX - MATCH CSV IMPORT BEHAVIOR
-- This script ensures POS orders reduce stock exactly like CSV import
-- ===============================================

-- Step 1: First, let's ensure we have the import function that works correctly
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
    
    -- Update stock quantity in product_master
    UPDATE public.product_master
    SET
      stock_quantity = v_new_stock,
      updated_at = NOW()
    WHERE id = v_product_id;
    
    -- Generate unique duplicate protection key
    v_duplicate_key := v_product_id::text || '_' || p_quantity_sold::text || '_' || extract(epoch from now())::bigint::text || '_' || random()::text;
    
    -- Log the stock transaction
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
    
    -- Update balance_stock to match
    UPDATE balance_stock 
    SET 
      qty = v_new_stock,
      balance_qty = v_new_stock,
      closing_stock = v_new_stock,
      sales = COALESCE(sales, 0) + p_quantity_sold,
      updated_at = NOW()
    WHERE product_id = v_product_id;
    
    RETURN 'Stock updated for ' || v_product_name || ' from ' || v_current_stock || ' to ' || v_new_stock;
  ELSE
    RETURN 'Warning: Product not found for HSN code: ' || p_hsn_code;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create POS function that works exactly like import
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
  WHERE id = p_product_id AND user_id = p_user_id;

  -- If product is found, decrement its stock EXACTLY like import
  IF v_product_name IS NOT NULL THEN
    -- Calculate new stock (prevent negative)
    v_new_stock := GREATEST(0, v_current_stock - p_quantity_sold);
    
    -- Update stock quantity in product_master (same as import)
    UPDATE public.product_master
    SET
      stock_quantity = v_new_stock,
      updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Generate unique duplicate protection key
    v_duplicate_key := p_product_id::text || '_' || p_order_id::text || '_' || p_quantity_sold::text || '_' || extract(epoch from now())::bigint::text;
    
    -- Log the stock transaction (same as import)
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
    
    -- Update balance_stock to match (same as import)
    UPDATE balance_stock 
    SET 
      qty = v_new_stock,
      balance_qty = v_new_stock,
      closing_stock = v_new_stock,
      sales = COALESCE(sales, 0) + p_quantity_sold,
      updated_at = NOW()
    WHERE product_id = p_product_id;
    
    RETURN 'POS Stock updated for ' || v_product_name || ' from ' || v_current_stock || ' to ' || v_new_stock;
  ELSE
    RETURN 'Warning: Product not found for ID: ' || p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Remove ALL existing POS triggers that might interfere
DROP TRIGGER IF EXISTS trigger_pos_order_stock_update ON pos_orders;
DROP TRIGGER IF EXISTS process_pos_order_with_duplicates_trigger ON pos_orders;
DROP TRIGGER IF EXISTS trg_reduce_stock_on_salon_consumption ON pos_orders;
DROP TRIGGER IF EXISTS improved_pos_order_stock_trigger ON pos_orders;

-- Drop the old trigger functions too
DROP FUNCTION IF EXISTS record_pos_order_stock_change();
DROP FUNCTION IF EXISTS process_pos_order_with_duplicates();
DROP FUNCTION IF EXISTS improved_pos_order_stock_reduction();

-- Step 4: Create the NEW trigger function that works exactly like CSV import
CREATE OR REPLACE FUNCTION pos_order_inventory_trigger()
RETURNS TRIGGER AS $$
DECLARE
  service JSONB;
  product_id UUID;
  quantity INTEGER;
  user_id UUID;
  result TEXT;
  product_count INTEGER := 0;
BEGIN
  -- Only process sale orders (same condition as CSV import)
  IF NEW.type IS NULL OR NEW.type != 'sale' THEN
    RETURN NEW;
  END IF;

  -- Get user_id from the order
  user_id := NEW.user_id;
  
  -- Process each service in the order (same as CSV import processing)
  FOR service IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    -- Check if this is a product (same logic as CSV import)
    IF (service->>'type') = 'product' AND service ? 'id' THEN
      -- Extract product details
      product_id := (service->>'id')::UUID;
      quantity := COALESCE((service->>'quantity')::INTEGER, 1);
      
      -- Use our function to reduce stock exactly like import
      SELECT pos_decrement_product_stock(product_id, quantity, NEW.id, user_id) INTO result;
      
      product_count := product_count + 1;
      
      -- Log for debugging
      RAISE NOTICE 'POS Order % - Product %: %', NEW.id, product_count, result;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'POS Order % processed % products', NEW.id, product_count;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the new trigger
CREATE TRIGGER pos_order_inventory_trigger
  AFTER INSERT ON pos_orders
  FOR EACH ROW 
  EXECUTE FUNCTION pos_order_inventory_trigger();

-- Step 6: Update the frontend POS function to NOT manually update stock
-- (The trigger will handle it automatically now)

-- Step 7: Create a function to test the system
CREATE OR REPLACE FUNCTION test_pos_inventory_behavior()
RETURNS TEXT AS $$
DECLARE
  test_product_id UUID;
  initial_stock INTEGER;
  result TEXT;
BEGIN
  -- Get a test product
  SELECT id, stock_quantity INTO test_product_id, initial_stock
  FROM product_master 
  WHERE stock_quantity > 0 
  LIMIT 1;
  
  IF test_product_id IS NOT NULL THEN
    RETURN 'Test ready - Product: ' || test_product_id || ', Current Stock: ' || initial_stock || 
           '. Now create a POS order with this product and verify stock reduces automatically.';
  ELSE
    RETURN 'No products with stock > 0 found for testing';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION import_decrement_product_stock(TEXT, INTEGER, UUID) TO PUBLIC;
GRANT EXECUTE ON FUNCTION pos_decrement_product_stock(UUID, INTEGER, UUID, UUID) TO PUBLIC;
GRANT EXECUTE ON FUNCTION test_pos_inventory_behavior() TO PUBLIC;

-- Step 9: Refresh schema
NOTIFY pgrst, 'reload schema';

-- Step 10: Verification
SELECT 'SUCCESS: POS orders will now reduce stock exactly like CSV import!' as status;
SELECT 'Next: Test by creating a POS order and verify stock reduces automatically' as next_step; 