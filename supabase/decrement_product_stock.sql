-- Function to decrement product stock and log the change
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id UUID,
  decrement_quantity INTEGER
)
RETURNS JSONB AS $$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
  hsn_code TEXT;
  units TEXT;
  new_stock INTEGER;
BEGIN
  -- Check if product exists and get current stock
  SELECT 
    name, 
    stock_quantity, 
    COALESCE(hsn_code, '') as hsn_code, 
    COALESCE(units, '') as units 
  INTO product_name, current_stock, hsn_code, units
  FROM products 
  WHERE id = product_id;
  
  -- Exit if product not found
  IF product_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product not found',
      'product_id', product_id
    );
  END IF;
  
  -- Calculate new stock (prevent negative values)
  new_stock := GREATEST(0, current_stock - decrement_quantity);
  
  -- Update the stock
  UPDATE products 
  SET stock_quantity = new_stock
  WHERE id = product_id;
  
  -- Log the stock change in the transaction history
  INSERT INTO product_stock_transaction_history (
    id, 
    date, 
    product_name, 
    hsn_code, 
    units, 
    change_type, 
    source,
    reference_id,
    quantity_change, 
    quantity_after_change
  ) VALUES (
    uuid_generate_v4(),
    NOW(),
    product_name,
    hsn_code,
    units,
    'decrement',
    'pos_order',
    product_id::TEXT,
    decrement_quantity * -1, -- Store as negative for decrement
    new_stock
  );
  
  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'product_id', product_id,
    'product_name', product_name,
    'previous_stock', current_stock,
    'decremented', decrement_quantity,
    'new_stock', new_stock
  );
END;
$$ LANGUAGE plpgsql; 