-- Migration: Create trigger for purchase history price tracking and product master updates
-- This trigger automatically:
-- 1. Updates product master MRP when purchase prices change
-- 2. Logs price changes to product_price_history table
-- 3. Updates product stock quantities

-- Create the trigger function
CREATE OR REPLACE FUNCTION handle_purchase_history_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_mrp_incl_gst DECIMAL(10,2);
    old_mrp_excl_gst DECIMAL(10,2);
    old_gst_percentage DECIMAL(5,2);
    new_mrp_incl_gst DECIMAL(10,2);
    new_mrp_excl_gst DECIMAL(10,2);
    new_gst_percentage DECIMAL(5,2);
    price_changed BOOLEAN := FALSE;
    stock_changed BOOLEAN := FALSE;
    current_stock INTEGER;
    new_stock INTEGER;
    operation_type TEXT;
BEGIN
    -- Determine operation type
    IF TG_OP = 'INSERT' THEN
        operation_type := 'purchase_history_add';
    ELSIF TG_OP = 'UPDATE' THEN
        operation_type := 'purchase_history_edit';
    ELSE
        operation_type := 'purchase_history_change';
    END IF;

    -- Get current product master values
    SELECT 
        mrp_incl_gst, 
        mrp_excl_gst, 
        gst_percentage,
        stock_quantity
    INTO 
        old_mrp_incl_gst, 
        old_mrp_excl_gst, 
        old_gst_percentage,
        current_stock
    FROM product_master 
    WHERE id = NEW.product_id;

    -- If product doesn't exist, skip processing
    IF NOT FOUND THEN
        RAISE WARNING 'Product with ID % not found in product_master', NEW.product_id;
        RETURN NEW;
    END IF;

    -- Extract new values from the purchase record
    new_mrp_incl_gst := COALESCE(NEW.mrp_incl_gst, old_mrp_incl_gst);
    new_mrp_excl_gst := COALESCE(NEW.mrp_excl_gst, old_mrp_excl_gst);
    new_gst_percentage := COALESCE(NEW.gst_percentage, old_gst_percentage);

    -- Check if any price-related field has changed
    price_changed := (
        (new_mrp_incl_gst IS DISTINCT FROM old_mrp_incl_gst) OR
        (new_mrp_excl_gst IS DISTINCT FROM old_mrp_excl_gst) OR
        (new_gst_percentage IS DISTINCT FROM old_gst_percentage)
    );

    -- Calculate missing price values if needed
    IF new_mrp_incl_gst IS NOT NULL AND new_mrp_excl_gst IS NULL AND new_gst_percentage IS NOT NULL THEN
        new_mrp_excl_gst := new_mrp_incl_gst / (1 + (new_gst_percentage / 100));
    ELSIF new_mrp_excl_gst IS NOT NULL AND new_mrp_incl_gst IS NULL AND new_gst_percentage IS NOT NULL THEN
        new_mrp_incl_gst := new_mrp_excl_gst * (1 + (new_gst_percentage / 100));
    END IF;

    -- Update product master if prices changed
    IF price_changed THEN
        UPDATE product_master 
        SET 
            mrp_incl_gst = COALESCE(new_mrp_incl_gst, mrp_incl_gst),
            mrp_excl_gst = COALESCE(new_mrp_excl_gst, mrp_excl_gst),
            gst_percentage = COALESCE(new_gst_percentage, gst_percentage),
            price = COALESCE(new_mrp_excl_gst, mrp_excl_gst), -- Update base price too
            updated_at = NOW()
        WHERE id = NEW.product_id;

        -- Log the price change to product_price_history
        INSERT INTO product_price_history (
            product_id,
            changed_at,
            old_mrp_incl_gst,
            new_mrp_incl_gst,
            old_mrp_excl_gst,
            new_mrp_excl_gst,
            old_gst_percentage,
            new_gst_percentage,
            source_of_change,
            reference_id,
            notes
        ) VALUES (
            NEW.product_id,
            NOW(),
            COALESCE(old_mrp_incl_gst, 0),
            COALESCE(new_mrp_incl_gst, 0),
            COALESCE(old_mrp_excl_gst, 0),
            COALESCE(new_mrp_excl_gst, 0),
            COALESCE(old_gst_percentage, 0),
            COALESCE(new_gst_percentage, 0),
            operation_type,
            NEW.purchase_id,
            FORMAT('Automatic price update via %s trigger. Purchase ID: %s. Product: %s', 
                   operation_type, NEW.purchase_id, NEW.product_name)
        );

        RAISE NOTICE 'Price change logged for product % from purchase %', NEW.product_name, NEW.purchase_id;
    END IF;

    -- Handle stock updates
    IF TG_OP = 'INSERT' THEN
        -- For new purchases, add to current stock
        new_stock := current_stock + COALESCE(NEW.purchase_qty, 0);
        stock_changed := TRUE;
    ELSIF TG_OP = 'UPDATE' THEN
        -- For updates, calculate the difference
        IF OLD.purchase_qty IS DISTINCT FROM NEW.purchase_qty THEN
            new_stock := current_stock + (COALESCE(NEW.purchase_qty, 0) - COALESCE(OLD.purchase_qty, 0));
            stock_changed := TRUE;
        END IF;
    END IF;

    -- Update product stock if changed
    IF stock_changed THEN
        UPDATE product_master 
        SET 
            stock_quantity = new_stock,
            updated_at = NOW()
        WHERE id = NEW.product_id;

        -- Log stock change to stock_history
        INSERT INTO stock_history (
            product_id,
            product_name,
            hsn_code,
            units,
            date,
            previous_qty,
            current_qty,
            change_qty,
            stock_after,
            change_type,
            reference_id,
            source,
            created_at
        ) VALUES (
            NEW.product_id,
            NEW.product_name,
            COALESCE(NEW.hsn_code, ''),
            COALESCE(NEW.units, 'pcs'),
            NOW(),
            current_stock,
            current_stock,
            CASE 
                WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.purchase_qty, 0)
                WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.purchase_qty, 0) - COALESCE(OLD.purchase_qty, 0)
                ELSE 0
            END,
            new_stock,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'purchase'
                WHEN TG_OP = 'UPDATE' THEN 'purchase_edit'
                ELSE 'purchase_change'
            END,
            NEW.purchase_id,
            FORMAT('Auto-update from %s trigger - Invoice: %s', operation_type, COALESCE(NEW.purchase_invoice_number, 'N/A')),
            NOW()
        );

        RAISE NOTICE 'Stock updated for product % from % to %', NEW.product_name, current_stock, new_stock;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trg_purchase_history_changes ON purchase_history_with_stock;

-- Create the trigger on purchase_history_with_stock table
CREATE TRIGGER trg_purchase_history_changes
    AFTER INSERT OR UPDATE ON purchase_history_with_stock
    FOR EACH ROW
    EXECUTE FUNCTION handle_purchase_history_changes();

-- Create an index on product_price_history for better performance
CREATE INDEX IF NOT EXISTS idx_product_price_history_product_changed 
ON product_price_history(product_id, changed_at DESC);

-- Create an index on stock_history for better performance
CREATE INDEX IF NOT EXISTS idx_stock_history_product_date 
ON stock_history(product_id, date DESC);

-- Add comments for documentation
COMMENT ON FUNCTION handle_purchase_history_changes() IS 
'Trigger function that automatically updates product master and logs price/stock changes when purchase history is modified';

COMMENT ON TRIGGER trg_purchase_history_changes ON purchase_history_with_stock IS 
'Trigger that maintains product master data and audit trails based on purchase history changes'; 