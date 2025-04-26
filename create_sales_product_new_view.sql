DROP VIEW IF EXISTS sales_product_new;

CREATE OR REPLACE VIEW sales_product_new AS
WITH sales_data AS (
    SELECT
        po.id AS order_id,
        po.date AS order_date,
        item,
        (item->>'service_id')::UUID AS product_id,
        (item->>'quantity')::INTEGER AS quantity,
        (item->>'price')::NUMERIC AS unit_price_ex_gst,
        (item->>'gst_percentage')::NUMERIC AS gst_percentage,
        (item->>'mrp_incl_gst')::NUMERIC AS mrp_incl_gst,
        (item->>'unit_price')::NUMERIC AS discounted_sales_rate_ex_gst,
        po.discount,
        po.tax,
        pm.hsn_code,
        pm.units AS product_type,
        pm.stock_quantity AS current_stock,
        po.type,
        po.payment_method AS payment_type,
        item->>'service_name' AS product_name
    FROM pos_orders po
    CROSS JOIN LATERAL jsonb_array_elements(po.services) AS item
    LEFT JOIN product_master pm ON pm.id = (item->>'service_id')::UUID
    WHERE po.type = 'sale' AND item->>'type' = 'product'
),
sales_with_serial AS (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY order_date, order_id) AS rn
    FROM sales_data
),
total_sold_per_product AS (
    SELECT product_id, SUM(quantity) AS total_sold
    FROM sales_with_serial
    GROUP BY product_id
),
cumulative_sales AS (
    SELECT s.*,
           t.total_sold,
           (s.current_stock + t.total_sold) AS initial_stock,
           SUM(s.quantity) OVER (
               PARTITION BY s.product_id ORDER BY s.order_date, s.order_id
               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
           ) AS cumulative_quantity_sold
    FROM sales_with_serial s
    JOIN total_sold_per_product t ON s.product_id = t.product_id
),
final_sales AS (
    SELECT
        'SALES-' || LPAD(ROW_NUMBER() OVER (ORDER BY order_date)::TEXT, 2, '0') AS serial_no,
        order_id,
        DATE(order_date) AS date,
        product_name,
        quantity,
        unit_price_ex_gst,
        gst_percentage,
        ROUND(unit_price_ex_gst * quantity, 2) AS taxable_value,
        ROUND(unit_price_ex_gst * quantity * gst_percentage / 100 / 2, 2) AS cgst_amount,
        ROUND(unit_price_ex_gst * quantity * gst_percentage / 100 / 2, 2) AS sgst_amount,
        ROUND(unit_price_ex_gst * quantity * (1 + gst_percentage / 100), 2) AS total_purchase_cost,
        discount,
        tax,
        hsn_code,
        product_type,
        mrp_incl_gst,
        discounted_sales_rate_ex_gst,
        payment_type,
        ROUND(quantity * unit_price_ex_gst * (1 + gst_percentage / 100), 2) AS invoice_value,
        0 AS igst_amount,
        initial_stock,
        initial_stock - cumulative_quantity_sold AS remaining_stock,
        current_stock
    FROM cumulative_sales
)
SELECT * FROM final_sales; 