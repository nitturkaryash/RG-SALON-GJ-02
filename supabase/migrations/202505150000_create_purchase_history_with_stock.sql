-- Drop old history object (could be table or view)
DROP VIEW IF EXISTS public.purchase_history_with_stock;
DROP TABLE IF EXISTS public.purchase_history_with_stock;

-- Create a new table to store purchase history with computed stock metrics
CREATE TABLE public.purchase_history_with_stock (
  purchase_id UUID PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  product_id UUID,
  product_name TEXT,
  hsn_code TEXT,
  units TEXT,
  purchase_invoice_number TEXT,
  purchase_qty INTEGER,
  mrp_incl_gst NUMERIC,
  mrp_excl_gst NUMERIC,
  discount_on_purchase_percentage NUMERIC,
  gst_percentage NUMERIC,
  purchase_taxable_value NUMERIC,
  purchase_igst NUMERIC,
  purchase_cgst NUMERIC,
  purchase_sgst NUMERIC,
  purchase_invoice_value_rs NUMERIC,
  supplier TEXT,
  current_stock_at_purchase INTEGER,
  computed_stock_taxable_value NUMERIC,
  computed_stock_igst NUMERIC,
  computed_stock_cgst NUMERIC,
  computed_stock_sgst NUMERIC,
  computed_stock_total_value NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Initial population from existing inventory_purchases
INSERT INTO public.purchase_history_with_stock (
  purchase_id, date, product_id, product_name, hsn_code, units,
  purchase_invoice_number, purchase_qty, mrp_incl_gst, mrp_excl_gst,
  discount_on_purchase_percentage, gst_percentage, purchase_taxable_value,
  purchase_igst, purchase_cgst, purchase_sgst, purchase_invoice_value_rs,
  supplier, current_stock_at_purchase, computed_stock_taxable_value,
  computed_stock_igst, computed_stock_cgst, computed_stock_sgst,
  computed_stock_total_value, created_at, updated_at
)
SELECT
  p.purchase_id,
  p.date,
  p.product_id,
  p.product_name,
  p.hsn_code,
  p.units,
  p.purchase_invoice_number,
  p.purchase_qty,
  p.mrp_incl_gst,
  p.mrp_excl_gst,
  p.discount_on_purchase_percentage,
  p.gst_percentage,
  p.purchase_taxable_value,
  p.purchase_igst,
  p.purchase_cgst,
  p.purchase_sgst,
  p.purchase_invoice_value_rs,
  p."Vendor",
  -- Compute live stock at purchase
  (
    (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = p.product_name AND p2.date <= p.date)
    - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = p.product_name AND s.date <= p.date)
    - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = p.product_name AND c.date <= p.date)
  ) AS current_stock_at_purchase,
  -- Stock valuation
  (
    (
      (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = p.product_name AND p2.date <= p.date)
      - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = p.product_name AND s.date <= p.date)
      - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = p.product_name AND c.date <= p.date)
    ) * p.mrp_excl_gst
  ) AS computed_stock_taxable_value,
  ((
    (
      (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = p.product_name AND p2.date <= p.date)
      - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = p.product_name AND s.date <= p.date)
      - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = p.product_name AND c.date <= p.date)
    ) * p.mrp_excl_gst * (p.gst_percentage/100.0)
  )) AS computed_stock_igst,
  ((
    (
      (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = p.product_name AND p2.date <= p.date)
      - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = p.product_name AND s.date <= p.date)
      - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = p.product_name AND c.date <= p.date)
    ) * p.mrp_excl_gst * (p.gst_percentage/200.0)
  )) AS computed_stock_cgst,
  ((
    (
      (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = p.product_name AND p2.date <= p.date)
      - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = p.product_name AND s.date <= p.date)
      - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = p.product_name AND c.date <= p.date)
    ) * p.mrp_excl_gst * (p.gst_percentage/200.0)
  )) AS computed_stock_sgst,
  ((
    (
      (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = p.product_name AND p2.date <= p.date)
      - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = p.product_name AND s.date <= p.date)
      - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = p.product_name AND c.date <= p.date)
    ) * p.mrp_excl_gst * (1 + p.gst_percentage/100.0)
  )) AS computed_stock_total_value,
  p.created_at,
  p.updated_at
FROM public.inventory_purchases p;

-- Function to auto-populate on new insert
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
    computed_stock_total_value, created_at, updated_at
  )
  SELECT
    NEW.purchase_id, NEW.date, NEW.product_id, NEW.product_name, NEW.hsn_code, NEW.units,
    NEW.purchase_invoice_number, NEW.purchase_qty, NEW.mrp_incl_gst, NEW.mrp_excl_gst,
    NEW.discount_on_purchase_percentage, NEW.gst_percentage, NEW.purchase_taxable_value,
    NEW.purchase_igst, NEW.purchase_cgst, NEW.purchase_sgst, NEW.purchase_invoice_value_rs,
    NEW."Vendor",
    ((SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
     - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
     - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
    ) AS current_stock_at_purchase,
    -- computed_stock_taxable_value, igst, cgst, sgst, total
    ((SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
     - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
     - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
    ) * NEW.mrp_excl_gst AS computed_stock_taxable_value,
    ((SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
     - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
     - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
    ) * NEW.mrp_excl_gst * (NEW.gst_percentage/100.0) AS computed_stock_igst,
    ((SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
     - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
     - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
    ) * NEW.mrp_excl_gst * (NEW.gst_percentage/200.0) AS computed_stock_cgst,
    ((SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
     - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
     - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
    ) * NEW.mrp_excl_gst * (NEW.gst_percentage/200.0) AS computed_stock_sgst,
    ((SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
     - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
     - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
    ) * NEW.mrp_excl_gst * (1 + NEW.gst_percentage/100.0) AS computed_stock_total_value,
    NOW(), NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to inventory_purchases
DROP TRIGGER IF EXISTS tr_inventory_purchases_insert ON public.inventory_purchases;
CREATE TRIGGER tr_inventory_purchases_insert
AFTER INSERT ON public.inventory_purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_insert_purchase_history_stock(); 