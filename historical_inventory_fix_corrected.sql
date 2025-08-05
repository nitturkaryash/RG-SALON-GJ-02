-- Historical Inventory Management Functions (Corrected for Actual Table Names)
-- This script provides comprehensive historical inventory management with correct table references

-- 1. Function to validate historical inventory entry
CREATE OR REPLACE FUNCTION validate_historical_inventory_entry(
  product_name_param TEXT,
  entry_date_param TIMESTAMP,
  quantity_change_param INTEGER,
  transaction_type_param TEXT,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stock_at_date INTEGER;
  affected_transactions_count INTEGER;
  result JSONB;
BEGIN
  -- Calculate stock at the entry date
  SELECT (
    (SELECT COALESCE(SUM(p.purchase_qty), 0)
     FROM public.purchase_history_with_stock p
     WHERE p.product_name = product_name_param 
       AND p.date <= entry_date_param
       AND p.user_id = user_id_param)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.sales s
       WHERE s.product_name = product_name_param 
         AND s.date <= entry_date_param
         AND s.user_id = user_id_param)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.consumption c
       WHERE c.product_name = product_name_param 
         AND c.date <= entry_date_param
         AND c.user_id = user_id_param)
  ) INTO stock_at_date;

  -- Count affected future transactions
  SELECT (
    (SELECT COUNT(*)
     FROM public.purchase_history_with_stock p
     WHERE p.product_name = product_name_param 
       AND p.date > entry_date_param
       AND p.user_id = user_id_param)
    + (SELECT COUNT(*)
       FROM public.sales s
       WHERE s.product_name = product_name_param 
         AND s.date > entry_date_param
         AND s.user_id = user_id_param)
    + (SELECT COUNT(*)
       FROM public.consumption c
       WHERE c.product_name = product_name_param 
         AND c.date > entry_date_param
         AND c.user_id = user_id_param)
  ) INTO affected_transactions_count;

  -- Validate based on transaction type
  IF transaction_type_param = 'sale' OR transaction_type_param = 'consumption' THEN
    IF (stock_at_date + quantity_change_param) < 0 THEN
      result := jsonb_build_object(
        'valid', false,
        'error', 'Insufficient stock at the specified date',
        'available_stock', stock_at_date,
        'requested_change', quantity_change_param,
        'resulting_stock', stock_at_date + quantity_change_param
      );
    ELSE
      result := jsonb_build_object(
        'valid', true,
        'available_stock', stock_at_date,
        'affected_transactions', affected_transactions_count,
        'warning', CASE 
          WHEN affected_transactions_count > 0 THEN 
            'This entry will affect ' || affected_transactions_count || ' future transactions'
          ELSE NULL
        END
      );
    END IF;
  ELSE
    -- For purchases, always valid
    result := jsonb_build_object(
      'valid', true,
      'available_stock', stock_at_date,
      'affected_transactions', affected_transactions_count,
      'warning', CASE 
        WHEN affected_transactions_count > 0 THEN 
          'This entry will affect ' || affected_transactions_count || ' future transactions'
        ELSE NULL
      END
    );
  END IF;

  RETURN result;
END;
$$;

-- 2. Function to recalculate transactions after a date
CREATE OR REPLACE FUNCTION recalculate_transactions_after_date(
  product_name_param TEXT,
  entry_date_param TIMESTAMP,
  user_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER := 0;
  purchase_record RECORD;
BEGIN
  -- Update purchase_history_with_stock records
  UPDATE public.purchase_history_with_stock 
  SET 
    current_stock_at_purchase = (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.purchase_history_with_stock p2
       WHERE p2.product_name = product_name_param 
         AND p2.date <= purchase_history_with_stock.date
         AND p2.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.sales s
         WHERE s.product_name = product_name_param 
           AND s.date <= purchase_history_with_stock.date
           AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.consumption c
         WHERE c.product_name = product_name_param 
           AND c.date <= purchase_history_with_stock.date
           AND c.user_id = user_id_param)
    ),
    computed_stock_taxable_value = (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.purchase_history_with_stock p2
       WHERE p2.product_name = product_name_param 
         AND p2.date <= purchase_history_with_stock.date
         AND p2.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.sales s
         WHERE s.product_name = product_name_param 
           AND s.date <= purchase_history_with_stock.date
           AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.consumption c
         WHERE c.product_name = product_name_param 
           AND c.date <= purchase_history_with_stock.date
           AND c.user_id = user_id_param)
    ) * COALESCE(mrp_excl_gst, 0),
    updated_at = NOW()
  WHERE product_name = product_name_param 
    AND date >= entry_date_param
    AND user_id = user_id_param;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- 3. Function to insert historical inventory entry
CREATE OR REPLACE FUNCTION insert_historical_inventory_entry(
  product_name_param TEXT,
  entry_date_param TIMESTAMP,
  quantity_param INTEGER,
  transaction_type_param TEXT,
  additional_data JSONB DEFAULT '{}'::JSONB,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  validation_result JSONB;
  inserted_id UUID;
  recalculated_count INTEGER;
BEGIN
  -- Validate the entry
  SELECT validate_historical_inventory_entry(
    product_name_param, 
    entry_date_param, 
    quantity_param, 
    transaction_type_param, 
    user_id_param
  ) INTO validation_result;

  IF NOT (validation_result->>'valid')::BOOLEAN THEN
    RETURN validation_result;
  END IF;

  -- Insert based on transaction type
  CASE transaction_type_param
    WHEN 'purchase' THEN
      INSERT INTO public.purchase_history_with_stock (
        date, product_name, purchase_qty, user_id, transaction_type,
        mrp_incl_gst, mrp_excl_gst, additional_data, created_at, updated_at
      ) VALUES (
        entry_date_param, product_name_param, quantity_param, user_id_param, 'purchase',
        COALESCE((additional_data->>'mrp_incl_gst')::NUMERIC, 0),
        COALESCE((additional_data->>'mrp_excl_gst')::NUMERIC, 0),
        additional_data, NOW(), NOW()
      ) RETURNING id INTO inserted_id;

    WHEN 'sale' THEN
      INSERT INTO public.sales (
        date, product_name, quantity, user_id, transaction_type,
        additional_data, created_at, updated_at
      ) VALUES (
        entry_date_param, product_name_param, ABS(quantity_param), user_id_param, 'sale',
        additional_data, NOW(), NOW()
      ) RETURNING id INTO inserted_id;

    WHEN 'consumption' THEN
      INSERT INTO public.consumption (
        date, product_name, consumption_qty, user_id, transaction_type,
        additional_data, created_at, updated_at
      ) VALUES (
        entry_date_param, product_name_param, ABS(quantity_param), user_id_param, 'consumption',
        additional_data, NOW(), NOW()
      ) RETURNING id INTO inserted_id;

    ELSE
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Invalid transaction type. Must be purchase, sale, or consumption'
      );
  END CASE;

  -- Recalculate subsequent transactions
  SELECT recalculate_transactions_after_date(
    product_name_param, 
    entry_date_param, 
    user_id_param
  ) INTO recalculated_count;

  RETURN jsonb_build_object(
    'valid', true,
    'inserted_id', inserted_id,
    'recalculated_transactions', recalculated_count,
    'message', 'Historical entry inserted successfully'
  );
END;
$$;

-- 4. Function to get stock at a specific date
CREATE OR REPLACE FUNCTION get_stock_at_date(
  product_name_param TEXT,
  date_param TIMESTAMP,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stock_quantity INTEGER;
  stock_value NUMERIC;
BEGIN
  SELECT (
    (SELECT COALESCE(SUM(p.purchase_qty), 0)
     FROM public.purchase_history_with_stock p
     WHERE p.product_name = product_name_param 
       AND p.date <= date_param
       AND p.user_id = user_id_param)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.sales s
       WHERE s.product_name = product_name_param 
         AND s.date <= date_param
         AND s.user_id = user_id_param)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.consumption c
       WHERE c.product_name = product_name_param 
         AND c.date <= date_param
         AND c.user_id = user_id_param)
  ) INTO stock_quantity;

  -- Calculate stock value (using average purchase price)
  SELECT COALESCE(
    (SELECT AVG(mrp_incl_gst) 
     FROM public.purchase_history_with_stock 
     WHERE product_name = product_name_param 
       AND date <= date_param
       AND user_id = user_id_param
       AND mrp_incl_gst > 0), 0
  ) INTO stock_value;

  RETURN jsonb_build_object(
    'product_name', product_name_param,
    'date', date_param,
    'stock_quantity', stock_quantity,
    'stock_value', stock_value,
    'total_value', stock_quantity * stock_value
  );
END;
$$;

-- 5. Function to audit inventory changes
CREATE OR REPLACE FUNCTION audit_inventory_changes(
  product_name_param TEXT,
  start_date_param TIMESTAMP DEFAULT NULL,
  end_date_param TIMESTAMP DEFAULT NULL,
  user_id_param UUID
)
RETURNS TABLE(
  transaction_date TIMESTAMP,
  transaction_type TEXT,
  quantity_change INTEGER,
  running_stock INTEGER,
  additional_info JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH all_transactions AS (
    -- Purchases
    SELECT 
      date as transaction_date,
      'purchase' as transaction_type,
      purchase_qty as quantity_change,
      additional_data as additional_info
    FROM public.purchase_history_with_stock
    WHERE product_name = product_name_param 
      AND user_id = user_id_param
      AND (start_date_param IS NULL OR date >= start_date_param)
      AND (end_date_param IS NULL OR date <= end_date_param)
    
    UNION ALL
    
    -- Sales
    SELECT 
      date as transaction_date,
      'sale' as transaction_type,
      -quantity as quantity_change,
      additional_data as additional_info
    FROM public.sales
    WHERE product_name = product_name_param 
      AND user_id = user_id_param
      AND (start_date_param IS NULL OR date >= start_date_param)
      AND (end_date_param IS NULL OR date <= end_date_param)
    
    UNION ALL
    
    -- Consumption
    SELECT 
      date as transaction_date,
      'consumption' as transaction_type,
      -consumption_qty as quantity_change,
      additional_data as additional_info
    FROM public.consumption
    WHERE product_name = product_name_param 
      AND user_id = user_id_param
      AND (start_date_param IS NULL OR date >= start_date_param)
      AND (end_date_param IS NULL OR date <= end_date_param)
  ),
  ordered_transactions AS (
    SELECT 
      transaction_date,
      transaction_type,
      quantity_change,
      additional_info,
      SUM(quantity_change) OVER (
        ORDER BY transaction_date ASC, 
        CASE transaction_type 
          WHEN 'purchase' THEN 1 
          WHEN 'sale' THEN 2 
          WHEN 'consumption' THEN 3 
        END
        ROWS UNBOUNDED PRECEDING
      ) as running_stock
    FROM all_transactions
  )
  SELECT 
    transaction_date,
    transaction_type,
    quantity_change,
    running_stock,
    additional_info
  FROM ordered_transactions
  ORDER BY transaction_date ASC, 
    CASE transaction_type 
      WHEN 'purchase' THEN 1 
      WHEN 'sale' THEN 2 
      WHEN 'consumption' THEN 3 
    END;
END;
$$; 