-- Drop all versions of the function
DROP FUNCTION IF EXISTS decrement_product_stock_compat(jsonb);
DROP FUNCTION IF EXISTS decrement_product_stock_compat(jsonb[]);

-- Create a single, unambiguous version of the function
CREATE OR REPLACE FUNCTION decrement_product_stock_compat(product_updates jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb := '[]'::jsonb;
    update_record jsonb;
    product_id uuid;
    quantity integer;
    current_stock integer;
    new_stock integer;
BEGIN
    -- Process each update in a loop
    FOR update_record IN SELECT * FROM jsonb_array_elements(product_updates)
    LOOP
        product_id := (update_record->>'product_id')::uuid;
        quantity := (update_record->>'quantity')::integer;
        
        -- Get current stock
        SELECT stock_quantity INTO current_stock
        FROM products
        WHERE id = product_id;
        
        IF current_stock IS NOT NULL THEN
            -- Calculate new stock
            new_stock := current_stock - quantity;
            
            -- Update stock
            UPDATE products
            SET stock_quantity = new_stock,
                updated_at = NOW()
            WHERE id = product_id;
            
            -- Add to result
            result := result || jsonb_build_object(
                'product_id', product_id,
                'old_stock', current_stock,
                'new_stock', new_stock,
                'quantity_deducted', quantity
            );
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$; 