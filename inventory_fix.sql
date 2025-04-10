-- Fix inventory_sales_new table and related issues

-- 1. First, let's examine the structure of the inventory_sales_new table entries that failed
SELECT * FROM inventory_sales_new
WHERE product_name IS NULL
LIMIT 10;

-- 2. Create a function to ensure product_name is never null
CREATE OR REPLACE FUNCTION ensure_inventory_sales_product_name()
RETURNS TRIGGER AS $$
BEGIN
  -- If product_name is NULL but product_id is not, try to get name from products
  IF NEW.product_name IS NULL AND NEW.product_id IS NOT NULL THEN
    -- Try to get name from products table
    SELECT name INTO NEW.product_name 
    FROM products 
    WHERE id::text = NEW.product_id;
    
    -- If still NULL, try from inventory_products
    IF NEW.product_name IS NULL THEN
      SELECT product_name INTO NEW.product_name 
      FROM inventory_products 
      WHERE product_id::text = NEW.product_id;
    END IF;
    
    -- If still NULL, set a default
    IF NEW.product_name IS NULL THEN
      NEW.product_name := 'Unknown Product (' || NEW.product_id || ')';
    END IF;
  END IF;
  
  -- Ensure other required fields are set with defaults
  IF NEW.date IS NULL THEN
    NEW.date := CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger on inventory_sales_new
DROP TRIGGER IF EXISTS ensure_product_name_trigger ON inventory_sales_new;
CREATE TRIGGER ensure_product_name_trigger
BEFORE INSERT OR UPDATE ON inventory_sales_new
FOR EACH ROW
EXECUTE FUNCTION ensure_inventory_sales_product_name();

-- 4. Also create similar trigger for inventory_sales
DROP TRIGGER IF EXISTS ensure_product_name_trigger_sales ON inventory_sales;
CREATE TRIGGER ensure_product_name_trigger_sales
BEFORE INSERT OR UPDATE ON inventory_sales
FOR EACH ROW
EXECUTE FUNCTION ensure_inventory_sales_product_name();

-- 5. Fix any existing NULL product_name records in inventory_sales_new
UPDATE inventory_sales_new
SET product_name = COALESCE(
  (SELECT name FROM products WHERE id::text = inventory_sales_new.product_id),
  (SELECT product_name FROM inventory_products WHERE product_id::text = inventory_sales_new.product_id),
  'Unknown Product (' || product_id || ')'
)
WHERE product_name IS NULL AND product_id IS NOT NULL;

-- 6. Fix any existing NULL product_name records in inventory_sales
UPDATE inventory_sales
SET product_name = COALESCE(
  (SELECT name FROM products WHERE id::text = inventory_sales.product_id),
  (SELECT product_name FROM inventory_products WHERE product_id::text = inventory_sales.product_id),
  'Unknown Product (' || product_id || ')'
)
WHERE product_name IS NULL AND product_id IS NOT NULL;

-- 7. Additional columns that might be missing in inventory_sales_new
ALTER TABLE inventory_sales_new
ALTER COLUMN product_name DROP NOT NULL;

-- 8. Make sure service-only orders can skip inventory_sales
-- Create a helper function to check if an order has products
CREATE OR REPLACE FUNCTION order_has_products(order_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the order has any services with type 'product'
  RETURN EXISTS (
    SELECT 1 FROM jsonb_array_elements(
      CASE 
        WHEN order_data->>'services' IS NOT NULL THEN
          order_data->'services'
        ELSE
          '[]'::jsonb
      END
    ) AS service
    WHERE service->>'type' = 'product'
  );
END;
$$ LANGUAGE plpgsql; 