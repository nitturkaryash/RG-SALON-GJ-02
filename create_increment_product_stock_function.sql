-- Create RPC function for incrementing product stock safely
CREATE OR REPLACE FUNCTION increment_product_stock(product_id UUID, increment_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Check if product exists
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = product_id) THEN
        RAISE EXCEPTION 'Product with ID % not found', product_id;
    END IF;

    -- Update the stock by adding the increment amount
    UPDATE products
    SET 
        current_stock = COALESCE(current_stock, 0) + increment_amount,
        updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Make the function available via RPC
COMMENT ON FUNCTION increment_product_stock IS 'Safely increments a product''s current_stock by the specified amount.';

-- Notify about schema changes
NOTIFY pgrst, 'reload schema'; 