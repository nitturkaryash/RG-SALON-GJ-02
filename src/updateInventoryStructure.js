const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Use dynamic import for ES modules
async function updateStructure() {
  try {
    // Import the executeSQL function
    const { executeSQL } = await import('./utils/csvExporter.js');
    
    const sql = `
-- Fix inventory_balance_stock view to include more product details
CREATE OR REPLACE VIEW inventory_balance_stock AS
SELECT
  p.product_name,
  p.hsn_code,
  p.units,
  SUM(p.purchase_qty) as total_purchases,
  COALESCE(SUM(s.sales_qty), 0) as total_sales,
  COALESCE(SUM(c.consumption_qty), 0) as total_consumption,
  SUM(p.purchase_qty) - COALESCE(SUM(s.sales_qty), 0) - COALESCE(SUM(c.consumption_qty), 0) as balance_qty,
  AVG(p.mrp_incl_gst) as mrp_incl_gst,
  AVG(p.gst_percentage) as gst_percentage,
  AVG(p.purchase_taxable_value / NULLIF(p.purchase_qty, 0)) as avg_purchase_cost_per_unit
FROM
  inventory_purchases p
LEFT JOIN
  inventory_sales s ON p.product_name = s.product_name
LEFT JOIN
  inventory_consumption c ON p.product_name = c.product_name
GROUP BY
  p.product_name, p.hsn_code, p.units;

-- Add trigger to update consumption when orders are completed
CREATE OR REPLACE FUNCTION update_inventory_on_order_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to 'Completed'
  IF NEW.status = 'Completed' AND (OLD.status != 'Completed' OR OLD.status IS NULL) THEN
    -- For salon consumption type only
    IF NEW.purchase_type = 'salon_consumption' OR NEW.purchase_type = 'regular' THEN
      -- Insert consumption records from order items
      INSERT INTO inventory_consumption (
        id,
        date,
        product_name,
        requisition_voucher_no,
        consumption_qty,
        purchase_cost_per_unit_ex_gst
      )
      SELECT 
        'consume-' || NEW.order_id || '-' || i.product_name as id,
        NEW.date,
        i.product_name,
        NEW.order_id,
        i.quantity,
        (SELECT AVG(p.purchase_taxable_value / NULLIF(p.purchase_qty, 0)) 
         FROM inventory_purchases p 
         WHERE p.product_name = i.product_name) as cost_per_unit
      FROM 
        pos_order_items i
      WHERE 
        i.order_id = NEW.order_id AND
        i.type = 'Product' AND
        NOT EXISTS (
          SELECT 1 FROM inventory_consumption c
          WHERE c.requisition_voucher_no = NEW.order_id AND c.product_name = i.product_name
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_inventory_on_order_completion_trigger ON pos_orders;
CREATE TRIGGER update_inventory_on_order_completion_trigger
AFTER UPDATE ON pos_orders
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_order_completion();

-- Create function to check product stock
CREATE OR REPLACE FUNCTION check_product_stock(product_name TEXT, quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  available_stock INTEGER;
BEGIN
  -- Get available stock
  SELECT balance_qty INTO available_stock
  FROM inventory_balance_stock
  WHERE product_name = $1;
  
  -- Return true if enough stock available
  RETURN COALESCE(available_stock, 0) >= $2;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to execute functions
GRANT EXECUTE ON FUNCTION check_product_stock(TEXT, INTEGER) TO PUBLIC;
GRANT EXECUTE ON FUNCTION update_inventory_on_order_completion() TO PUBLIC;

-- Refresh the schema
NOTIFY pgrst, 'reload schema';
    `;
    
    // Execute the SQL to update the database structure
    const result = await executeSQL(sql);
    
    console.log('Database structure update result:', result);
  } catch (error) {
    console.error('Error updating database structure:', error);
  }
}

// Run the function
updateStructure(); 