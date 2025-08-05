-- Fix sales_history_final view to display stock BEFORE sale instead of AFTER sale
-- This addresses the issue where SP DIA HYDRATE shows 8,6,6 instead of 8,7,6

-- Drop and recreate the sales_history_final view with correct stock calculation
DROP VIEW IF EXISTS public.sales_history_final;

CREATE VIEW public.sales_history_final AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            (item.value ->> 'service_name'::text) AS product_name,
            sum(((item.value ->> 'quantity'::text))::integer) AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            COALESCE(((item.value ->> 'current_stock')::integer), 0) AS stock_before_sale,
            pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
          GROUP BY po.id, po.date, (item.value ->> 'service_id'::text), (item.value ->> 'service_name'::text), (item.value ->> 'price'::text), (item.value ->> 'gst_percentage'::text), (item.value ->> 'mrp_incl_gst'::text), (item.value ->> 'unit_price'::text), po.discount_percentage, po.tax, pm.hsn_code, pm.units, po.type, po.current_stock, pm."Purchase_Cost/Unit(Ex.GST)"
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.product_id,
            sales_data.product_name,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.stock_before_sale,
            sales_data.purchase_cost_per_unit_ex_gst,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.product_id,
            s.product_name,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.stock_before_sale,
            s.purchase_cost_per_unit_ex_gst,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY cumulative_sales.order_date))::text, 2, '0'::text)) AS serial_no,
            cumulative_sales.order_id,
            date(cumulative_sales.order_date) AS date,
            cumulative_sales.product_name,
            cumulative_sales.quantity,
            cumulative_sales.unit_price_ex_gst,
            cumulative_sales.gst_percentage,
            round((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric), 2) AS taxable_value,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            cumulative_sales.discount_percentage,
            cumulative_sales.tax,
            cumulative_sales.hsn_code,
            cumulative_sales.product_type,
            cumulative_sales.mrp_incl_gst,
            cumulative_sales.discounted_sales_rate_ex_gst,
            round((((cumulative_sales.quantity)::numeric * cumulative_sales.unit_price_ex_gst) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            -- FIXED: Show stock BEFORE sale (as imported from Excel) instead of stock AFTER sale
            cumulative_sales.stock_before_sale AS stock,
            round((cumulative_sales.stock_before_sale::numeric * cumulative_sales.purchase_cost_per_unit_ex_gst), 2) AS stock_taxable_value
           FROM cumulative_sales
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.stock,
    final_sales.stock_taxable_value
   FROM final_sales;

-- Add comment explaining the fix
COMMENT ON VIEW public.sales_history_final IS 'Sales history view showing stock levels BEFORE each sale (as imported from Excel). Fixed to show stock_before_sale instead of stock_before_sale - quantity.'; 