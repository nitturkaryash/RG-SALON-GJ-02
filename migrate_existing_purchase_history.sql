-- =========================================================================
-- MIGRATION SCRIPT FOR EXISTING PURCHASE HISTORY SYSTEMS
-- =========================================================================
-- This script safely migrates an existing purchase_history_with_stock table
-- to the new comprehensive stock calculation system
-- 
-- ⚠️  IMPORTANT: Always backup your data before running this migration!
-- =========================================================================

-- Step 1: Backup existing data
-- =========================================================================

DO $$
BEGIN
  -- Create backup table with timestamp
  EXECUTE format('CREATE TABLE purchase_history_backup_%s AS SELECT * FROM public.purchase_history_with_stock', 
                 to_char(NOW(), 'YYYYMMDD_HH24MISS'));
  RAISE NOTICE 'Backup created: purchase_history_backup_%', to_char(NOW(), 'YYYYMMDD_HH24MISS');
END $$;

-- Step 2: Check existing table structure and add missing columns
-- =========================================================================

-- Add user_id column if it doesn't exist
ALTER TABLE public.purchase_history_with_stock 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'purchase_history_with_stock_user_id_fkey'
  ) THEN
    ALTER TABLE public.purchase_history_with_stock 
    ADD CONSTRAINT purchase_history_with_stock_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add missing columns if they don't exist
ALTER TABLE public.purchase_history_with_stock 
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'purchase';

ALTER TABLE public.purchase_history_with_stock 
ADD COLUMN IF NOT EXISTS "Purchase_Cost/Unit(Ex.GST)" NUMERIC;

ALTER TABLE public.purchase_history_with_stock 
ADD COLUMN IF NOT EXISTS price_inlcuding_disc NUMERIC;

ALTER TABLE public.purchase_history_with_stock 
ADD COLUMN IF NOT EXISTS tax_inlcuding_disc NUMERIC;

-- Step 3: Update existing records with user_id (if needed)
-- =========================================================================

-- Check if we need to assign user_id to existing records
DO $$
DECLARE
  unassigned_count INTEGER;
  default_user_id UUID;
BEGIN
  -- Count records without user_id
  SELECT COUNT(*) INTO unassigned_count 
  FROM public.purchase_history_with_stock 
  WHERE user_id IS NULL;
  
  IF unassigned_count > 0 THEN
    -- Try to find a default user (you may need to adjust this logic)
    SELECT id INTO default_user_id 
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF default_user_id IS NOT NULL THEN
      UPDATE public.purchase_history_with_stock 
      SET user_id = default_user_id 
      WHERE user_id IS NULL;
      
      RAISE NOTICE 'Updated % records with default user_id: %', unassigned_count, default_user_id;
    ELSE
      RAISE WARNING 'No user found in profiles table. You need to manually assign user_id values.';
    END IF;
  ELSE
    RAISE NOTICE 'All records already have user_id assigned';
  END IF;
END $$;

-- Step 4: Drop existing triggers (if any) to avoid conflicts
-- =========================================================================

DROP TRIGGER IF EXISTS handle_auth_user_id_trigger ON public.purchase_history_with_stock;
DROP TRIGGER IF EXISTS handle_purchase_history_user_id_trigger ON public.purchase_history_with_stock;
DROP TRIGGER IF EXISTS trg_purchase_history_changes ON public.purchase_history_with_stock;

-- Step 5: Apply the new functions and triggers
-- =========================================================================

-- Helper function for user authentication
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

-- Helper function for purchase history user ID assignment
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

-- Core stock calculation function
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

-- Historical stock recalculation function
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

-- Main trigger function for purchase history changes
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

-- Step 6: Create the new triggers
-- =========================================================================

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

-- Step 7: Create/Update indexes for performance
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id 
  ON public.purchase_history_with_stock USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_purchase_history_product_name 
  ON public.purchase_history_with_stock USING btree (product_name);

CREATE INDEX IF NOT EXISTS idx_purchase_history_date 
  ON public.purchase_history_with_stock USING btree (date);

CREATE INDEX IF NOT EXISTS idx_purchase_history_user_product_date 
  ON public.purchase_history_with_stock USING btree (user_id, product_name, date);

-- Additional performance indexes for related tables
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_user_product_date 
  ON public.inventory_purchases USING btree (user_id, product_name, date);

CREATE INDEX IF NOT EXISTS idx_inventory_sales_user_product_date 
  ON public.inventory_sales_new USING btree (user_id, product_name, date);

CREATE INDEX IF NOT EXISTS idx_inventory_consumption_user_product_date 
  ON public.inventory_consumption USING btree (user_id, product_name, date);

-- Step 8: Create utility functions
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

-- Step 9: Recalculate all existing data
-- =========================================================================

DO $$
DECLARE
  user_record RECORD;
  recalc_result JSONB;
  total_users INTEGER := 0;
  total_records_updated INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting recalculation of all existing purchase history data...';
  
  -- Recalculate for each user
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.purchase_history_with_stock 
    WHERE user_id IS NOT NULL
  LOOP
    recalc_result := public.recalculate_all_user_stock(user_record.user_id);
    total_users := total_users + 1;
    total_records_updated := total_records_updated + (recalc_result->>'total_updated_records')::INTEGER;
    
    RAISE NOTICE 'Recalculated % records for user %', 
                 (recalc_result->>'total_updated_records')::INTEGER, 
                 user_record.user_id;
  END LOOP;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Total users processed: %', total_users;
  RAISE NOTICE 'Total records updated: %', total_records_updated;
END $$;

-- Step 10: Validation and verification
-- =========================================================================

-- Validate that all calculations are correct
WITH validation AS (
  SELECT 
    purchase_id,
    product_name,
    date,
    user_id,
    current_stock_at_purchase as stored_stock,
    public.calculate_current_stock_at_date(product_name, date::DATE, user_id) as calculated_stock
  FROM public.purchase_history_with_stock 
  WHERE user_id IS NOT NULL
)
SELECT 
  'MIGRATION VALIDATION' as status,
  COUNT(*) as total_records,
  COUNT(CASE WHEN stored_stock = calculated_stock THEN 1 END) as correct_calculations,
  COUNT(CASE WHEN stored_stock != calculated_stock THEN 1 END) as incorrect_calculations,
  CASE 
    WHEN COUNT(CASE WHEN stored_stock != calculated_stock THEN 1 END) = 0 
    THEN '✅ MIGRATION SUCCESSFUL - ALL CALCULATIONS CORRECT'
    ELSE '❌ MIGRATION ISSUES - SOME CALCULATIONS INCORRECT'
  END as overall_status
FROM validation;

-- Show summary of migrated data
SELECT 
  'MIGRATION SUMMARY' as summary,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT product_name) as unique_products,
  COUNT(*) as total_purchase_records,
  MIN(date) as earliest_purchase,
  MAX(date) as latest_purchase,
  SUM(current_stock_at_purchase * mrp_incl_gst) as total_stock_value
FROM public.purchase_history_with_stock;

-- Create documentation
COMMENT ON TABLE public.purchase_history_with_stock IS 
'Purchase history table with automatic stock calculation. Migrated on ' || NOW() || ' with comprehensive stock management features.';

RAISE NOTICE '=== MIGRATION COMPLETED SUCCESSFULLY ===';
RAISE NOTICE 'Your purchase_history_with_stock table now supports:';
RAISE NOTICE '1. ✅ Historical date insertions with automatic stock recalculation';
RAISE NOTICE '2. ✅ Purchase deletions with proper stock adjustments';
RAISE NOTICE '3. ✅ Purchase updates with automatic propagation';
RAISE NOTICE '4. ✅ Multi-user data isolation';
RAISE NOTICE '5. ✅ Comprehensive stock value calculations';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '- Test the system with your existing workflows';
RAISE NOTICE '- Monitor performance and adjust indexes if needed';
RAISE NOTICE '- Use the utility functions for manual recalculations when needed';