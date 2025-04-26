-- Create a new view for sales products with detailed information
CREATE OR REPLACE VIEW sales_product_new AS
SELECT
    'SALES-' || LPAD(ROW_NUMBER() OVER (ORDER BY po.date)::TEXT, 2, '0') AS serial_no,
    po.id AS order_id,
    DATE(po.date) AS date,
    item->>'service_name' AS product_name,
    (item->>'quantity')::INTEGER AS quantity,
    (item->>'price')::NUMERIC AS unit_price_ex_gst,
    (item->>'gst_percentage')::NUMERIC AS gst_percentage,
    ROUND(((item->>'price')::NUMERIC * (item->>'quantity')::NUMERIC), 2) AS taxable_value,
    ROUND(((item->>'price')::NUMERIC * (item->>'quantity')::NUMERIC) * ((item->>'gst_percentage')::NUMERIC / 100) / 2, 2) AS cgst_amount,
    ROUND(((item->>'price')::NUMERIC * (item->>'quantity')::NUMERIC) * ((item->>'gst_percentage')::NUMERIC / 100) / 2, 2) AS sgst_amount,
    ROUND(((item->>'price')::NUMERIC * (item->>'quantity')::NUMERIC) * (1 + ((item->>'gst_percentage')::NUMERIC / 100)), 2) AS total_purchase_cost,
    po.discount,
    po.tax,
    COALESCE(p.amount, 0) AS payment_amount,
    p.payment_method,
    p.payment_date::timestamp
FROM
    pos_orders po,
    LATERAL jsonb_array_elements(po.services) AS item
LEFT JOIN LATERAL (
    SELECT
        (pmt->>'amount')::NUMERIC AS amount,
        pmt->>'payment_method' AS payment_method,
        (pmt->>'payment_date')::timestamp AS payment_date
    FROM jsonb_array_elements(po.payments) AS pmt
    LIMIT 1
) AS p ON TRUE
WHERE
    po.type = 'sale'
    AND item->>'type' = 'product';

-- Grant necessary permissions
GRANT SELECT ON sales_product_new TO postgres;
GRANT SELECT ON sales_product_new TO authenticated;
GRANT SELECT ON sales_product_new TO anon;

-- Remove any existing RLS policies on the view (if needed)
DROP POLICY IF EXISTS "Allow reading sales_product_new" ON sales_product_new;

-- Create a policy to allow reading the view
CREATE POLICY "Allow reading sales_product_new"
ON sales_product_new
FOR SELECT USING (true); 