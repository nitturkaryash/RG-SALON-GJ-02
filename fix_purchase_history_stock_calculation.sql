-- Fix Purchase History Stock Calculation
-- This script addresses multiple issues with the stock calculation system

-- 1. First, let's add user_id filtering to all stock calculations
-- This ensures that stock calculations only consider data from the current user

-- Update the stock calculation function to include user_id filtering
CREATE OR REPLACE FUNCTION calculate_current_stock_at_purchase_with_user(
  product_name_param TEXT,
  date_param DATE,
  user_id_param UUID
)
RETURNS TABLE(current_stock INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT (
    (SELECT COALESCE(SUM(p2.purchase_qty), 0)
     FROM public.inventory_purchases p2
     WHERE p2.product_name = product_name_param 
       AND p2.date <= date_param
       AND p2.user_id = user_id_param)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.inventory_sales_new s
       WHERE s.product_name = product_name_param 
         AND s.date <= date_param
         AND s.user_id = user_id_param)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.inventory_consumption c
       WHERE c.product_name = product_name_param 
         AND c.date <= date_param
         AND c.user_id = user_id_param)
  ) AS current_stock;
END;
$$;

-- 2. Update the purchase history trigger function to include user_id filtering
CREATE OR REPLACE FUNCTION fn_insert_purchase_history_stock_with_user()
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
    transaction_type, user_id, created_at, updated_at
  )
  SELECT
    NEW.purchase_id, NEW.date, NEW.product_id, NEW.product_name, NEW.hsn_code, NEW.units,
    NEW.purchase_invoice_number, NEW.purchase_qty, NEW.mrp_incl_gst, NEW.mrp_excl_gst,
    NEW.discount_on_purchase_percentage, NEW.gst_percentage, NEW.purchase_taxable_value,
    NEW.purchase_igst, NEW.purchase_cgst, NEW.purchase_sgst, NEW.purchase_invoice_value_rs,
    NEW."Vendor",
    -- Calculate current stock with user_id filtering
    (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = NEW.product_name 
         AND p2.date <= NEW.date
         AND p2.user_id = NEW.user_id)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = NEW.product_name 
           AND s.date <= NEW.date
           AND s.user_id = NEW.user_id)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = NEW.product_name 
           AND c.date <= NEW.date
           AND c.user_id = NEW.user_id)
    ) AS current_stock_at_purchase,
    -- Calculate stock values with proper GST handling
    (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = NEW.product_name 
         AND p2.date <= NEW.date
         AND p2.user_id = NEW.user_id)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = NEW.product_name 
           AND s.date <= NEW.date
           AND s.user_id = NEW.user_id)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = NEW.product_name 
           AND c.date <= NEW.date
           AND c.user_id = NEW.user_id)
    ) * COALESCE(NEW.mrp_excl_gst, 0) AS computed_stock_taxable_value,
    -- IGST calculation (for inter-state transactions)
    CASE 
      WHEN COALESCE(NEW.igst, 0) > 0 THEN
        (
          (SELECT COALESCE(SUM(p2.purchase_qty), 0)
           FROM public.inventory_purchases p2
           WHERE p2.product_name = NEW.product_name 
             AND p2.date <= NEW.date
             AND p2.user_id = NEW.user_id)
          - (SELECT COALESCE(SUM(s.quantity), 0)
             FROM public.inventory_sales_new s
             WHERE s.product_name = NEW.product_name 
               AND s.date <= NEW.date
               AND s.user_id = NEW.user_id)
          - (SELECT COALESCE(SUM(c.consumption_qty), 0)
             FROM public.inventory_consumption c
             WHERE c.product_name = NEW.product_name 
               AND c.date <= NEW.date
               AND c.user_id = NEW.user_id)
        ) * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 100.0)
      ELSE 0
    END AS computed_stock_igst,
    -- CGST calculation (for intra-state transactions)
    CASE 
      WHEN COALESCE(NEW.cgst, 0) > 0 THEN
        (
          (SELECT COALESCE(SUM(p2.purchase_qty), 0)
           FROM public.inventory_purchases p2
           WHERE p2.product_name = NEW.product_name 
             AND p2.date <= NEW.date
             AND p2.user_id = NEW.user_id)
          - (SELECT COALESCE(SUM(s.quantity), 0)
             FROM public.inventory_sales_new s
             WHERE s.product_name = NEW.product_name 
               AND s.date <= NEW.date
               AND s.user_id = NEW.user_id)
          - (SELECT COALESCE(SUM(c.consumption_qty), 0)
             FROM public.inventory_consumption c
             WHERE c.product_name = NEW.product_name 
               AND c.date <= NEW.date
               AND c.user_id = NEW.user_id)
        ) * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 200.0)
      ELSE 0
    END AS computed_stock_cgst,
    -- SGST calculation (for intra-state transactions)
    CASE 
      WHEN COALESCE(NEW.sgst, 0) > 0 THEN
        (
          (SELECT COALESCE(SUM(p2.purchase_qty), 0)
           FROM public.inventory_purchases p2
           WHERE p2.product_name = NEW.product_name 
             AND p2.date <= NEW.date
             AND p2.user_id = NEW.user_id)
          - (SELECT COALESCE(SUM(s.quantity), 0)
             FROM public.inventory_sales_new s
             WHERE s.product_name = NEW.product_name 
               AND s.date <= NEW.date
               AND s.user_id = NEW.user_id)
          - (SELECT COALESCE(SUM(c.consumption_qty), 0)
             FROM public.inventory_consumption c
             WHERE c.product_name = NEW.product_name 
               AND c.date <= NEW.date
               AND c.user_id = NEW.user_id)
        ) * COALESCE(NEW.mrp_excl_gst, 0) * (COALESCE(NEW.gst_percentage, 18) / 200.0)
      ELSE 0
    END AS computed_stock_sgst,
    -- Total stock value calculation
    (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = NEW.product_name 
         AND p2.date <= NEW.date
         AND p2.user_id = NEW.user_id)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = NEW.product_name 
           AND s.date <= NEW.date
           AND s.user_id = NEW.user_id)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = NEW.product_name 
           AND c.date <= NEW.date
           AND c.user_id = NEW.user_id)
    ) * COALESCE(NEW.mrp_incl_gst, 0) AS computed_stock_total_value,
    -- Purchase cost per unit (excluding GST)
    COALESCE(NEW.mrp_excl_gst, 0) AS "Purchase_Cost/Unit(Ex.GST)",
    -- Price including discount
    COALESCE(NEW.mrp_incl_gst, 0) * (1 - COALESCE(NEW.discount_on_purchase_percentage, 0) / 100.0) AS price_inlcuding_disc,
    -- Transaction type
    'purchase' AS transaction_type,
    NEW.user_id,
    NOW(), NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Add user_id column to purchase_history_with_stock if it doesn't exist
ALTER TABLE public.purchase_history_with_stock 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Update existing records to include user_id (assuming all existing records belong to Surat user)
UPDATE public.purchase_history_with_stock 
SET user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
WHERE user_id IS NULL;

-- 5. Recreate the trigger with the new function
DROP TRIGGER IF EXISTS tr_inventory_purchases_insert ON public.inventory_purchases;
CREATE TRIGGER tr_inventory_purchases_insert
AFTER INSERT ON public.inventory_purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_insert_purchase_history_stock_with_user();

-- 6. Create a function to recalculate all purchase history stock for a user
CREATE OR REPLACE FUNCTION recalculate_all_purchase_history_stock(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER := 0;
  purchase_record RECORD;
BEGIN
  -- Delete all existing purchase history records for the user
  DELETE FROM public.purchase_history_with_stock 
  WHERE user_id = user_id_param;
  
  -- Re-insert all purchase records with correct stock calculations
  INSERT INTO public.purchase_history_with_stock (
    purchase_id, date, product_id, product_name, hsn_code, units,
    purchase_invoice_number, purchase_qty, mrp_incl_gst, mrp_excl_gst,
    discount_on_purchase_percentage, gst_percentage, purchase_taxable_value,
    purchase_igst, purchase_cgst, purchase_sgst, purchase_invoice_value_rs,
    supplier, current_stock_at_purchase, computed_stock_taxable_value,
    computed_stock_igst, computed_stock_cgst, computed_stock_sgst,
    computed_stock_total_value, "Purchase_Cost/Unit(Ex.GST)", price_inlcuding_disc, 
    transaction_type, user_id, created_at, updated_at
  )
  SELECT
    p.purchase_id, p.date, p.product_id, p.product_name, p.hsn_code, p.units,
    p.purchase_invoice_number, p.purchase_qty, p.mrp_incl_gst, p.mrp_excl_gst,
    p.discount_on_purchase_percentage, p.gst_percentage, p.purchase_taxable_value,
    p.purchase_igst, p.purchase_cgst, p.purchase_sgst, p.purchase_invoice_value_rs,
    p."Vendor",
    -- Calculate current stock at purchase
    (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = p.product_name 
         AND p2.date <= p.date
         AND p2.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = p.product_name 
           AND s.date <= p.date
           AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = p.product_name 
           AND c.date <= p.date
           AND c.user_id = user_id_param)
    ) AS current_stock_at_purchase,
    -- Calculate stock values
    (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = p.product_name 
         AND p2.date <= p.date
         AND p2.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = p.product_name 
           AND s.date <= p.date
           AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = p.product_name 
           AND c.date <= p.date
           AND c.user_id = user_id_param)
    ) * COALESCE(p.mrp_excl_gst, 0) AS computed_stock_taxable_value,
    -- IGST calculation
    CASE 
      WHEN COALESCE(p.purchase_igst, 0) > 0 THEN
        (
          (SELECT COALESCE(SUM(p2.purchase_qty), 0)
           FROM public.inventory_purchases p2
           WHERE p2.product_name = p.product_name 
             AND p2.date <= p.date
             AND p2.user_id = user_id_param)
          - (SELECT COALESCE(SUM(s.quantity), 0)
             FROM public.inventory_sales_new s
             WHERE s.product_name = p.product_name 
               AND s.date <= p.date
               AND s.user_id = user_id_param)
          - (SELECT COALESCE(SUM(c.consumption_qty), 0)
             FROM public.inventory_consumption c
             WHERE c.product_name = p.product_name 
               AND c.date <= p.date
               AND c.user_id = user_id_param)
        ) * COALESCE(p.mrp_excl_gst, 0) * (COALESCE(p.gst_percentage, 18) / 100.0)
      ELSE 0
    END AS computed_stock_igst,
    -- CGST calculation
    CASE 
      WHEN COALESCE(p.purchase_cgst, 0) > 0 THEN
        (
          (SELECT COALESCE(SUM(p2.purchase_qty), 0)
           FROM public.inventory_purchases p2
           WHERE p2.product_name = p.product_name 
             AND p2.date <= p.date
             AND p2.user_id = user_id_param)
          - (SELECT COALESCE(SUM(s.quantity), 0)
             FROM public.inventory_sales_new s
             WHERE s.product_name = p.product_name 
               AND s.date <= p.date
               AND s.user_id = user_id_param)
          - (SELECT COALESCE(SUM(c.consumption_qty), 0)
             FROM public.inventory_consumption c
             WHERE c.product_name = p.product_name 
               AND c.date <= p.date
               AND c.user_id = user_id_param)
        ) * COALESCE(p.mrp_excl_gst, 0) * (COALESCE(p.gst_percentage, 18) / 200.0)
      ELSE 0
    END AS computed_stock_cgst,
    -- SGST calculation
    CASE 
      WHEN COALESCE(p.purchase_sgst, 0) > 0 THEN
        (
          (SELECT COALESCE(SUM(p2.purchase_qty), 0)
           FROM public.inventory_purchases p2
           WHERE p2.product_name = p.product_name 
             AND p2.date <= p.date
             AND p2.user_id = user_id_param)
          - (SELECT COALESCE(SUM(s.quantity), 0)
             FROM public.inventory_sales_new s
             WHERE s.product_name = p.product_name 
               AND s.date <= p.date
               AND s.user_id = user_id_param)
          - (SELECT COALESCE(SUM(c.consumption_qty), 0)
             FROM public.inventory_consumption c
             WHERE c.product_name = p.product_name 
               AND c.date <= p.date
               AND c.user_id = user_id_param)
        ) * COALESCE(p.mrp_excl_gst, 0) * (COALESCE(p.gst_percentage, 18) / 200.0)
      ELSE 0
    END AS computed_stock_sgst,
    -- Total stock value
    (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = p.product_name 
         AND p2.date <= p.date
         AND p2.user_id = user_id_param)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = p.product_name 
           AND s.date <= p.date
           AND s.user_id = user_id_param)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM public.inventory_consumption c
         WHERE c.product_name = p.product_name 
           AND c.date <= p.date
           AND c.user_id = user_id_param)
    ) * COALESCE(p.mrp_incl_gst, 0) AS computed_stock_total_value,
    -- Purchase cost per unit
    COALESCE(p.mrp_excl_gst, 0) AS "Purchase_Cost/Unit(Ex.GST)",
    -- Price including discount
    COALESCE(p.mrp_incl_gst, 0) * (1 - COALESCE(p.discount_on_purchase_percentage, 0) / 100.0) AS price_inlcuding_disc,
    'purchase' AS transaction_type,
    user_id_param,
    p.created_at, p.updated_at
  FROM public.inventory_purchases p
  WHERE p.user_id = user_id_param
  ORDER BY p.date ASC, p.created_at ASC;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON public.purchase_history_with_stock(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_product_name ON public.purchase_history_with_stock(product_name);
CREATE INDEX IF NOT EXISTS idx_purchase_history_date ON public.purchase_history_with_stock(date);
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_user_product_date ON public.inventory_purchases(user_id, product_name, date);
CREATE INDEX IF NOT EXISTS idx_inventory_sales_user_product_date ON public.inventory_sales_new(user_id, product_name, date);
CREATE INDEX IF NOT EXISTS idx_inventory_consumption_user_product_date ON public.inventory_consumption(user_id, product_name, date);

-- 8. Recalculate all purchase history stock for Surat user
SELECT recalculate_all_purchase_history_stock('3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid);

-- 9. Verify the fix by checking a sample record
SELECT 
  product_name,
  purchase_qty,
  current_stock_at_purchase,
  computed_stock_taxable_value,
  computed_stock_igst,
  computed_stock_cgst,
  computed_stock_sgst,
  computed_stock_total_value
FROM public.purchase_history_with_stock 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
ORDER BY date DESC 
LIMIT 5; 