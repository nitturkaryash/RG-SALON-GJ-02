-- Migration to add remaining_stock to the sales_product_new view
-- This enhances the view to calculate the remaining stock after each transaction

-- Drop the existing view
DROP VIEW IF EXISTS sales_product_new;

-- Create the updated view with remaining_stock calculation
CREATE OR REPLACE VIEW sales_product_new AS
WITH ranked_sales AS (
  SELECT
    po.id AS order_id,
    CONCAT('INV-', SUBSTR(po.id::text, 1, 8)) AS serial_no,
    po.created_at AS date,
    p.id AS product_id,
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
    -- New fields from previous migration
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
    (p.stock_quantity * p.price * (COALESCE(p.gst_percentage, 18) / 100))::numeric AS c_tax,
    -- Add row number for calculating running stock
    ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY po.created_at) AS sale_order
  FROM 
    pos_orders po
  JOIN 
    pos_order_items pi ON po.id::text = pi.order_id
  LEFT JOIN 
    products p ON pi.item_id = p.id
  WHERE 
    pi.type = 'product'
),
initial_stock_calc AS (
  -- Calculate initial stock for each product by adding all sold quantities to current stock
  SELECT
    product_id,
    current_stock + SUM(quantity::numeric) AS initial_stock
  FROM
    ranked_sales
  GROUP BY
    product_id, current_stock
),
stock_changes AS (
  -- Calculate remaining stock after each sale
  SELECT
    rs.*,
    isc.initial_stock,
    (isc.initial_stock - SUM(rs.quantity::numeric) OVER (
      PARTITION BY rs.product_id 
      ORDER BY rs.date 
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ))::numeric AS remaining_stock
  FROM
    ranked_sales rs
  JOIN
    initial_stock_calc isc ON rs.product_id = isc.product_id
)
SELECT
  order_id,
  serial_no,
  date,
  product_name,
  quantity,
  unit_price_ex_gst,
  gst_percentage,
  taxable_value,
  cgst_amount,
  sgst_amount,
  total_purchase_cost,
  discount,
  tax,
  payment_amount,
  payment_method,
  payment_date,
  hsn_code,
  product_type,
  mrp_incl_gst,
  discounted_sales_rate_ex_gst,
  invoice_value,
  igst_amount,
  current_stock,
  -- Current stock tax breakdown and total value columns
  (current_stock * (price / (1 + (COALESCE(gst_percentage::numeric, 18) / 100)))) AS current_stock_taxable_value,
  CASE WHEN false THEN 0 ELSE (current_stock * (price / (1 + (COALESCE(gst_percentage::numeric, 18) / 100))) * (COALESCE(gst_percentage::numeric, 18) / 100)) END AS current_stock_igst, -- Set logic for interstate if needed
  (current_stock * (price / (1 + (COALESCE(gst_percentage::numeric, 18) / 100))) * (COALESCE(gst_percentage::numeric, 18) / 200)) AS current_stock_cgst,
  (current_stock * (price / (1 + (COALESCE(gst_percentage::numeric, 18) / 100))) * (COALESCE(gst_percentage::numeric, 18) / 200)) AS current_stock_sgst,
  (current_stock * (price / (1 + (COALESCE(gst_percentage::numeric, 18) / 100)))
    + (current_stock * (price / (1 + (COALESCE(gst_percentage::numeric, 18) / 100))) * (COALESCE(gst_percentage::numeric, 18) / 100))) AS current_stock_total_value,
  current_stock_amount,
  c_sgst,
  c_cgst,
  c_tax,
  product_id,
  -- Add the calculated remaining stock
  GREATEST(0, remaining_stock) AS remaining_stock
FROM 
  stock_changes
ORDER BY 
  date DESC;

-- Add a comment to the view
COMMENT ON VIEW sales_product_new IS 'View of product sales with additional fields for reporting including remaining stock after each transaction';

-- Notify about schema changes
NOTIFY pgrst, 'reload schema'; 