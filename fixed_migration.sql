-- Fixed migration for adding transaction_type column
-- This version handles constraints properly without IF NOT EXISTS

-- Add transaction_type column to purchase_history_with_stock table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'purchase_history_with_stock' 
        AND column_name = 'transaction_type'
    ) THEN
        ALTER TABLE purchase_history_with_stock 
        ADD COLUMN transaction_type VARCHAR(20) DEFAULT 'purchase';
        
        RAISE NOTICE 'Added transaction_type column to purchase_history_with_stock table';
    ELSE
        RAISE NOTICE 'transaction_type column already exists in purchase_history_with_stock table';
    END IF;
END $$;

-- Add transaction_type column to inventory_purchases table  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'inventory_purchases' 
        AND column_name = 'transaction_type'
    ) THEN
        ALTER TABLE inventory_purchases 
        ADD COLUMN transaction_type VARCHAR(20) DEFAULT 'purchase';
        
        RAISE NOTICE 'Added transaction_type column to inventory_purchases table';
    ELSE
        RAISE NOTICE 'transaction_type column already exists in inventory_purchases table';
    END IF;
END $$;

-- Update all existing records to be 'purchase' type
UPDATE purchase_history_with_stock 
SET transaction_type = 'purchase' 
WHERE transaction_type IS NULL;

UPDATE inventory_purchases 
SET transaction_type = 'purchase' 
WHERE transaction_type IS NULL;

-- Add constraints (drop first if exists to avoid errors)
DO $$ 
BEGIN
    -- Drop constraint if it exists, then add it
    BEGIN
        ALTER TABLE purchase_history_with_stock 
        DROP CONSTRAINT purchase_history_transaction_type_check;
    EXCEPTION
        WHEN undefined_object THEN 
            RAISE NOTICE 'Constraint purchase_history_transaction_type_check does not exist, skipping drop';
    END;
    
    ALTER TABLE purchase_history_with_stock 
    ADD CONSTRAINT purchase_history_transaction_type_check 
    CHECK (transaction_type IN ('purchase', 'inventory_update'));
    
    RAISE NOTICE 'Added constraint to purchase_history_with_stock table';
END $$;

DO $$ 
BEGIN
    -- Drop constraint if it exists, then add it
    BEGIN
        ALTER TABLE inventory_purchases 
        DROP CONSTRAINT inventory_purchases_transaction_type_check;
    EXCEPTION
        WHEN undefined_object THEN 
            RAISE NOTICE 'Constraint inventory_purchases_transaction_type_check does not exist, skipping drop';
    END;
    
    ALTER TABLE inventory_purchases 
    ADD CONSTRAINT inventory_purchases_transaction_type_check 
    CHECK (transaction_type IN ('purchase', 'inventory_update'));
    
    RAISE NOTICE 'Added constraint to inventory_purchases table';
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_purchase_history_transaction_type 
ON purchase_history_with_stock(transaction_type);

CREATE INDEX IF NOT EXISTS idx_inventory_purchases_transaction_type 
ON inventory_purchases(transaction_type);

-- Update the trigger function to include transaction_type
CREATE OR REPLACE FUNCTION public.fn_insert_purchase_history_stock()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.purchase_history_with_stock (
    purchase_id, date, product_id, product_name, hsn_code, units,
    purchase_invoice_number, purchase_qty, mrp_incl_gst, mrp_excl_gst,
    discount_on_purchase_percentage, gst_percentage, purchase_taxable_value,
    purchase_igst, purchase_cgst, purchase_sgst, purchase_invoice_value_rs,
    supplier, current_stock_at_purchase, computed_stock_taxable_value,
    computed_stock_igst, computed_stock_cgst, computed_stock_sgst,
    computed_stock_total_value, "Purchase_Cost/Unit(Ex.GST)", price_inlcuding_disc, 
    transaction_type, created_at, updated_at
  )
  SELECT
    NEW.purchase_id, NEW.date, NEW.product_id, NEW.product_name, NEW.hsn_code, NEW.units,
    NEW.purchase_invoice_number, NEW.purchase_qty, NEW.mrp_incl_gst, NEW.mrp_excl_gst,
    NEW.discount_on_purchase_percentage, NEW.gst_percentage, NEW.purchase_taxable_value,
    NEW.purchase_igst, NEW.purchase_cgst, NEW.purchase_sgst, NEW.purchase_invoice_value_rs,
    COALESCE(NEW."Vendor", NEW.supplier),
    (
      (SELECT COALESCE(SUM(p2.purchase_qty),0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
      - (SELECT COALESCE(SUM(s.quantity),0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
      - (SELECT COALESCE(SUM(c.consumption_qty),0)
         FROM public.inventory_consumption c
         WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
    ) AS current_stock_at_purchase,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst
    ) AS computed_stock_taxable_value,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst * (NEW.gst_percentage/100.0)
    ) AS computed_stock_igst,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst * (NEW.gst_percentage/200.0)
    ) AS computed_stock_cgst,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst * (NEW.gst_percentage/200.0)
    ) AS computed_stock_sgst,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst * (1 + NEW.gst_percentage/100.0)
    ) AS computed_stock_total_value,
    CASE WHEN NEW.purchase_qty = 0 THEN NULL ELSE NEW.purchase_taxable_value / NEW.purchase_qty END AS "Purchase_Cost/Unit(Ex.GST)",
    CASE WHEN NEW.purchase_qty = 0 THEN NULL ELSE NEW.purchase_taxable_value / NEW.purchase_qty END AS price_inlcuding_disc,
    COALESCE(NEW.transaction_type, 'purchase') AS transaction_type,
    NOW(), NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to use updated function
DROP TRIGGER IF EXISTS tr_inventory_purchases_insert ON public.inventory_purchases;
CREATE TRIGGER tr_inventory_purchases_insert
AFTER INSERT ON public.inventory_purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_insert_purchase_history_stock();

-- Verify the changes
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE (table_name = 'purchase_history_with_stock' OR table_name = 'inventory_purchases')
AND column_name = 'transaction_type'
ORDER BY table_name; 