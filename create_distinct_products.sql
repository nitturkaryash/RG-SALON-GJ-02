-- Create distinct_products view if it doesn't exist already
DROP VIEW IF EXISTS distinct_products;
CREATE OR REPLACE VIEW distinct_products AS
SELECT DISTINCT
  product_name,
  hsn_code,
  unit_type as units
FROM inventory_purchases;

-- Add helpful comment to explain this view's purpose
COMMENT ON VIEW distinct_products IS 'A helper view that provides a distinct list of products from inventory_purchases';

-- Force a schema refresh
NOTIFY pgrst, 'reload schema'; 