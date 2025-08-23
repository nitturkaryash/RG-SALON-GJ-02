-- Supabase Fix for Foreign Key and Missing Function
-- Copy and paste this into your Supabase SQL Editor

-- Fix 1: Update foreign key constraint to CASCADE DELETE
ALTER TABLE public.pos_order_items DROP CONSTRAINT IF EXISTS pos_order_items_pos_order_id_fkey;
ALTER TABLE public.pos_order_items 
ADD CONSTRAINT pos_order_items_pos_order_id_fkey 
FOREIGN KEY (pos_order_id) REFERENCES public.pos_orders(id) ON DELETE CASCADE;

-- Fix 2: Create the missing record_stock_transaction function
CREATE OR REPLACE FUNCTION public.record_stock_transaction(
    p_product_id text,
    p_transaction_type text,
    p_quantity integer,
    p_order_id text,
    p_notes text,
    p_display_type text,
    p_source_type text,
    p_source text
) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_id UUID;
    product_uuid UUID;
    current_stock INTEGER;
    new_stock INTEGER;
BEGIN
    -- Convert text product_id to UUID if possible
    BEGIN
        product_uuid := p_product_id::UUID;
    EXCEPTION WHEN OTHERS THEN
        -- If conversion fails, try to find by name
        SELECT id INTO product_uuid
        FROM product_master
        WHERE name = p_product_id
        LIMIT 1;
        
        IF product_uuid IS NULL THEN
            RAISE EXCEPTION 'Product not found: %', p_product_id;
        END IF;
    END;

    -- Get current stock
    SELECT stock_quantity INTO current_stock
    FROM product_master
    WHERE id = product_uuid;
    
    IF current_stock IS NULL THEN
        current_stock := 0;
    END IF;

    -- Calculate new stock based on transaction type
    IF p_transaction_type = 'reduction' THEN
        new_stock := GREATEST(0, current_stock - p_quantity);
    ELSIF p_transaction_type = 'addition' THEN
        new_stock := current_stock + p_quantity;
    ELSE
        new_stock := current_stock;
    END IF;

    -- Update product stock
    UPDATE product_master
    SET 
        stock_quantity = new_stock,
        updated_at = NOW()
    WHERE id = product_uuid;

    -- Record the transaction
    INSERT INTO product_stock_transactions (
        id,
        product_id,
        transaction_type,
        quantity,
        previous_stock,
        new_stock,
        order_id,
        notes,
        display_type,
        source_type,
        source,
        duplicate_protection_key
    ) VALUES (
        gen_random_uuid(),
        product_uuid,
        p_transaction_type,
        p_quantity,
        current_stock,
        new_stock,
        CASE WHEN p_order_id = '' THEN NULL ELSE p_order_id::UUID END,
        p_notes,
        p_display_type,
        p_source_type,
        p_source,
        product_uuid || '_' || p_transaction_type || '_' || p_quantity || '_' || EXTRACT(EPOCH FROM NOW())::integer
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in record_stock_transaction: %', SQLERRM;
    RETURN NULL;
END;
$$;
