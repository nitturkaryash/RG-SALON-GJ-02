-- Drop the existing view if it exists
DROP VIEW IF EXISTS balance_stock_view CASCADE;

-- Create a new balance_stock_view directly from products table
CREATE VIEW balance_stock_view AS
SELECT 
  id AS product_id,
  name AS product_name,
  stock_quantity AS balance_qty,
  hsn_code,
  units
FROM 
  products
WHERE
  stock_quantity IS NOT NULL;

-- Force schema refresh
NOTIFY pgrst, 'reload schema';
