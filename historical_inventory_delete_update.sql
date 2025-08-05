-- Historical Inventory Delete and Update Functions
-- This script adds comprehensive delete and update functionality for historical inventory entries

-- 1. Function to validate if a transaction can be deleted
CREATE OR REPLACE FUNCTION validate_historical_delete(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  user_id_param UUID
)
RETURNS TABLE(
  can_delete BOOLEAN,
  error_message TEXT,
  affected_transactions INTEGER,
  transaction_details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  future_transactions_count INTEGER := 0;
  transaction_data JSONB;
BEGIN
  -- Get transaction details based on type
  IF transaction_type_param = 'purchase' THEN
    SELECT * INTO transaction_record
    FROM public.inventory_purchases
    WHERE purchase_id = transaction_id_param AND user_id = user_id_param;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, 'Purchase transaction not found'::TEXT, 0, '{}'::JSONB;
      RETURN;
    END IF;
    
    transaction_data = jsonb_build_object(
      'product_name', transaction_record.product_name,
      'date', transaction_record.date,
      'quantity', transaction_record.purchase_qty,
      'transaction_type', 'purchase'
    );
    
  ELSIF transaction_type_param = 'sale' THEN
    SELECT * INTO transaction_record
    FROM public.inventory_sales_new
    WHERE sale_id = transaction_id_param AND user_id = user_id_param;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, 'Sale transaction not found'::TEXT, 0, '{}'::JSONB;
      RETURN;
    END IF;
    
    transaction_data = jsonb_build_object(
      'product_name', transaction_record.product_name,
      'date', transaction_record.date,
      'quantity', transaction_record.quantity,
      'transaction_type', 'sale'
    );
    
  ELSIF transaction_type_param = 'consumption' THEN
    SELECT * INTO transaction_record
    FROM public.inventory_consumption
    WHERE consumption_id = transaction_id_param AND user_id = user_id_param;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, 'Consumption transaction not found'::TEXT, 0, '{}'::JSONB;
      RETURN;
    END IF;
    
    transaction_data = jsonb_build_object(
      'product_name', transaction_record.product_name,
      'date', transaction_record.date,
      'quantity', transaction_record.consumption_qty,
      'transaction_type', 'consumption'
    );
  ELSE
    RETURN QUERY SELECT FALSE, 'Invalid transaction type'::TEXT, 0, '{}'::JSONB;
    RETURN;
  END IF;

  -- Check for future transactions that would be affected
  SELECT COUNT(*) INTO future_transactions_count
  FROM (
    SELECT date FROM public.inventory_purchases 
    WHERE product_name = transaction_record.product_name AND date > transaction_record.date AND user_id = user_id_param
    UNION ALL
    SELECT date FROM public.inventory_sales_new 
    WHERE product_name = transaction_record.product_name AND date > transaction_record.date AND user_id = user_id_param
    UNION ALL
    SELECT date FROM public.inventory_consumption 
    WHERE product_name = transaction_record.product_name AND date > transaction_record.date AND user_id = user_id_param
  ) future_txns;

  -- For sales and consumption, check if deletion would cause negative stock
  IF transaction_type_param IN ('sale', 'consumption') THEN
    DECLARE
      current_stock INTEGER;
      quantity_to_restore INTEGER;
    BEGIN
      -- Calculate current stock at the transaction date
      SELECT (
        (SELECT COALESCE(SUM(p.purchase_qty), 0)
         FROM public.inventory_purchases p
         WHERE p.product_name = transaction_record.product_name 
           AND p.date <= transaction_record.date
           AND p.user_id = user_id_param)
        - (SELECT COALESCE(SUM(s.quantity), 0)
           FROM public.inventory_sales_new s
           WHERE s.product_name = transaction_record.product_name 
             AND s.date <= transaction_record.date
             AND s.user_id = user_id_param
             AND s.sale_id != transaction_id_param)
        - (SELECT COALESCE(SUM(c.consumption_qty), 0)
           FROM public.inventory_consumption c
           WHERE c.product_name = transaction_record.product_name 
             AND c.date <= transaction_record.date
             AND c.user_id = user_id_param
             AND c.consumption_id != transaction_id_param)
      ) INTO current_stock;

      -- Calculate quantity that would be restored
      IF transaction_type_param = 'sale' THEN
        quantity_to_restore := transaction_record.quantity;
      ELSE
        quantity_to_restore := transaction_record.consumption_qty;
      END IF;

      -- Check if restoration would cause negative stock
      IF (current_stock + quantity_to_restore) < 0 THEN
        RETURN QUERY SELECT FALSE, 
          format('Cannot delete %s. Would result in negative stock at date %s', 
                 transaction_type_param, transaction_record.date::TEXT)::TEXT,
          future_transactions_count, transaction_data;
        RETURN;
      END IF;
    END;
  END IF;

  RETURN QUERY SELECT TRUE, 
    format('Can delete %s transaction. %s future transactions will be recalculated', 
           transaction_type_param, future_transactions_count)::TEXT,
    future_transactions_count, transaction_data;
END;
$$;

-- 2. Function to delete a historical transaction
CREATE OR REPLACE FUNCTION delete_historical_transaction(
  transaction_id_param UUID,
  transaction_type_param TEXT,
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
  transaction_record RECORD;
  product_name TEXT;
  transaction_date TIMESTAMP;
BEGIN
  -- Validate the deletion
  SELECT * INTO validation_result 
  FROM validate_historical_delete(transaction_id_param, transaction_type_param, user_id_param);

  IF NOT validation_result.can_delete THEN
    RETURN QUERY SELECT FALSE, validation_result.error_message, 0;
    RETURN;
  END IF;

  -- Get transaction details for recalculation
  IF transaction_type_param = 'purchase' THEN
    SELECT product_name, date INTO transaction_record
    FROM public.inventory_purchases
    WHERE purchase_id = transaction_id_param AND user_id = user_id_param;
    
    product_name := transaction_record.product_name;
    transaction_date := transaction_record.date;
    
    -- Delete the purchase
    DELETE FROM public.inventory_purchases 
    WHERE purchase_id = transaction_id_param AND user_id = user_id_param;
    
  ELSIF transaction_type_param = 'sale' THEN
    SELECT product_name, date INTO transaction_record
    FROM public.inventory_sales_new
    WHERE sale_id = transaction_id_param AND user_id = user_id_param;
    
    product_name := transaction_record.product_name;
    transaction_date := transaction_record.date;
    
    -- Delete the sale
    DELETE FROM public.inventory_sales_new 
    WHERE sale_id = transaction_id_param AND user_id = user_id_param;
    
  ELSIF transaction_type_param = 'consumption' THEN
    SELECT product_name, date INTO transaction_record
    FROM public.inventory_consumption
    WHERE consumption_id = transaction_id_param AND user_id = user_id_param;
    
    product_name := transaction_record.product_name;
    transaction_date := transaction_record.date;
    
    -- Delete the consumption
    DELETE FROM public.inventory_consumption 
    WHERE consumption_id = transaction_id_param AND user_id = user_id_param;
  END IF;

  -- Recalculate all transactions after the deleted transaction
  SELECT recalculate_transactions_after_date(product_name, transaction_date, user_id_param) 
  INTO affected_count;

  -- Update product master stock
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
  WHERE name = product_name;

  RETURN QUERY SELECT TRUE, 
    format('Successfully deleted %s transaction. %s transactions recalculated.', 
           transaction_type_param, affected_count),
    affected_count;
END;
$$;

-- 3. Function to validate historical update
CREATE OR REPLACE FUNCTION validate_historical_update(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  new_date_param TIMESTAMP,
  new_quantity_param INTEGER,
  user_id_param UUID
)
RETURNS TABLE(
  can_update BOOLEAN,
  error_message TEXT,
  affected_transactions INTEGER,
  old_values JSONB,
  new_values JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  old_date TIMESTAMP;
  old_quantity INTEGER;
  future_transactions_count INTEGER := 0;
  stock_impact INTEGER;
BEGIN
  -- Get current transaction details
  IF transaction_type_param = 'purchase' THEN
    SELECT date, purchase_qty INTO transaction_record
    FROM public.inventory_purchases
    WHERE purchase_id = transaction_id_param AND user_id = user_id_param;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, 'Purchase transaction not found'::TEXT, 0, '{}'::JSONB, '{}'::JSONB;
      RETURN;
    END IF;
    
    old_date := transaction_record.date;
    old_quantity := transaction_record.purchase_qty;
    
  ELSIF transaction_type_param = 'sale' THEN
    SELECT date, quantity INTO transaction_record
    FROM public.inventory_sales_new
    WHERE sale_id = transaction_id_param AND user_id = user_id_param;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, 'Sale transaction not found'::TEXT, 0, '{}'::JSONB, '{}'::JSONB;
      RETURN;
    END IF;
    
    old_date := transaction_record.date;
    old_quantity := transaction_record.quantity;
    
  ELSIF transaction_type_param = 'consumption' THEN
    SELECT date, consumption_qty INTO transaction_record
    FROM public.inventory_consumption
    WHERE consumption_id = transaction_id_param AND user_id = user_id_param;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, 'Consumption transaction not found'::TEXT, 0, '{}'::JSONB, '{}'::JSONB;
      RETURN;
    END IF;
    
    old_date := transaction_record.date;
    old_quantity := transaction_record.consumption_qty;
  ELSE
    RETURN QUERY SELECT FALSE, 'Invalid transaction type'::TEXT, 0, '{}'::JSONB, '{}'::JSONB;
    RETURN;
  END IF;

  -- Calculate stock impact
  IF transaction_type_param = 'purchase' THEN
    stock_impact := new_quantity_param - old_quantity;
  ELSE
    stock_impact := old_quantity - new_quantity_param; -- Restore old, subtract new
  END IF;

  -- Check if update would cause negative stock
  IF transaction_type_param IN ('sale', 'consumption') THEN
    DECLARE
      current_stock INTEGER;
    BEGIN
      -- Calculate current stock at the new date
      SELECT (
        (SELECT COALESCE(SUM(p.purchase_qty), 0)
         FROM public.inventory_purchases p
         WHERE p.product_name = (
           SELECT product_name FROM public.inventory_purchases WHERE purchase_id = transaction_id_param
           UNION ALL
           SELECT product_name FROM public.inventory_sales_new WHERE sale_id = transaction_id_param
           UNION ALL
           SELECT product_name FROM public.inventory_consumption WHERE consumption_id = transaction_id_param
         )
           AND p.date <= new_date_param
           AND p.user_id = user_id_param)
        - (SELECT COALESCE(SUM(s.quantity), 0)
           FROM public.inventory_sales_new s
           WHERE s.product_name = (
             SELECT product_name FROM public.inventory_purchases WHERE purchase_id = transaction_id_param
             UNION ALL
             SELECT product_name FROM public.inventory_sales_new WHERE sale_id = transaction_id_param
             UNION ALL
             SELECT product_name FROM public.inventory_consumption WHERE consumption_id = transaction_id_param
           )
             AND s.date <= new_date_param
             AND s.user_id = user_id_param
             AND s.sale_id != transaction_id_param)
        - (SELECT COALESCE(SUM(c.consumption_qty), 0)
           FROM public.inventory_consumption c
           WHERE c.product_name = (
             SELECT product_name FROM public.inventory_purchases WHERE purchase_id = transaction_id_param
             UNION ALL
             SELECT product_name FROM public.inventory_sales_new WHERE sale_id = transaction_id_param
             UNION ALL
             SELECT product_name FROM public.inventory_consumption WHERE consumption_id = transaction_id_param
           )
             AND c.date <= new_date_param
             AND c.user_id = user_id_param
             AND c.consumption_id != transaction_id_param)
      ) INTO current_stock;

      -- Check if the update would cause negative stock
      IF (current_stock - new_quantity_param) < 0 THEN
        RETURN QUERY SELECT FALSE, 
          format('Cannot update %s. Would result in negative stock at date %s', 
                 transaction_type_param, new_date_param::TEXT)::TEXT,
          0, 
          jsonb_build_object('date', old_date, 'quantity', old_quantity),
          jsonb_build_object('date', new_date_param, 'quantity', new_quantity_param);
        RETURN;
      END IF;
    END;
  END IF;

  -- Check for future transactions that would be affected
  SELECT COUNT(*) INTO future_transactions_count
  FROM (
    SELECT date FROM public.inventory_purchases 
    WHERE product_name = (
      SELECT product_name FROM public.inventory_purchases WHERE purchase_id = transaction_id_param
      UNION ALL
      SELECT product_name FROM public.inventory_sales_new WHERE sale_id = transaction_id_param
      UNION ALL
      SELECT product_name FROM public.inventory_consumption WHERE consumption_id = transaction_id_param
    )
      AND date > LEAST(old_date, new_date_param) AND user_id = user_id_param
    UNION ALL
    SELECT date FROM public.inventory_sales_new 
    WHERE product_name = (
      SELECT product_name FROM public.inventory_purchases WHERE purchase_id = transaction_id_param
      UNION ALL
      SELECT product_name FROM public.inventory_sales_new WHERE sale_id = transaction_id_param
      UNION ALL
      SELECT product_name FROM public.inventory_consumption WHERE consumption_id = transaction_id_param
    )
      AND date > LEAST(old_date, new_date_param) AND user_id = user_id_param
    UNION ALL
    SELECT date FROM public.inventory_consumption 
    WHERE product_name = (
      SELECT product_name FROM public.inventory_purchases WHERE purchase_id = transaction_id_param
      UNION ALL
      SELECT product_name FROM public.inventory_sales_new WHERE sale_id = transaction_id_param
      UNION ALL
      SELECT product_name FROM public.inventory_consumption WHERE consumption_id = transaction_id_param
    )
      AND date > LEAST(old_date, new_date_param) AND user_id = user_id_param
  ) future_txns;

  RETURN QUERY SELECT TRUE, 
    format('Can update %s transaction. %s future transactions will be recalculated', 
           transaction_type_param, future_transactions_count)::TEXT,
    future_transactions_count,
    jsonb_build_object('date', old_date, 'quantity', old_quantity),
    jsonb_build_object('date', new_date_param, 'quantity', new_quantity_param);
END;
$$;

-- 4. Function to update a historical transaction
CREATE OR REPLACE FUNCTION update_historical_transaction(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  new_date_param TIMESTAMP,
  new_quantity_param INTEGER,
  additional_data_param JSONB DEFAULT '{}'::JSONB,
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
  product_name TEXT;
  old_date TIMESTAMP;
  new_date TIMESTAMP;
BEGIN
  -- Validate the update
  SELECT * INTO validation_result 
  FROM validate_historical_update(transaction_id_param, transaction_type_param, new_date_param, new_quantity_param, user_id_param);

  IF NOT validation_result.can_update THEN
    RETURN QUERY SELECT FALSE, validation_result.error_message, 0;
    RETURN;
  END IF;

  -- Get product name and dates for recalculation
  IF transaction_type_param = 'purchase' THEN
    SELECT product_name, date INTO product_name, old_date
    FROM public.inventory_purchases
    WHERE purchase_id = transaction_id_param AND user_id = user_id_param;
    
    -- Update the purchase
    UPDATE public.inventory_purchases 
    SET 
      date = new_date_param,
      purchase_qty = new_quantity_param,
      purchase_taxable_value = COALESCE(additional_data_param->>'purchase_taxable_value', purchase_taxable_value)::FLOAT,
      purchase_invoice_value_rs = COALESCE(additional_data_param->>'purchase_invoice_value_rs', purchase_invoice_value_rs)::FLOAT,
      "Vendor" = COALESCE(additional_data_param->>'Vendor', "Vendor"),
      updated_at = NOW()
    WHERE purchase_id = transaction_id_param AND user_id = user_id_param;
    
  ELSIF transaction_type_param = 'sale' THEN
    SELECT product_name, date INTO product_name, old_date
    FROM public.inventory_sales_new
    WHERE sale_id = transaction_id_param AND user_id = user_id_param;
    
    -- Update the sale
    UPDATE public.inventory_sales_new 
    SET 
      date = new_date_param,
      quantity = new_quantity_param,
      invoice_value_rs = COALESCE(additional_data_param->>'invoice_value_rs', invoice_value_rs)::FLOAT,
      updated_at = NOW()
    WHERE sale_id = transaction_id_param AND user_id = user_id_param;
    
  ELSIF transaction_type_param = 'consumption' THEN
    SELECT product_name, date INTO product_name, old_date
    FROM public.inventory_consumption
    WHERE consumption_id = transaction_id_param AND user_id = user_id_param;
    
    -- Update the consumption
    UPDATE public.inventory_consumption 
    SET 
      date = new_date_param,
      consumption_qty = new_quantity_param,
      requisition_voucher_no = COALESCE(additional_data_param->>'requisition_voucher_no', requisition_voucher_no),
      stylist = COALESCE(additional_data_param->>'stylist', stylist),
      updated_at = NOW()
    WHERE consumption_id = transaction_id_param AND user_id = user_id_param;
  END IF;

  new_date := new_date_param;

  -- Recalculate all transactions after the earliest affected date
  SELECT recalculate_transactions_after_date(product_name, LEAST(old_date, new_date), user_id_param) 
  INTO affected_count;

  -- Update product master stock
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
  WHERE name = product_name;

  RETURN QUERY SELECT TRUE, 
    format('Successfully updated %s transaction. %s transactions recalculated.', 
           transaction_type_param, affected_count),
    affected_count;
END;
$$;

-- 5. Function to get transaction details for editing
CREATE OR REPLACE FUNCTION get_transaction_details(
  transaction_id_param UUID,
  transaction_type_param TEXT,
  user_id_param UUID
)
RETURNS TABLE(
  transaction_data JSONB,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF transaction_type_param = 'purchase' THEN
    RETURN QUERY
    SELECT 
      jsonb_build_object(
        'id', p.purchase_id,
        'product_name', p.product_name,
        'date', p.date,
        'quantity', p.purchase_qty,
        'invoice_number', p.purchase_invoice_number,
        'mrp_excl_gst', p.mrp_excl_gst,
        'mrp_incl_gst', p.mrp_incl_gst,
        'vendor', p."Vendor",
        'taxable_value', p.purchase_taxable_value,
        'invoice_value', p.purchase_invoice_value_rs,
        'gst_percentage', p.gst_percentage,
        'discount_percentage', p.discount_on_purchase_percentage
      ),
      NULL::TEXT
    FROM public.inventory_purchases p
    WHERE p.purchase_id = transaction_id_param AND p.user_id = user_id_param;
    
  ELSIF transaction_type_param = 'sale' THEN
    RETURN QUERY
    SELECT 
      jsonb_build_object(
        'id', s.sale_id,
        'product_name', s.product_name,
        'date', s.date,
        'quantity', s.quantity,
        'invoice_no', s.invoice_no,
        'invoice_value', s.invoice_value_rs,
        'purchase_cost_per_unit', s.purchase_cost_per_unit_ex_gst,
        'sales_taxable_value', s.sales_taxable_value
      ),
      NULL::TEXT
    FROM public.inventory_sales_new s
    WHERE s.sale_id = transaction_id_param AND s.user_id = user_id_param;
    
  ELSIF transaction_type_param = 'consumption' THEN
    RETURN QUERY
    SELECT 
      jsonb_build_object(
        'id', c.consumption_id,
        'product_name', c.product_name,
        'date', c.date,
        'quantity', c.consumption_qty,
        'voucher_no', c.requisition_voucher_no,
        'stylist', c.stylist,
        'order_id', c.order_id,
        'invoice_value', c.invoice_value
      ),
      NULL::TEXT
    FROM public.inventory_consumption c
    WHERE c.consumption_id = transaction_id_param AND c.user_id = user_id_param;
  ELSE
    RETURN QUERY SELECT '{}'::JSONB, 'Invalid transaction type'::TEXT;
  END IF;
END;
$$;

-- 6. Create indexes for better performance on delete/update operations
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_id_user 
ON public.inventory_purchases(purchase_id, user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_sales_id_user 
ON public.inventory_sales_new(sale_id, user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_consumption_id_user 
ON public.inventory_consumption(consumption_id, user_id);

-- 7. Example usage functions
-- Test delete validation
-- SELECT * FROM validate_historical_delete('transaction-uuid', 'purchase', 'user-uuid');

-- Test delete execution
-- SELECT * FROM delete_historical_transaction('transaction-uuid', 'purchase', 'user-uuid');

-- Test update validation
-- SELECT * FROM validate_historical_update('transaction-uuid', 'purchase', '2024-01-20'::TIMESTAMP, 25, 'user-uuid');

-- Test update execution
-- SELECT * FROM update_historical_transaction('transaction-uuid', 'purchase', '2024-01-20'::TIMESTAMP, 25, '{"Vendor": "New Vendor"}'::JSONB, 'user-uuid');

-- Get transaction details
-- SELECT * FROM get_transaction_details('transaction-uuid', 'purchase', 'user-uuid'); 