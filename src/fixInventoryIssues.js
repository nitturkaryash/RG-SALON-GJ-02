// Fix inventory issues script
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Main function to fix inventory issues
async function fixInventoryIssues() {
  try {
    // Import the executeSQL function
    const { executeSQL } = await import('./utils/supabase/directSqlExecution.js');
    
    console.log('Starting inventory fix script...');
    
    // First, fix the inventory_balance_stock view to ensure it has all necessary fields
    const fixBalanceStockViewSQL = `
    -- Drop and recreate inventory_balance_stock view with all fields needed
    DROP VIEW IF EXISTS inventory_balance_stock;
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
    `;
    
    console.log('Fixing inventory_balance_stock view...');
    const balanceStockResult = await executeSQL(fixBalanceStockViewSQL, { debug: true });
    console.log('Balance stock view fix result:', balanceStockResult.success ? 'Success' : 'Failed');
    
    // Next, create the distinct_products view if it doesn't exist
    // This view simply provides a distinct list of products from inventory_purchases
    const createDistinctProductsViewSQL = `
    -- Create distinct_products view if it doesn't exist already
    DROP VIEW IF EXISTS distinct_products;
    CREATE OR REPLACE VIEW distinct_products AS
    SELECT DISTINCT
      product_name,
      hsn_code,
      units
    FROM inventory_purchases;
    
    -- Add helpful comment to explain this view's purpose
    COMMENT ON VIEW distinct_products IS 'A helper view that provides a distinct list of products from inventory_purchases';
    `;
    
    console.log('Creating distinct_products view...');
    const distinctProductsResult = await executeSQL(createDistinctProductsViewSQL, { debug: true });
    console.log('Distinct products view creation result:', distinctProductsResult.success ? 'Success' : 'Failed');
    
    // Force a schema refresh to make sure the changes are visible
    const refreshSchemaSQL = `NOTIFY pgrst, 'reload schema';`;
    console.log('Refreshing schema...');
    await executeSQL(refreshSchemaSQL, { debug: true });
    
    console.log('Inventory fix script completed.');
    
  } catch (error) {
    console.error('Error fixing inventory issues:', error);
  }
}

// Run the function
fixInventoryIssues(); 