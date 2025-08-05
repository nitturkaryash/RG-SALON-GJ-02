-- Purchase Delete Stock Recalculation Functions
-- Apply these functions to your Supabase database through the SQL editor

-- Function 1: Calculate current stock at purchase
CREATE OR REPLACE FUNCTION calculate_current_stock_at_purchase(
  product_name_param TEXT,
  date_param DATE
)
RETURNS TABLE(current_stock INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT (
    (SELECT COALESCE(SUM(p2.purchase_qty), 0)
     FROM public.inventory_purchases p2
     WHERE p2.product_name = product_name_param AND p2.date <= date_param)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.inventory_sales_new s
       WHERE s.product_name = product_name_param AND s.date <= date_param)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.inventory_consumption c
       WHERE c.product_name = product_name_param AND c.date <= date_param)
  ) AS current_stock;
END;
$$;

-- Comprehensive Purchase Deletion with Stock Recalculation
-- Handles all scenarios: old entry deletion, middle entry deletion, latest entry deletion

-- Function to recalculate stock after deleting an old entry
-- This function subtracts the deleted quantity from all entries that came AFTER the deleted entry
CREATE OR REPLACE FUNCTION recalculate_stock_after_purchase_delete_comprehensive(
  deleted_product_id UUID,
  deleted_date TIMESTAMP WITHOUT TIME ZONE,
  deleted_quantity INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER := 0;
  purchase_record RECORD;
  surat_user_id UUID := '3f4b718f-70cb-4873-a62c-b8806a92e25b';
  surat_auth_user_id UUID := 'e8cf4c8a-89c3-4c53-968d-25b06811665f';
BEGIN
  -- Set the user context for RLS
  PERFORM set_config('role', 'authenticated', TRUE);
  PERFORM set_config('request.jwt.claim.sub', surat_auth_user_id::text, TRUE);

  -- Update all purchase records for the same product that come AFTER the deleted date
  -- This ensures we only affect entries that came after the deleted entry
  FOR purchase_record IN
    SELECT * FROM purchase_history_with_stock
    WHERE product_id = deleted_product_id
    AND date > deleted_date -- Only update records that came AFTER the deleted entry
    ORDER BY date ASC
  LOOP
    -- Subtract the deleted quantity from the current stock
    -- This reflects the historical reality: if this entry came after the deleted one,
    -- its stock should be reduced by the amount that was deleted
    UPDATE purchase_history_with_stock
    SET
      current_stock_at_purchase = GREATEST(purchase_record.current_stock_at_purchase - deleted_quantity, 0),
      updated_at = NOW()
    WHERE purchase_id = purchase_record.purchase_id;

    updated_count := updated_count + 1;
  END LOOP;

  RETURN updated_count;
END;
$$;

-- Main function to delete purchase and handle all scenarios
CREATE OR REPLACE FUNCTION delete_purchase_with_stock_recalculation_comprehensive(
  purchase_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_record RECORD;
  updated_count INTEGER;
  old_stock INTEGER;
  new_stock INTEGER;
  surat_user_id UUID := '3f4b718f-70cb-4873-a62c-b8806a92e25b';
  surat_auth_user_id UUID := 'e8cf4c8a-89c3-4c53-968d-25b06811665f';
  result_data JSON;
BEGIN
  -- Set the user context for RLS
  PERFORM set_config('role', 'authenticated', TRUE);
  PERFORM set_config('request.jwt.claim.sub', surat_auth_user_id::text, TRUE);

  -- Get the purchase record to be deleted
  SELECT * INTO deleted_record
  FROM purchase_history_with_stock
  WHERE purchase_id = purchase_id_param;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Purchase record not found',
      'error', 'Purchase record not found'
    );
  END IF;

  -- Get current product stock
  SELECT stock_quantity INTO old_stock
  FROM product_master
  WHERE id = deleted_record.product_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Product not found or access denied',
      'error', 'Product not found'
    );
  END IF;

  -- Calculate new stock (subtract the deleted quantity)
  new_stock := GREATEST(old_stock - deleted_record.purchase_qty, 0);

  -- Recalculate stock for all entries that came AFTER this deleted entry
  -- This handles the scenario where an old entry is deleted
  updated_count := recalculate_stock_after_purchase_delete_comprehensive(
    deleted_record.product_id,
    deleted_record.date,
    deleted_record.purchase_qty
  );

  -- Delete the purchase record
  DELETE FROM purchase_history_with_stock
  WHERE purchase_id = purchase_id_param;

  -- Prepare result data
  result_data := json_build_object(
    'productId', deleted_record.product_id,
    'oldStock', old_stock,
    'newStock', new_stock,
    'deletedQuantity', deleted_record.purchase_qty,
    'updatedEntriesCount', updated_count,
    'requiresProductUpdate', true
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Purchase deleted successfully. Stock recalculated for ' || updated_count || ' subsequent entries.',
    'data', result_data
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error deleting purchase: ' || SQLERRM,
      'error', SQLERRM
    );
END;
$$;

-- Debug function to test the logic
CREATE OR REPLACE FUNCTION delete_purchase_with_stock_recalculation_debug_comprehensive(
  purchase_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_record RECORD;
  subsequent_entries RECORD;
  surat_user_id UUID := '3f4b718f-70cb-4873-a62c-b8806a92e25b';
  surat_auth_user_id UUID := 'e8cf4c8a-89c3-4c53-968d-25b06811665f';
  debug_info JSON;
BEGIN
  -- Set the user context for RLS
  PERFORM set_config('role', 'authenticated', TRUE);
  PERFORM set_config('request.jwt.claim.sub', surat_auth_user_id::text, TRUE);

  -- Get the purchase record to be deleted
  SELECT * INTO deleted_record
  FROM purchase_history_with_stock
  WHERE purchase_id = purchase_id_param;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Purchase record not found',
      'debug', json_build_object('purchase_id', purchase_id_param)
    );
  END IF;

  -- Get all subsequent entries that will be affected
  SELECT json_agg(
    json_build_object(
      'purchase_id', purchase_id,
      'date', date,
      'purchase_qty', purchase_qty,
      'current_stock_at_purchase', current_stock_at_purchase,
      'new_stock_after_deletion', GREATEST(current_stock_at_purchase - deleted_record.purchase_qty, 0)
    )
  ) INTO debug_info
  FROM purchase_history_with_stock
  WHERE product_id = deleted_record.product_id
  AND date > deleted_record.date
  ORDER BY date ASC;

  RETURN json_build_object(
    'success', true,
    'message', 'Debug information generated',
    'data', json_build_object(
      'deleted_record', json_build_object(
        'purchase_id', deleted_record.purchase_id,
        'product_id', deleted_record.product_id,
        'date', deleted_record.date,
        'purchase_qty', deleted_record.purchase_qty,
        'current_stock_at_purchase', deleted_record.current_stock_at_purchase
      ),
      'subsequent_entries_affected', debug_info,
      'deleted_quantity', deleted_record.purchase_qty
    ),
    'debug', json_build_object(
      'total_subsequent_entries', COALESCE(json_array_length(debug_info), 0)
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error in debug function: ' || SQLERRM,
      'error', SQLERRM
    );
END;
$$;

-- Test the functions (optional - remove these after testing)
-- SELECT * FROM calculate_current_stock_at_purchase('Product Name', '2024-01-01');
-- SELECT recalculate_stock_after_purchase_delete('product-uuid-here', '2024-01-01', 50);
-- SELECT delete_purchase_with_stock_recalculation('purchase-uuid-here'); 