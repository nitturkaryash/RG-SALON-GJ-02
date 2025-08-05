-- Historical Inventory Delete and Update Functions (Corrected for Actual Table Names)
-- This script provides comprehensive delete and update operations for historical inventory entries

-- 1. Function to validate historical delete operation
CREATE OR REPLACE FUNCTION validate_historical_delete(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  stock_at_date INTEGER;
  affected_transactions_count INTEGER;
  result JSONB;
BEGIN
  -- Get transaction details based on type
  CASE transaction_type_param
    WHEN 'purchase' THEN
      SELECT * INTO transaction_record
      FROM public.purchase_history_with_stock
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'sale' THEN
      SELECT * INTO transaction_record
      FROM public.sales
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'consumption' THEN
      SELECT * INTO transaction_record
      FROM public.consumption
      WHERE id = transaction_id_param AND user_id = user_id_param;
    ELSE
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Invalid transaction type. Must be purchase, sale, or consumption'
      );
  END CASE;

  IF transaction_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Transaction not found or access denied'
    );
  END IF;

  -- Calculate stock at the transaction date (excluding this transaction)
  SELECT (
    (SELECT COALESCE(SUM(p.purchase_qty), 0)
     FROM public.purchase_history_with_stock p
     WHERE p.product_name = transaction_record.product_name 
       AND p.date <= transaction_record.date
       AND p.user_id = user_id_param
       AND p.id != transaction_id_param)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.sales s
       WHERE s.product_name = transaction_record.product_name 
         AND s.date <= transaction_record.date
         AND s.user_id = user_id_param
         AND s.id != transaction_id_param)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.consumption c
       WHERE c.product_name = transaction_record.product_name 
         AND c.date <= transaction_record.date
         AND c.user_id = user_id_param
         AND c.id != transaction_id_param)
  ) INTO stock_at_date;

  -- Count affected future transactions
  SELECT (
    (SELECT COUNT(*)
     FROM public.purchase_history_with_stock p
     WHERE p.product_name = transaction_record.product_name 
       AND p.date > transaction_record.date
       AND p.user_id = user_id_param)
    + (SELECT COUNT(*)
       FROM public.sales s
       WHERE s.product_name = transaction_record.product_name 
         AND s.date > transaction_record.date
         AND s.user_id = user_id_param)
    + (SELECT COUNT(*)
       FROM public.consumption c
       WHERE c.product_name = transaction_record.product_name 
         AND c.date > transaction_record.date
         AND c.user_id = user_id_param)
  ) INTO affected_transactions_count;

  -- Validate based on transaction type
  IF transaction_type_param = 'purchase' THEN
    -- For purchases, check if deletion would cause negative stock in future transactions
    IF stock_at_date < 0 THEN
      result := jsonb_build_object(
        'valid', false,
        'error', 'Cannot delete purchase: would result in negative stock',
        'available_stock', stock_at_date,
        'purchase_quantity', transaction_record.purchase_qty
      );
    ELSE
      result := jsonb_build_object(
        'valid', true,
        'transaction_details', jsonb_build_object(
          'date', transaction_record.date,
          'product_name', transaction_record.product_name,
          'quantity', transaction_record.purchase_qty,
          'type', 'purchase'
        ),
        'affected_transactions', affected_transactions_count,
        'warning', CASE 
          WHEN affected_transactions_count > 0 THEN 
            'This deletion will affect ' || affected_transactions_count || ' future transactions'
          ELSE NULL
        END
      );
    END IF;
  ELSE
    -- For sales and consumption, deletion is generally safe
    result := jsonb_build_object(
      'valid', true,
      'transaction_details', jsonb_build_object(
        'date', transaction_record.date,
        'product_name', transaction_record.product_name,
        'quantity', CASE 
          WHEN transaction_type_param = 'sale' THEN transaction_record.quantity
          ELSE transaction_record.consumption_qty
        END,
        'type', transaction_type_param
      ),
      'affected_transactions', affected_transactions_count,
      'warning', CASE 
        WHEN affected_transactions_count > 0 THEN 
          'This deletion will affect ' || affected_transactions_count || ' future transactions'
        ELSE NULL
      END
    );
  END IF;

  RETURN result;
END;
$$;

-- 2. Function to delete historical transaction
CREATE OR REPLACE FUNCTION delete_historical_transaction(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  validation_result JSONB;
  deleted_record RECORD;
  recalculated_count INTEGER;
BEGIN
  -- Validate the deletion
  SELECT validate_historical_delete(
    transaction_id_param, 
    transaction_type_param, 
    user_id_param
  ) INTO validation_result;

  IF NOT (validation_result->>'valid')::BOOLEAN THEN
    RETURN validation_result;
  END IF;

  -- Get transaction details before deletion
  CASE transaction_type_param
    WHEN 'purchase' THEN
      SELECT * INTO deleted_record
      FROM public.purchase_history_with_stock
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'sale' THEN
      SELECT * INTO deleted_record
      FROM public.sales
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'consumption' THEN
      SELECT * INTO deleted_record
      FROM public.consumption
      WHERE id = transaction_id_param AND user_id = user_id_param;
  END CASE;

  -- Delete the transaction
  CASE transaction_type_param
    WHEN 'purchase' THEN
      DELETE FROM public.purchase_history_with_stock
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'sale' THEN
      DELETE FROM public.sales
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'consumption' THEN
      DELETE FROM public.consumption
      WHERE id = transaction_id_param AND user_id = user_id_param;
  END CASE;

  -- Recalculate subsequent transactions
  SELECT recalculate_transactions_after_date(
    deleted_record.product_name, 
    deleted_record.date, 
    user_id_param
  ) INTO recalculated_count;

  RETURN jsonb_build_object(
    'valid', true,
    'deleted_transaction', jsonb_build_object(
      'id', transaction_id_param,
      'type', transaction_type_param,
      'product_name', deleted_record.product_name,
      'date', deleted_record.date,
      'quantity', CASE 
        WHEN transaction_type_param = 'purchase' THEN deleted_record.purchase_qty
        WHEN transaction_type_param = 'sale' THEN deleted_record.quantity
        ELSE deleted_record.consumption_qty
      END
    ),
    'recalculated_transactions', recalculated_count,
    'message', 'Transaction deleted successfully'
  );
END;
$$;

-- 3. Function to validate historical update operation
CREATE OR REPLACE FUNCTION validate_historical_update(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  new_date_param TIMESTAMP,
  new_quantity_param INTEGER,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  stock_at_new_date INTEGER;
  affected_transactions_count INTEGER;
  result JSONB;
BEGIN
  -- Get current transaction details
  CASE transaction_type_param
    WHEN 'purchase' THEN
      SELECT * INTO transaction_record
      FROM public.purchase_history_with_stock
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'sale' THEN
      SELECT * INTO transaction_record
      FROM public.sales
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'consumption' THEN
      SELECT * INTO transaction_record
      FROM public.consumption
      WHERE id = transaction_id_param AND user_id = user_id_param;
    ELSE
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Invalid transaction type. Must be purchase, sale, or consumption'
      );
  END CASE;

  IF transaction_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Transaction not found or access denied'
    );
  END IF;

  -- Calculate stock at the new date (excluding this transaction)
  SELECT (
    (SELECT COALESCE(SUM(p.purchase_qty), 0)
     FROM public.purchase_history_with_stock p
     WHERE p.product_name = transaction_record.product_name 
       AND p.date <= new_date_param
       AND p.user_id = user_id_param
       AND p.id != transaction_id_param)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.sales s
       WHERE s.product_name = transaction_record.product_name 
         AND s.date <= new_date_param
         AND s.user_id = user_id_param
         AND s.id != transaction_id_param)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.consumption c
       WHERE c.product_name = transaction_record.product_name 
         AND c.date <= new_date_param
         AND c.user_id = user_id_param
         AND c.id != transaction_id_param)
  ) INTO stock_at_new_date;

  -- Count affected future transactions
  SELECT (
    (SELECT COUNT(*)
     FROM public.purchase_history_with_stock p
     WHERE p.product_name = transaction_record.product_name 
       AND p.date > LEAST(transaction_record.date, new_date_param)
       AND p.user_id = user_id_param)
    + (SELECT COUNT(*)
       FROM public.sales s
       WHERE s.product_name = transaction_record.product_name 
         AND s.date > LEAST(transaction_record.date, new_date_param)
         AND s.user_id = user_id_param)
    + (SELECT COUNT(*)
       FROM public.consumption c
       WHERE c.product_name = transaction_record.product_name 
         AND c.date > LEAST(transaction_record.date, new_date_param)
         AND c.user_id = user_id_param)
  ) INTO affected_transactions_count;

  -- Validate based on transaction type
  IF transaction_type_param = 'sale' OR transaction_type_param = 'consumption' THEN
    IF (stock_at_new_date + new_quantity_param) < 0 THEN
      result := jsonb_build_object(
        'valid', false,
        'error', 'Insufficient stock at the new date',
        'available_stock', stock_at_new_date,
        'requested_quantity', new_quantity_param,
        'resulting_stock', stock_at_new_date + new_quantity_param
      );
    ELSE
      result := jsonb_build_object(
        'valid', true,
        'available_stock', stock_at_new_date,
        'affected_transactions', affected_transactions_count,
        'warning', CASE 
          WHEN affected_transactions_count > 0 THEN 
            'This update will affect ' || affected_transactions_count || ' future transactions'
          ELSE NULL
        END
      );
    END IF;
  ELSE
    -- For purchases, always valid
    result := jsonb_build_object(
      'valid', true,
      'available_stock', stock_at_new_date,
      'affected_transactions', affected_transactions_count,
      'warning', CASE 
        WHEN affected_transactions_count > 0 THEN 
          'This update will affect ' || affected_transactions_count || ' future transactions'
        ELSE NULL
      END
    );
  END IF;

  RETURN result;
END;
$$;

-- 4. Function to update historical transaction
CREATE OR REPLACE FUNCTION update_historical_transaction(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  new_date_param TIMESTAMP,
  new_quantity_param INTEGER,
  additional_data_param JSONB DEFAULT '{}'::JSONB,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  validation_result JSONB;
  old_date TIMESTAMP;
  recalculated_count INTEGER;
BEGIN
  -- Validate the update
  SELECT validate_historical_update(
    transaction_id_param, 
    transaction_type_param, 
    new_date_param, 
    new_quantity_param, 
    user_id_param
  ) INTO validation_result;

  IF NOT (validation_result->>'valid')::BOOLEAN THEN
    RETURN validation_result;
  END IF;

  -- Get the old date for recalculation
  CASE transaction_type_param
    WHEN 'purchase' THEN
      SELECT date INTO old_date
      FROM public.purchase_history_with_stock
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'sale' THEN
      SELECT date INTO old_date
      FROM public.sales
      WHERE id = transaction_id_param AND user_id = user_id_param;
    WHEN 'consumption' THEN
      SELECT date INTO old_date
      FROM public.consumption
      WHERE id = transaction_id_param AND user_id = user_id_param;
  END CASE;

  -- Update the transaction
  CASE transaction_type_param
    WHEN 'purchase' THEN
      UPDATE public.purchase_history_with_stock
      SET 
        date = new_date_param,
        purchase_qty = new_quantity_param,
        mrp_incl_gst = COALESCE((additional_data_param->>'mrp_incl_gst')::NUMERIC, mrp_incl_gst),
        mrp_excl_gst = COALESCE((additional_data_param->>'mrp_excl_gst')::NUMERIC, mrp_excl_gst),
        additional_data = additional_data_param,
        updated_at = NOW()
      WHERE id = transaction_id_param AND user_id = user_id_param;

    WHEN 'sale' THEN
      UPDATE public.sales
      SET 
        date = new_date_param,
        quantity = ABS(new_quantity_param),
        additional_data = additional_data_param,
        updated_at = NOW()
      WHERE id = transaction_id_param AND user_id = user_id_param;

    WHEN 'consumption' THEN
      UPDATE public.consumption
      SET 
        date = new_date_param,
        consumption_qty = ABS(new_quantity_param),
        additional_data = additional_data_param,
        updated_at = NOW()
      WHERE id = transaction_id_param AND user_id = user_id_param;
  END CASE;

  -- Recalculate transactions from the earlier of old or new date
  SELECT recalculate_transactions_after_date(
    (SELECT product_name FROM public.purchase_history_with_stock WHERE id = transaction_id_param LIMIT 1),
    LEAST(old_date, new_date_param), 
    user_id_param
  ) INTO recalculated_count;

  RETURN jsonb_build_object(
    'valid', true,
    'updated_transaction', jsonb_build_object(
      'id', transaction_id_param,
      'type', transaction_type_param,
      'new_date', new_date_param,
      'new_quantity', new_quantity_param
    ),
    'recalculated_transactions', recalculated_count,
    'message', 'Transaction updated successfully'
  );
END;
$$;

-- 5. Function to get transaction details for editing
CREATE OR REPLACE FUNCTION get_transaction_details(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_data JSONB;
BEGIN
  CASE transaction_type_param
    WHEN 'purchase' THEN
      SELECT jsonb_build_object(
        'id', id,
        'date', date,
        'product_name', product_name,
        'quantity', purchase_qty,
        'mrp_incl_gst', mrp_incl_gst,
        'mrp_excl_gst', mrp_excl_gst,
        'transaction_type', 'purchase',
        'additional_data', COALESCE(additional_data, '{}'::jsonb)
      ) INTO transaction_data
      FROM public.purchase_history_with_stock
      WHERE id = transaction_id_param AND user_id = user_id_param;

    WHEN 'sale' THEN
      SELECT jsonb_build_object(
        'id', id,
        'date', date,
        'product_name', product_name,
        'quantity', quantity,
        'transaction_type', 'sale',
        'additional_data', COALESCE(additional_data, '{}'::jsonb)
      ) INTO transaction_data
      FROM public.sales
      WHERE id = transaction_id_param AND user_id = user_id_param;

    WHEN 'consumption' THEN
      SELECT jsonb_build_object(
        'id', id,
        'date', date,
        'product_name', product_name,
        'quantity', consumption_qty,
        'transaction_type', 'consumption',
        'additional_data', COALESCE(additional_data, '{}'::jsonb)
      ) INTO transaction_data
      FROM public.consumption
      WHERE id = transaction_id_param AND user_id = user_id_param;

    ELSE
      RETURN jsonb_build_object(
        'error', 'Invalid transaction type. Must be purchase, sale, or consumption'
      );
  END CASE;

  IF transaction_data IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Transaction not found or access denied'
    );
  END IF;

  RETURN transaction_data;
END;
$$; 