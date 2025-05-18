CREATE OR REPLACE FUNCTION decrement_product_stock(product_id UUID, decrement_quantity INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - decrement_quantity)
  WHERE id = product_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql; 