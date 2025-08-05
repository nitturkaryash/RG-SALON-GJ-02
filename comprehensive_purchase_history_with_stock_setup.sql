-- =========================================================================
-- COMPREHENSIVE PURCHASE HISTORY WITH STOCK TABLE SETUP
-- =========================================================================
-- This script creates the purchase_history_with_stock table with complete
-- stock calculation logic that handles:
-- 1. Historical date insertions
-- 2. Purchase deletions with proper stock recalculation
-- 3. Purchase updates with automatic stock adjustments
-- 4. Multi-user data isolation
-- =========================================================================

-- Step 1: Create the table with all required columns and constraints
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.purchase_history_with_stock (
  purchase_id uuid NOT NULL,
  date timestamp without time zone NOT NULL,
  product_id uuid NULL,
  product_name text NULL,
  hsn_code text NULL,
  units text NULL,
  purchase_invoice_number text NULL,
  purchase_qty integer NULL,
  mrp_incl_gst numeric NULL,
  mrp_excl_gst numeric NULL,
  discount_on_purchase_percentage numeric NULL,
  gst_percentage numeric NULL,
  purchase_taxable_value numeric NULL,
  purchase_igst numeric NULL,
  purchase_cgst numeric NULL,
  purchase_sgst numeric NULL,
  purchase_invoice_value_rs numeric NULL,
  supplier text NULL,
  current_stock_at_purchase integer NULL,
  computed_stock_taxable_value numeric NULL,
  computed_stock_igst numeric NULL,
  computed_stock_cgst numeric NULL,
  computed_stock_sgst numeric NULL,
  computed_stock_total_value numeric NULL,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  tax_inlcuding_disc numeric NULL,
  user_id uuid NULL,
  "Purchase_Cost/Unit(Ex.GST)" numeric NULL,
  transaction_type text NULL DEFAULT 'purchase'::text,
  price_inlcuding_disc numeric NULL,
  
  CONSTRAINT purchase_history_with_stock_pkey PRIMARY KEY (purchase_id),
  CONSTRAINT purchase_history_with_stock_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Step 2: Create indexes for optimal performance
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id 
  ON public.purchase_history_with_stock USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_purchase_history_product_name 
  ON public.purchase_history_with_stock USING btree (product_name) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_purchase_history_date 
  ON public.purchase_history_with_stock USING btree (date) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_purchase_history_user_product_date 
  ON public.purchase_history_with_stock USING btree (user_id, product_name, date) TABLESPACE pg_default;

-- Additional performance indexes for related tables
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_user_product_date 
  ON public.inventory_purchases USING btree (user_id, product_name, date) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_inventory_sales_user_product_date 
  ON public.inventory_sales_new USING btree (user_id, product_name, date) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_inventory_consumption_user_product_date 
  ON public.inventory_consumption USING btree (user_id, product_name, date) TABLESPACE pg_default;

-- Step 3: Create helper functions for user authentication
-- =========================================================================

-- Function to handle auth user ID assignment
CREATE OR REPLACE FUNCTION public.handle_auth_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user_id is not set, try to get from current session
  IF NEW.user_id IS NULL THEN
    NEW.user_id := (
      SELECT id FROM public.profiles 
      WHERE auth_user_id = auth.uid() 
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Function to handle purchase history user ID assignment
CREATE OR REPLACE FUNCTION public.handle_purchase_history_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user_id is not set, try to get from current session
  IF NEW.user_id IS NULL THEN
    NEW.user_id := (
      SELECT id FROM public.profiles 
      WHERE auth_user_id = auth.uid() 
      LIMIT 1
    );
  END IF;
  -- Set updated_at timestamp
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Step 4: Core stock calculation functions
-- =========================================================================

-- Function to calculate current stock at a specific date for a user
CREATE OR REPLACE FUNCTION public.calculate_current_stock_at_date(
  product_name_param TEXT,
  date_param DATE,
  user_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_purchases INTEGER := 0;
  total_sales INTEGER := 0;
  total_consumption INTEGER := 0;
  current_stock INTEGER := 0;
BEGIN
  -- Calculate total purchases up to the date
  SELECT COALESCE(SUM(purchase_qty), 0) INTO total_purchases
  FROM public.inventory_purchases
  WHERE product_name = product_name_param 
    AND date <= date_param
    AND user_id = user_id_param;

  -- Calculate total sales up to the date  
  SELECT COALESCE(SUM(quantity), 0) INTO total_sales
  FROM public.inventory_sales_new
  WHERE product_name = product_name_param 
    AND date <= date_param
    AND user_id = user_id_param;

  -- Calculate total consumption up to the date
  SELECT COALESCE(SUM(consumption_qty), 0) INTO total_consumption
  FROM public.inventory_consumption
  WHERE product_name = product_name_param 
    AND date <= date_param
    AND user_id = user_id_param;

  -- Calculate current stock
  current_stock := total_purchases - total_sales - total_consumption;
  
  -- Ensure stock doesn't go below 0
  RETURN GREATEST(current_stock, 0);
END;
$$;

-- Step 5: Historical stock recalculation functions
-- =========================================================================

-- Function to recalculate stock for all purchase records after a specific date
CREATE OR REPLACE FUNCTION public.recalculate_stock_from_date(
  product_name_param TEXT,
  from_date_param DATE,
  user_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER := 0;
  purchase_record RECORD;
  new_stock INTEGER;
BEGIN
  -- Process all purchase records for the product from the specified date onwards
  FOR purchase_record IN 
    SELECT purchase_id, date, product_name, mrp_incl_gst, mrp_excl_gst, gst_percentage,
           purchase_igst, purchase_cgst, purchase_sgst
    FROM public.purchase_history_with_stock
    WHERE product_name = product_name_param 
      AND date >= from_date_param
      AND user_id = user_id_param
    ORDER BY date ASC, created_at ASC
  LOOP
    -- Calculate new current stock for this record
    new_stock := public.calculate_current_stock_at_date(
      product_name_param, 
      purchase_record.date::DATE, 
      user_id_param
    );

    -- Update the record with new stock calculations
    UPDATE public.purchase_history_with_stock
    SET 
      current_stock_at_purchase = new_stock,
      -- Recalculate all computed stock values
      computed_stock_taxable_value = new_stock * COALESCE(purchase_record.mrp_excl_gst, 0),
      computed_stock_igst = CASE 
        WHEN COALESCE(purchase_record.purchase_igst, 0) > 0 THEN
          new_stock * COALESCE(purchase_record.mrp_excl_gst, 0) * (COALESCE(purchase_record.gst_percentage, 18) / 100.0)
        ELSE 0
      END,
      computed_stock_cgst = CASE 
        WHEN COALESCE(purchase_record.purchase_cgst, 0) > 0 THEN
          new_stock * COALESCE(purchase_record.mrp_excl_gst, 0) * (COALESCE(purchase_record.gst_percentage, 18) / 200.0)
        ELSE 0
      END,
      computed_stock_sgst = CASE 
        WHEN COALESCE(purchase_record.purchase_sgst, 0) > 0 THEN
          new_stock * COALESCE(purchase_record.mrp_excl_gst, 0) * (COALESCE(purchase_record.gst_percentage, 18) / 200.0)
        ELSE 0
      END,
      computed_stock_total_value = new_stock * COALESCE(purchase_record.mrp_incl_gst, 0),
      updated_at = NOW()
    WHERE purchase_id = purchase_record.purchase_id;

    updated_count := updated_count + 1;
  END LOOP;

  RETURN updated_count;
END;
$$;

-- Step 6: Main trigger function for purchase history changes
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_purchase_history_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_product_name TEXT;
  affected_date DATE;
  affected_user_id UUID;
  updated_count INTEGER;
BEGIN
  -- Handle INSERT operations
  IF TG_OP = 'INSERT' THEN
    affected_product_name := NEW.product_name;
    affected_date := NEW.date::DATE;
    affected_user_id := NEW.user_id;
    
    -- Calculate and set current stock for the new record
    NEW.current_stock_at_purchase := public.calculate_current_stock_at_date(
      affected_product_name, 
      affected_date, 
      affected_user_id
    );
    
    -- Calculate computed values
    NEW.computed_stock_taxable_value := NEW.current_stock_at_purchase * COALESCE(NEW.mrp_excl_gst, 0);
    NEW.computed_stock_igst := CASE 
      WHEN COALESCE(NEW.purchase_igst, 0) > 0 THEN
        NEW.current_stock_at_purchase * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 100.0)
      ELSE 0
    END;
    NEW.computed_stock_cgst := CASE 
      WHEN COALESCE(NEW.purchase_cgst, 0) > 0 THEN
        NEW.current_stock_at_purchase * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 200.0)
      ELSE 0
    END;
    NEW.computed_stock_sgst := CASE 
      WHEN COALESCE(NEW.purchase_sgst, 0) > 0 THEN
        NEW.current_stock_at_purchase * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 200.0)
      ELSE 0
    END;
    NEW.computed_stock_total_value := NEW.current_stock_at_purchase * COALESCE(NEW.mrp_incl_gst, 0);
    
    -- After insert, recalculate all subsequent records
    PERFORM public.recalculate_stock_from_date(
      affected_product_name, 
      affected_date + interval '1 day', 
      affected_user_id
    );
    
    RETURN NEW;
  END IF;

  -- Handle UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    affected_product_name := NEW.product_name;
    affected_date := NEW.date::DATE;
    affected_user_id := NEW.user_id;
    
    -- Recalculate stock for this record and all subsequent records
    NEW.current_stock_at_purchase := public.calculate_current_stock_at_date(
      affected_product_name, 
      affected_date, 
      affected_user_id
    );
    
    -- Recalculate computed values
    NEW.computed_stock_taxable_value := NEW.current_stock_at_purchase * COALESCE(NEW.mrp_excl_gst, 0);
    NEW.computed_stock_igst := CASE 
      WHEN COALESCE(NEW.purchase_igst, 0) > 0 THEN
        NEW.current_stock_at_purchase * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 100.0)
      ELSE 0
    END;
    NEW.computed_stock_cgst := CASE 
      WHEN COALESCE(NEW.purchase_cgst, 0) > 0 THEN
        NEW.current_stock_at_purchase * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 200.0)
      ELSE 0
    END;
    NEW.computed_stock_sgst := CASE 
      WHEN COALESCE(NEW.purchase_sgst, 0) > 0 THEN
        NEW.current_stock_at_purchase * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 200.0)
      ELSE 0
    END;
    NEW.computed_stock_total_value := NEW.current_stock_at_purchase * COALESCE(NEW.mrp_incl_gst, 0);
    
    -- Update timestamp
    NEW.updated_at := NOW();
    
    -- After update, recalculate all subsequent records
    PERFORM public.recalculate_stock_from_date(
      affected_product_name, 
      affected_date + interval '1 day', 
      affected_user_id
    );
    
    RETURN NEW;
  END IF;

  -- Handle DELETE operations
  IF TG_OP = 'DELETE' THEN
    affected_product_name := OLD.product_name;
    affected_date := OLD.date::DATE;
    affected_user_id := OLD.user_id;
    
    -- After delete, recalculate all records from this date onwards
    PERFORM public.recalculate_stock_from_date(
      affected_product_name, 
      affected_date, 
      affected_user_id
    );
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Step 7: Create triggers
-- =========================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_auth_user_id_trigger ON public.purchase_history_with_stock;
DROP TRIGGER IF EXISTS handle_purchase_history_user_id_trigger ON public.purchase_history_with_stock;
DROP TRIGGER IF EXISTS trg_purchase_history_changes ON public.purchase_history_with_stock;

-- Create auth user ID trigger
CREATE TRIGGER handle_auth_user_id_trigger 
  BEFORE INSERT OR UPDATE ON public.purchase_history_with_stock 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_auth_user_id();

-- Create purchase history user ID trigger
CREATE TRIGGER handle_purchase_history_user_id_trigger 
  BEFORE INSERT OR UPDATE ON public.purchase_history_with_stock 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_purchase_history_user_id();

-- Create main purchase history changes trigger
CREATE TRIGGER trg_purchase_history_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.purchase_history_with_stock 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_purchase_history_changes();

-- Step 8: Utility functions for manual operations
-- =========================================================================

-- Function to manually recalculate all stock for a specific product
CREATE OR REPLACE FUNCTION public.recalculate_product_stock(
  product_name_param TEXT,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER := 0;
  earliest_date DATE;
BEGIN
  -- Find the earliest purchase date for this product
  SELECT MIN(date::DATE) INTO earliest_date
  FROM public.purchase_history_with_stock
  WHERE product_name = product_name_param 
    AND user_id = user_id_param;

  IF earliest_date IS NOT NULL THEN
    -- Recalculate from the earliest date
    updated_count := public.recalculate_stock_from_date(
      product_name_param, 
      earliest_date, 
      user_id_param
    );
  END IF;

  RETURN jsonb_build_object(
    'product_name', product_name_param,
    'user_id', user_id_param,
    'updated_records', updated_count,
    'earliest_date', earliest_date,
    'recalculated_at', NOW()
  );
END;
$$;

-- Function to recalculate all products for a user
CREATE OR REPLACE FUNCTION public.recalculate_all_user_stock(
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_name TEXT;
  total_updated INTEGER := 0;
  results JSONB := '[]'::JSONB;
  product_result JSONB;
BEGIN
  -- Process each unique product for the user
  FOR product_name IN 
    SELECT DISTINCT phs.product_name
    FROM public.purchase_history_with_stock phs
    WHERE phs.user_id = user_id_param
    ORDER BY phs.product_name
  LOOP
    -- Recalculate stock for this product
    product_result := public.recalculate_product_stock(product_name, user_id_param);
    results := results || jsonb_build_array(product_result);
    total_updated := total_updated + (product_result->>'updated_records')::INTEGER;
  END LOOP;

  RETURN jsonb_build_object(
    'user_id', user_id_param,
    'total_updated_records', total_updated,
    'products_processed', jsonb_array_length(results),
    'details', results,
    'completed_at', NOW()
  );
END;
$$;

-- Step 9: Documentation and examples
-- =========================================================================

-- Create comments for documentation
COMMENT ON TABLE public.purchase_history_with_stock IS 
'Purchase history table with automatic stock calculation. Handles historical date insertions, updates, and deletions with proper stock recalculation.';

COMMENT ON FUNCTION public.calculate_current_stock_at_date(TEXT, DATE, UUID) IS 
'Calculates current stock for a product at a specific date for a user. Formula: Total Purchases - Total Sales - Total Consumption';

COMMENT ON FUNCTION public.recalculate_stock_from_date(TEXT, DATE, UUID) IS 
'Recalculates stock for all purchase records of a product from a specific date onwards';

COMMENT ON FUNCTION public.handle_purchase_history_changes() IS 
'Main trigger function that handles stock recalculation when purchase records are inserted, updated, or deleted';

-- =========================================================================
-- USAGE EXAMPLES AND SCENARIOS
-- =========================================================================

/*
SCENARIO 1: Adding a historical purchase (older date)
========================================================
When you add a purchase with an older date, the system will:
1. Calculate the correct stock at that historical date
2. Automatically recalculate stock for all subsequent purchases

Example:
- Current data: Purchase on 8/6/2025, stock = 2 tubes
- Add: Purchase on 8/5/2025, qty = 1 tube
- Result: 
  * 8/5/2025 record will show stock = 1 tube
  * 8/6/2025 record will be updated to show stock = 3 tubes

SCENARIO 2: Deleting an old purchase
===================================
When you delete an old purchase, the system will:
1. Remove the purchase record
2. Recalculate stock for all remaining purchases from that date onwards

Example:
- Before: Purchase 1 (8/5/2025, 1 tube), Purchase 2 (8/6/2025, 2 tubes) = stock 3
- Delete Purchase 1
- After: Purchase 2 (8/6/2025, 2 tubes) = stock 2

SCENARIO 3: Updating purchase quantity
=====================================
When you update a purchase quantity, the system will:
1. Recalculate stock for that record
2. Update all subsequent records automatically

Example:
- Before: Purchase (8/5/2025, 1 tube) = stock 1
- Update to: Purchase (8/5/2025, 3 tubes) = stock 3
- All subsequent purchases will reflect the +2 tube increase

MANUAL OPERATIONS:
==================
-- Recalculate stock for a specific product:
SELECT public.recalculate_product_stock('Product Name', 'user-uuid-here');

-- Recalculate all products for a user:
SELECT public.recalculate_all_user_stock('user-uuid-here');

-- Check current stock calculation for verification:
SELECT public.calculate_current_stock_at_date('Product Name', '2025-08-06', 'user-uuid-here');
*/