-- First, ensure the distinct_products view exists
DROP VIEW IF EXISTS distinct_products;
CREATE OR REPLACE VIEW distinct_products AS
SELECT DISTINCT
  product_name,
  hsn_code,
  unit_type as units
FROM inventory_purchases;

-- Now create the balance stock view
DROP VIEW IF EXISTS balance_stock_view;
CREATE OR REPLACE VIEW balance_stock_view AS
SELECT
    p.product_name,
    p.hsn_code,
    p.units,
    -- Get the cost basis and GST from purchase data
    COALESCE(latest_purchases.purchase_excl_gst, 0) as purchase_excl_gst, 
    COALESCE(latest_purchases.gst_percentage, 18) as gst_percentage, 

    -- Calculate Balance Qty
    (COALESCE(purchases.total_purchased, 0) - COALESCE(sales.total_sold, 0) - COALESCE(consumption.total_consumed, 0)) AS balance_qty
FROM
    distinct_products p
LEFT JOIN (
    SELECT product_name, SUM(purchase_qty) AS total_purchased
    FROM inventory_purchases
    GROUP BY product_name 
) purchases ON purchases.product_name = p.product_name
LEFT JOIN (
    SELECT product_name, SUM(sales_qty) AS total_sold
    FROM inventory_sales 
    GROUP BY product_name
) sales ON sales.product_name = p.product_name
LEFT JOIN (
    SELECT product_name, SUM(consumption_qty) AS total_consumed
    FROM inventory_consumption
    GROUP BY product_name
) consumption ON consumption.product_name = p.product_name
-- Join to get latest cost/GST
LEFT JOIN (
    SELECT 
        product_name, 
        purchase_taxable_value / NULLIF(purchase_qty, 0) as purchase_excl_gst,
        gst_percentage
    FROM inventory_purchases
    ORDER BY date DESC
    LIMIT 1
) latest_purchases ON latest_purchases.product_name = p.product_name
WHERE 
    -- Only show items with a balance > 0
    (COALESCE(purchases.total_purchased, 0) - COALESCE(sales.total_sold, 0) - COALESCE(consumption.total_consumed, 0)) > 0;

-- Force a schema refresh
NOTIFY pgrst, 'reload schema'; 