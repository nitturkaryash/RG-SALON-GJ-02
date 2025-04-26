-- Create RPC function for decrementing product stock safely
CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id UUID, p_decrement_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Check if product exists
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
        RAISE EXCEPTION 'Product with ID % not found', p_product_id;
    END IF;

    -- Update the stock, ensuring it doesn't go below 0
    UPDATE products
    SET 
        stock_quantity = GREATEST(0, stock_quantity - p_decrement_quantity),
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Make the function available via RPC
COMMENT ON FUNCTION decrement_product_stock IS 'Safely decrements a product''s stock by the specified quantity, preventing negative stock.';

-- Notify about schema changes
NOTIFY pgrst, 'reload schema'; 