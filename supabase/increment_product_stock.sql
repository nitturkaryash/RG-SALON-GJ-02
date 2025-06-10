-- Function to increment product stock and log the change
CREATE OR REPLACE FUNCTION increment_product_stock(
  p_product_id UUID,
  p_increment_quantity INTEGER
)
RETURNS JSONB AS $$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
  hsn_code TEXT;
  units TEXT;
  gst_percentage INTEGER;
  price DECIMAL;
  new_stock INTEGER;
  timestamp TIMESTAMP;
BEGIN
  timestamp := NOW();

  -- Get product details and current stock
  SELECT 
    p.name,
    p.hsn_code,
    p.units,
    p.gst_percentage,
    p.price,
    COALESCE(ph.current_stock_at_purchase, p.stock_quantity, 0) as current_stock
  INTO 
    product_name,
    hsn_code,
    units,
    gst_percentage,
    price,
    current_stock
  FROM products p
  LEFT JOIN (
    SELECT DISTINCT ON (product_id) 
      product_id,
      current_stock_at_purchase
    FROM purchase_history_with_stock
    ORDER BY product_id, created_at DESC
  ) ph ON ph.product_id = p.id
  WHERE p.id = p_product_id;
  
  -- Exit if product not found
  IF product_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product not found',
      'product_id', p_product_id
    );
  END IF;
  
  -- Calculate new stock
  new_stock := GREATEST(0, current_stock + p_increment_quantity);
  
  -- Calculate GST values
  DECLARE
    gst_amount DECIMAL;
    price_incl_gst DECIMAL;
  BEGIN
    gst_amount := (price * COALESCE(gst_percentage, 18)) / 100;
    price_incl_gst := price + gst_amount;
    
    -- Insert into purchase history
    INSERT INTO purchase_history_with_stock (
      purchase_id,
      date,
      product_id,
      product_name,
      hsn_code,
      units,
      purchase_invoice_number,
      purchase_qty,
      mrp_incl_gst,
      mrp_excl_gst,
      discount_on_purchase_percentage,
      gst_percentage,
      purchase_taxable_value,
      purchase_igst,
      purchase_cgst,
      purchase_sgst,
      purchase_invoice_value_rs,
      supplier,
      current_stock_at_purchase,
      computed_stock_taxable_value,
      computed_stock_igst,
      computed_stock_cgst,
      computed_stock_sgst,
      computed_stock_total_value,
      created_at,
      updated_at,
      "Purchase_Cost/Unit(Ex.GST)",
      price_inlcuding_disc,
      transaction_type
    ) VALUES (
      uuid_generate_v4(),
      timestamp,
      p_product_id,
      product_name,
      COALESCE(hsn_code, ''),
      COALESCE(units, 'UNITS'),
      'INV-UPDATE-' || extract(epoch from timestamp)::bigint,
      p_increment_quantity,
      price_incl_gst,
      price,
      0,
      COALESCE(gst_percentage, 18),
      price * p_increment_quantity,
      0,
      gst_amount / 2,
      gst_amount / 2,
      price_incl_gst * p_increment_quantity,
      'INVENTORY UPDATE',
      new_stock,
      0,
      0,
      0,
      0,
      0,
      timestamp,
      timestamp,
      price,
      price,
      'stock_increment'
    );
  END;

  -- Update products table stock
  UPDATE products
  SET 
    stock_quantity = new_stock,
    updated_at = timestamp
  WHERE id = p_product_id;
  
  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'product_name', product_name,
    'previous_stock', current_stock,
    'incremented', p_increment_quantity,
    'new_stock', new_stock
  );
END;
$$ LANGUAGE plpgsql; 