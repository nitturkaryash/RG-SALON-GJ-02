-- Update sales_product_new view to include order_item_pk for proper deletion
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
        item->>'service_name' AS product_name,
        (item->>'id')::TEXT AS order_item_id,
        poi.id AS order_item_pk
    FROM pos_orders po
    CROSS JOIN LATERAL jsonb_array_elements(po.services) AS item
    LEFT JOIN product_master pm ON pm.id = (item->>'service_id')::UUID
    LEFT JOIN pos_order_items poi ON poi.pos_order_id = po.id AND poi.id::TEXT = (item->>'id')::TEXT
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
        discount / 100 AS discount_percentage,
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
        current_stock,
        order_item_id,
        order_item_pk
    FROM cumulative_sales
)
SELECT * FROM final_sales;

-- Create function for safely deleting sales items
DROP FUNCTION IF EXISTS delete_sales_item;

CREATE OR REPLACE FUNCTION delete_sales_item(item_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $delete_sales_item$
DECLARE
  result JSONB;
  affected_rows INT;
  order_uuid UUID;  -- declare order_uuid to track the parent order
BEGIN
  -- Log the deletion attempt for debugging
  RAISE NOTICE 'Attempting to delete sales item with ID: %', item_id;
  
  -- Check if the item exists
  IF NOT EXISTS (SELECT 1 FROM pos_order_items WHERE id = item_id::UUID) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item not found with ID: ' || item_id
    );
  END IF;

  -- Fetch the associated order ID and remove the service entry from the order's JSON
  SELECT pos_order_id INTO order_uuid FROM pos_order_items WHERE id = item_id::UUID;
  UPDATE pos_orders
  SET services = (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(services) AS elem
    WHERE elem->>'id' != item_id
  )
  WHERE id = order_uuid;
  RAISE NOTICE 'Removed JSON element from pos_orders for order %', order_uuid;

  -- Delete the item from pos_order_items
  DELETE FROM pos_order_items 
  WHERE id = item_id::UUID
  RETURNING count(*) INTO affected_rows;
  
  -- Check if deletion was successful
  IF affected_rows > 0 THEN
    result := jsonb_build_object(
      'success', true,
      'message', 'Successfully deleted sales item and removed from order JSON',
      'affected_rows', affected_rows
    );
  ELSE
    result := jsonb_build_object(
      'success', false,
      'error', 'Failed to delete item. No rows affected.'
    );
  END IF;
  
  RETURN result;
END;
$delete_sales_item$; 

-- Add a rule so that DELETE on the view deletes the underlying item and updates the JSON
DROP RULE IF EXISTS delete_sales_item_on_view ON sales_product_new;
CREATE RULE delete_sales_item_on_view AS
ON DELETE TO sales_product_new
DO INSTEAD (
  -- Remove the service element from the parent order's JSON array
  UPDATE pos_orders
  SET services = (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(services) AS elem
    WHERE elem->>'id' != OLD.order_item_id
  )
  WHERE id = OLD.order_id;
  -- Delete the row from the pos_order_items table
  DELETE FROM pos_order_items WHERE id = OLD.order_item_pk;
); 