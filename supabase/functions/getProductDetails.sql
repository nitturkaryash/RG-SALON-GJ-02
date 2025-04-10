CREATE OR REPLACE FUNCTION get_product_details(product_id UUID)
RETURNS JSON AS $$
DECLARE
  product_data JSON;
BEGIN
  SELECT 
    json_build_object(
      'id', p.id,
      'name', p.name,
      'description', p.description,
      'price', p.price,
      'mrp_incl_gst', COALESCE(p.mrp_incl_gst, p.price),
      'mrp_excl_gst', COALESCE(p.mrp_excl_gst, p.price / (1 + (COALESCE(p.gst_percentage, 18) / 100))),
      'gst_percentage', COALESCE(p.gst_percentage, 18),
      'hsn_code', p.hsn_code,
      'units', p.units,
      'stock_quantity', p.stock_quantity,
      'active', p.active,
      'created_at', p.created_at,
      'updated_at', p.updated_at
    )
  INTO product_data
  FROM products p
  WHERE p.id = product_id;

  RETURN product_data;
END;
$$ LANGUAGE plpgsql; 