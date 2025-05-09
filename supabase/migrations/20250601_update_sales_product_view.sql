-- Update the sales_product_new view to include additional fields

-- First, drop the existing view if it exists
DROP VIEW IF EXISTS sales_product_new;

-- Create the updated view with additional fields
CREATE OR REPLACE VIEW sales_product_new AS
SELECT
    po.id AS order_id,
    pi.id AS order_item_pk,
    CONCAT('INV-', SUBSTR(po.id::text, 1, 8)) AS serial_no,
    po.created_at AS date,
    p.name AS product_name,
    pi.quantity::text AS quantity,
    pi.unit_price::text AS unit_price_ex_gst,
    p.gst_percentage::text AS gst_percentage,
    (pi.quantity * pi.unit_price)::text AS taxable_value,
    (pi.quantity * pi.unit_price * (COALESCE(p.gst_percentage, 18) / 200))::text AS cgst_amount,
    (pi.quantity * pi.unit_price * (COALESCE(p.gst_percentage, 18) / 200))::text AS sgst_amount,
    NULL AS total_purchase_cost,
    COALESCE(po.discount, 0)::text AS discount,
    (pi.quantity * pi.unit_price * (COALESCE(p.gst_percentage, 18) / 100))::text AS tax,
    po.total::text AS payment_amount,
    po.payment_method AS payment_method,
    po.created_at AS payment_date,
    -- New fields
    p.hsn_code AS hsn_code,
    'product' AS product_type,
    p.mrp_incl_gst::text AS mrp_incl_gst,
    pi.unit_price::text AS discounted_sales_rate_ex_gst,
    (pi.quantity * pi.unit_price * (1 + COALESCE(p.gst_percentage, 18) / 100))::text AS invoice_value,
    0::text AS igst_amount,
    -- Current stock data
    p.stock_quantity AS current_stock,
    (p.stock_quantity * p.price)::numeric AS current_stock_amount,
    (p.stock_quantity * p.price * (COALESCE(p.gst_percentage, 18) / 200))::numeric AS c_sgst,
    (p.stock_quantity * p.price * (COALESCE(p.gst_percentage, 18) / 200))::numeric AS c_cgst,
    (p.stock_quantity * p.price * (COALESCE(p.gst_percentage, 18) / 100))::numeric AS c_tax
FROM 
    pos_orders po
JOIN 
    pos_order_items pi ON po.id = pi.order_id
LEFT JOIN 
    products p ON pi.item_id = p.id
WHERE 
    pi.type = 'product'
ORDER BY 
    po.created_at DESC;

-- Add a comment to the view
COMMENT ON VIEW sales_product_new IS 'View of product sales with additional fields for reporting';

-- Notify about schema changes
NOTIFY pgrst, 'reload schema'; 