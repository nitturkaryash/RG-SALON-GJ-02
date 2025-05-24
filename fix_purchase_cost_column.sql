-- Fix NULL values in purchase cost columns for purchase_history_with_stock table
-- This script populates the Purchase_Cost/Unit(Ex.GST) and price_inlcuding_disc columns
-- with the calculated purchase cost per unit excluding GST

-- Update Purchase_Cost/Unit(Ex.GST) column
UPDATE purchase_history_with_stock
SET "Purchase_Cost/Unit(Ex.GST)" = 
  CASE 
    WHEN purchase_qty > 0 AND purchase_taxable_value IS NOT NULL 
    THEN purchase_taxable_value / purchase_qty 
    ELSE NULL 
  END
WHERE "Purchase_Cost/Unit(Ex.GST)" IS NULL;

-- Update price_inlcuding_disc column with the same value
UPDATE purchase_history_with_stock
SET price_inlcuding_disc = 
  CASE 
    WHEN purchase_qty > 0 AND purchase_taxable_value IS NOT NULL 
    THEN purchase_taxable_value / purchase_qty 
    ELSE NULL 
  END
WHERE price_inlcuding_disc IS NULL;

-- Update the trigger function to ensure new records get populated correctly
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
    computed_stock_total_value, "Purchase_Cost/Unit(Ex.GST)", price_inlcuding_disc, created_at, updated_at
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
    -- Calculate Purchase Cost/Unit(Ex.GST) as purchase_taxable_value / purchase_qty
    CASE WHEN NEW.purchase_qty > 0 THEN NEW.purchase_taxable_value / NEW.purchase_qty ELSE NULL END AS "Purchase_Cost/Unit(Ex.GST)",
    -- Calculate price_inlcuding_disc with the same value
    CASE WHEN NEW.purchase_qty > 0 THEN NEW.purchase_taxable_value / NEW.purchase_qty ELSE NULL END AS price_inlcuding_disc,
    NOW(), NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Display a message about the changes
SELECT 'Fixed NULL values in Purchase_Cost/Unit(Ex.GST) and price_inlcuding_disc columns' AS status; 