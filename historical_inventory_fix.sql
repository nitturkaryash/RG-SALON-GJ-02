-- Comprehensive Historical Inventory Fix
-- This script addresses all scenarios for historical inventory entries
-- Based on QuickBooks inventory principles and current system requirements

-- 1. Create a function to validate historical entries
CREATE OR REPLACE FUNCTION validate_historical_inventory_entry(
  product_name_param TEXT,
  entry_date_param TIMESTAMP,
  quantity_change_param INTEGER,
  transaction_type_param TEXT,
  user_id_param UUID
)
RETURNS TABLE(
  is_valid BOOLEAN,
  available_stock INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stock_at_date INTEGER;
  future_transactions_count INTEGER;
BEGIN
  -- Calculate stock available at the entry date
  SELECT (
    (SELECT COALESCE(SUM(p.purchase_qty), 0)
     FROM public.inventory_purchases p
     WHERE p.product_name = product_name_param 
       AND p.date <= entry_date_param
       AND p.user_id = user_id_param)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.inventory_sales_new s
       WHERE s.product_name = product_name_param 
         AND s.date <= entry_date_param
         AND s.user_id = user_id_param)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.inventory_consumption c
       WHERE c.product_name = product_name_param 
         AND c.date <= entry_date_param
         AND c.user_id = user_id_param)
  ) INTO stock_at_date;

  -- Check if there are future transactions that would be affected
  SELECT COUNT(*) INTO future_transactions_count
  FROM (
    SELECT date FROM public.inventory_purchases 
    WHERE product_name = product_name_param AND date > entry_date_param AND user_id = user_id_param
    UNION ALL
    SELECT date FROM public.inventory_sales_new 
    WHERE product_name = product_name_param AND date > entry_date_param AND user_id = user_id_param
    UNION ALL
    SELECT date FROM public.inventory_consumption 
    WHERE product_name = product_name_param AND date > entry_date_param AND user_id = user_id_param
  ) future_txns;

  -- Validate the entry
  IF transaction_type_param = 'purchase' THEN
    -- Purchases always valid (add to stock)
    RETURN QUERY SELECT TRUE, stock_at_date, 'Valid purchase entry'::TEXT;
  ELSIF transaction_type_param = 'sale' OR transaction_type_param = 'consumption' THEN
    -- Sales/consumption must not exceed available stock
    IF (stock_at_date + quantity_change_param) < 0 THEN
      RETURN QUERY SELECT FALSE, stock_at_date, 
        format('Insufficient stock. Available: %s, Required: %s', stock_at_date, ABS(quantity_change_param))::TEXT;
    ELSE
      RETURN QUERY SELECT TRUE, stock_at_date, 'Valid sale/consumption entry'::TEXT;
    END IF;
  ELSE
    RETURN QUERY SELECT FALSE, stock_at_date, 'Invalid transaction type'::TEXT;
  END IF;

  -- If there are future transactions, warn about recalculation
  IF future_transactions_count > 0 THEN
    RETURN QUERY SELECT TRUE, stock_at_date, 
      format('Entry valid. %s future transactions will be recalculated', future_transactions_count)::TEXT;
  END IF;
END;
$$;

-- 2. Create a function to recalculate all transactions after a historical entry
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
  transaction_record RECORD;
BEGIN
  -- Recalculate purchase history stock for all transactions after the entry date
  UPDATE public.purchase_history_with_stock 
  SET 
    current_stock_at_purchase = (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = purchase_history_with_stock.product_name 
         AND p2.date <= purchase_history_with_stock.date
         AND p2.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = purchase_history_with_stock.product_name 
           AND s.date <= purchase_history_with_stock.date
           AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = purchase_history_with_stock.product_name 
           AND c.date <= purchase_history_with_stock.date
           AND c.user_id = user_id_param)
    ),
    computed_stock_taxable_value = (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = purchase_history_with_stock.product_name 
         AND p2.date <= purchase_history_with_stock.date
         AND p2.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = purchase_history_with_stock.product_name 
           AND s.date <= purchase_history_with_stock.date
           AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = purchase_history_with_stock.product_name 
           AND c.date <= purchase_history_with_stock.date
           AND c.user_id = user_id_param)
    ) * COALESCE(mrp_excl_gst, 0),
    updated_at = NOW()
  WHERE product_name = product_name_param 
    AND date > entry_date_param 
    AND user_id = user_id_param;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- 3. Create a comprehensive historical entry function
CREATE OR REPLACE FUNCTION insert_historical_inventory_entry(
  product_name_param TEXT,
  entry_date_param TIMESTAMP,
  quantity_param INTEGER,
  transaction_type_param TEXT,
  additional_data JSONB DEFAULT '{}'::JSONB,
  user_id_param UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  affected_transactions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  validation_result RECORD;
  affected_count INTEGER := 0;
  new_id UUID;
BEGIN
  -- Validate the historical entry
  SELECT * INTO validation_result 
  FROM validate_historical_inventory_entry(
    product_name_param, 
    entry_date_param, 
    quantity_param, 
    transaction_type_param, 
    user_id_param
  );

  IF NOT validation_result.is_valid THEN
    RETURN QUERY SELECT FALSE, validation_result.error_message, 0;
    RETURN;
  END IF;

  -- Insert the historical entry based on transaction type
  IF transaction_type_param = 'purchase' THEN
    INSERT INTO public.inventory_purchases (
      purchase_id, date, product_name, purchase_qty, user_id,
      hsn_code, units, purchase_invoice_number, mrp_incl_gst, mrp_excl_gst,
      discount_on_purchase_percentage, gst_percentage, purchase_taxable_value,
      purchase_igst, purchase_cgst, purchase_sgst, purchase_invoice_value_rs,
      "Vendor", created_at, updated_at
    )
    VALUES (
      uuid_generate_v4(), entry_date_param, product_name_param, quantity_param, user_id_param,
      additional_data->>'hsn_code', additional_data->>'units', additional_data->>'purchase_invoice_number',
      (additional_data->>'mrp_incl_gst')::FLOAT, (additional_data->>'mrp_excl_gst')::FLOAT,
      (additional_data->>'discount_on_purchase_percentage')::FLOAT, (additional_data->>'gst_percentage')::FLOAT,
      (additional_data->>'purchase_taxable_value')::FLOAT, (additional_data->>'purchase_igst')::FLOAT,
      (additional_data->>'purchase_cgst')::FLOAT, (additional_data->>'purchase_sgst')::FLOAT,
      (additional_data->>'purchase_invoice_value_rs')::FLOAT, additional_data->>'Vendor',
      NOW(), NOW()
    )
    RETURNING purchase_id INTO new_id;

  ELSIF transaction_type_param = 'sale' THEN
    INSERT INTO public.inventory_sales_new (
      sale_id, date, product_name, quantity, user_id,
      invoice_no, purchase_cost_per_unit_ex_gst, purchase_gst_percentage,
      purchase_taxable_value, purchase_igst, purchase_cgst, purchase_sgst,
      total_purchase_cost, mrp_incl_gst, mrp_excl_gst, discount_on_sales_percentage,
      discounted_sales_rate_excl_gst, sales_gst_percentage, sales_taxable_value,
      igst_rs, cgst_rs, sgst_rs, invoice_value_rs, created_at, updated_at
    )
    VALUES (
      uuid_generate_v4(), entry_date_param, product_name_param, ABS(quantity_param), user_id_param,
      additional_data->>'invoice_no', (additional_data->>'purchase_cost_per_unit_ex_gst')::FLOAT,
      (additional_data->>'purchase_gst_percentage')::FLOAT, (additional_data->>'purchase_taxable_value')::FLOAT,
      (additional_data->>'purchase_igst')::FLOAT, (additional_data->>'purchase_cgst')::FLOAT,
      (additional_data->>'purchase_sgst')::FLOAT, (additional_data->>'total_purchase_cost')::FLOAT,
      (additional_data->>'mrp_incl_gst')::FLOAT, (additional_data->>'mrp_excl_gst')::FLOAT,
      (additional_data->>'discount_on_sales_percentage')::FLOAT, (additional_data->>'discounted_sales_rate_excl_gst')::FLOAT,
      (additional_data->>'sales_gst_percentage')::FLOAT, (additional_data->>'sales_taxable_value')::FLOAT,
      (additional_data->>'igst_rs')::FLOAT, (additional_data->>'cgst_rs')::FLOAT, (additional_data->>'sgst_rs')::FLOAT,
      (additional_data->>'invoice_value_rs')::FLOAT, NOW(), NOW()
    )
    RETURNING sale_id INTO new_id;

  ELSIF transaction_type_param = 'consumption' THEN
    INSERT INTO public.inventory_consumption (
      consumption_id, date, product_name, consumption_qty, user_id,
      order_id, hsn_code, units, requisition_voucher_no, purchase_cost_per_unit_ex_gst,
      purchase_gst_percentage, purchase_taxable_value, purchase_igst, purchase_cgst, purchase_sgst,
      total_purchase_cost, balance_qty, taxable_value, igst_rs, cgst_rs, sgst_rs,
      invoice_value, stylist, status, payment_method, total_amount, type, created_at, updated_at
    )
    VALUES (
      uuid_generate_v4(), entry_date_param, product_name_param, ABS(quantity_param), user_id_param,
      additional_data->>'order_id', additional_data->>'hsn_code', additional_data->>'units',
      additional_data->>'requisition_voucher_no', (additional_data->>'purchase_cost_per_unit_ex_gst')::FLOAT,
      (additional_data->>'purchase_gst_percentage')::FLOAT, (additional_data->>'purchase_taxable_value')::FLOAT,
      (additional_data->>'purchase_igst')::FLOAT, (additional_data->>'purchase_cgst')::FLOAT,
      (additional_data->>'purchase_sgst')::FLOAT, (additional_data->>'total_purchase_cost')::FLOAT,
      validation_result.available_stock + quantity_param, (additional_data->>'taxable_value')::FLOAT,
      (additional_data->>'igst_rs')::FLOAT, (additional_data->>'cgst_rs')::FLOAT, (additional_data->>'sgst_rs')::FLOAT,
      (additional_data->>'invoice_value')::FLOAT, additional_data->>'stylist', additional_data->>'status',
      additional_data->>'payment_method', (additional_data->>'total_amount')::FLOAT, additional_data->>'type',
      NOW(), NOW()
    )
    RETURNING consumption_id INTO new_id;
  END IF;

  -- Recalculate all transactions after this date
  SELECT recalculate_transactions_after_date(product_name_param, entry_date_param, user_id_param) 
  INTO affected_count;

  -- Update product master stock if needed
  UPDATE public.product_master 
  SET 
    stock_quantity = (
      (SELECT COALESCE(SUM(p.purchase_qty), 0)
       FROM public.inventory_purchases p
       WHERE p.product_name = product_master.name AND p.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = product_master.name AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = product_master.name AND c.user_id = user_id_param)
    ),
    updated_at = NOW()
  WHERE name = product_name_param;

  RETURN QUERY SELECT TRUE, 
    format('Historical %s entry added successfully. %s transactions recalculated.', transaction_type_param, affected_count),
    affected_count;
END;
$$;

-- 4. Create a function to get stock levels at any point in time
CREATE OR REPLACE FUNCTION get_stock_at_date(
  product_name_param TEXT,
  date_param TIMESTAMP,
  user_id_param UUID
)
RETURNS TABLE(
  stock_quantity INTEGER,
  purchase_value NUMERIC,
  sales_value NUMERIC,
  consumption_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (
      (SELECT COALESCE(SUM(p.purchase_qty), 0)
       FROM public.inventory_purchases p
       WHERE p.product_name = product_name_param 
         AND p.date <= date_param
         AND p.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = product_name_param 
           AND s.date <= date_param
           AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = product_name_param 
           AND c.date <= date_param
           AND c.user_id = user_id_param)
    ) AS stock_quantity,
    (SELECT COALESCE(SUM(p.purchase_qty * p.mrp_excl_gst), 0)
     FROM public.inventory_purchases p
     WHERE p.product_name = product_name_param 
       AND p.date <= date_param
       AND p.user_id = user_id_param) AS purchase_value,
    (SELECT COALESCE(SUM(s.quantity * s.purchase_cost_per_unit_ex_gst), 0)
     FROM public.inventory_sales_new s
     WHERE s.product_name = product_name_param 
       AND s.date <= date_param
       AND s.user_id = user_id_param) AS sales_value,
    (SELECT COALESCE(SUM(c.consumption_qty * c.purchase_cost_per_unit_ex_gst), 0)
     FROM public.inventory_consumption c
     WHERE c.product_name = product_name_param 
       AND c.date <= date_param
       AND c.user_id = user_id_param) AS consumption_value;
END;
$$;

-- 5. Create a function to audit inventory changes
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
  stock_after_change INTEGER,
  reference_id TEXT,
  transaction_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.date AS transaction_date,
    'purchase' AS transaction_type,
    p.purchase_qty AS quantity_change,
    phs.current_stock_at_purchase AS stock_after_change,
    p.purchase_invoice_number AS reference_id,
    p.purchase_invoice_value_rs AS transaction_value
  FROM public.inventory_purchases p
  LEFT JOIN public.purchase_history_with_stock phs ON p.purchase_id = phs.purchase_id
  WHERE p.product_name = product_name_param 
    AND p.user_id = user_id_param
    AND (start_date_param IS NULL OR p.date >= start_date_param)
    AND (end_date_param IS NULL OR p.date <= end_date_param)
  
  UNION ALL
  
  SELECT 
    s.date AS transaction_date,
    'sale' AS transaction_type,
    -s.quantity AS quantity_change,
    NULL AS stock_after_change,
    s.invoice_no AS reference_id,
    s.invoice_value_rs AS transaction_value
  FROM public.inventory_sales_new s
  WHERE s.product_name = product_name_param 
    AND s.user_id = user_id_param
    AND (start_date_param IS NULL OR s.date >= start_date_param)
    AND (end_date_param IS NULL OR s.date <= end_date_param)
  
  UNION ALL
  
  SELECT 
    c.date AS transaction_date,
    'consumption' AS transaction_type,
    -c.consumption_qty AS quantity_change,
    c.balance_qty AS stock_after_change,
    c.requisition_voucher_no AS reference_id,
    c.invoice_value AS transaction_value
  FROM public.inventory_consumption c
  WHERE c.product_name = product_name_param 
    AND c.user_id = user_id_param
    AND (start_date_param IS NULL OR c.date >= start_date_param)
    AND (end_date_param IS NULL OR c.date <= end_date_param)
  
  ORDER BY transaction_date ASC;
END;
$$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_user_product_date_historical 
ON public.inventory_purchases(user_id, product_name, date);

CREATE INDEX IF NOT EXISTS idx_inventory_sales_user_product_date_historical 
ON public.inventory_sales_new(user_id, product_name, date);

CREATE INDEX IF NOT EXISTS idx_inventory_consumption_user_product_date_historical 
ON public.inventory_consumption(user_id, product_name, date);

-- 7. Create a view for real-time stock levels
CREATE OR REPLACE VIEW current_stock_levels AS
SELECT 
  p.product_name,
  p.hsn_code,
  p.units,
  (
    (SELECT COALESCE(SUM(p2.purchase_qty), 0)
     FROM public.inventory_purchases p2
     WHERE p2.product_name = p.product_name AND p2.user_id = p.user_id)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.inventory_sales_new s
       WHERE s.product_name = p.product_name AND s.user_id = p.user_id)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.inventory_consumption c
       WHERE c.product_name = p.product_name AND c.user_id = p.user_id)
  ) AS current_stock,
  p.user_id,
  p.created_at
FROM (
  SELECT DISTINCT product_name, hsn_code, units, user_id, created_at
  FROM public.inventory_purchases
) p
WHERE (
  (SELECT COALESCE(SUM(p2.purchase_qty), 0)
   FROM public.inventory_purchases p2
   WHERE p2.product_name = p.product_name AND p2.user_id = p.user_id)
  - (SELECT COALESCE(SUM(s.quantity), 0)
     FROM public.inventory_sales_new s
     WHERE s.product_name = p.product_name AND s.user_id = p.user_id)
  - (SELECT COALESCE(SUM(c.consumption_qty), 0)
     FROM public.inventory_consumption c
     WHERE c.product_name = p.product_name AND c.user_id = p.user_id)
) > 0;

-- 8. Example usage and testing functions
-- Test historical entry validation
-- SELECT * FROM validate_historical_inventory_entry('Product Name', '2024-01-01'::TIMESTAMP, 10, 'purchase', 'user-uuid');

-- Test historical entry insertion
-- SELECT * FROM insert_historical_inventory_entry(
--   'Product Name', 
--   '2024-01-01'::TIMESTAMP, 
--   10, 
--   'purchase', 
--   '{"hsn_code": "123456", "units": "pcs", "mrp_excl_gst": 100}'::JSONB,
--   'user-uuid'
-- );

-- Test stock at date
-- SELECT * FROM get_stock_at_date('Product Name', '2024-01-15'::TIMESTAMP, 'user-uuid');

-- Test audit trail
-- SELECT * FROM audit_inventory_changes('Product Name', '2024-01-01'::TIMESTAMP, '2024-01-31'::TIMESTAMP, 'user-uuid'); 