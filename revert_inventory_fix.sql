-- =================================================================
-- REVERT SCRIPT for Inventory Trigger Fix
-- =================================================================
-- This script will:
-- 1. Drop the new triggers and functions that were created.
-- 2. Restore the original trigger on 'inventory_purchases'.
-- NOTE: This brings your database back to the state where stock was
-- NOT updating automatically on purchase.
-- =================================================================

-- ========= STEP 1: DROP THE NEW TRIGGERS AND FUNCTIONS =========

-- Drop the new purchase trigger and its function
DROP TRIGGER IF EXISTS after_purchase_update_stock ON public.inventory_purchases;
DROP FUNCTION IF EXISTS public.handle_purchase_stock_update();

-- Drop the new sales trigger and its function
DROP TRIGGER IF EXISTS after_sale_deduct_stock ON public.sales;
DROP FUNCTION IF EXISTS public.handle_sale_stock_deduction();

RAISE NOTICE 'New triggers and functions have been dropped.';

-- ========= STEP 2: RESTORE THE ORIGINAL PURCHASE TRIGGER AND FUNCTION =========

-- Restore the original function that inserts into the history table but does NOT update stock.
CREATE OR REPLACE FUNCTION public.fn_insert_purchase_history_stock()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
    NEW."Vendor",
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
$function$;

-- Restore the original INSTEAD OF trigger on inventory_purchases
CREATE TRIGGER tr_inventory_purchases_insert
    INSTEAD OF INSERT ON public.inventory_purchases
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_insert_purchase_history_stock();

RAISE NOTICE 'Original purchase trigger has been restored.';

-- Note: The other conflicting triggers on 'sales' and 'pos_orders' are NOT restored
-- as they were part of the original problem. If you need to restore them,
-- you would need to find their original definitions from your version control or backups.

DO $$
BEGIN
    RAISE NOTICE 'Revert script complete. The database is back in its original (non-updating) state.';
END $$; 