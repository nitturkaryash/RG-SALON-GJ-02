// Script to check and fix inventory tables and views
const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} catch (error) {
  console.log('No .env file found, continuing with environment variables');
}

async function checkInventory() {
  try {
    // Import the necessary modules
    const { createClient } = require('@supabase/supabase-js');
    
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials. Please check your environment variables.');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Checking inventory tables...');
    
    // Check if inventory_purchases table exists
    const { data: purchases, error: purchasesError } = await supabase
      .from('inventory_purchases')
      .select('count()')
      .single();
    
    if (purchasesError) {
      console.error('Error checking inventory_purchases table:', purchasesError);
      throw new Error('inventory_purchases table may not exist');
    }
    
    const purchaseCount = purchases?.count || 0;
    console.log(`Found ${purchaseCount} records in inventory_purchases table`);
    
    // Check if inventory_balance_stock view exists by querying it
    const { data: balanceStock, error: balanceStockError } = await supabase
      .from('inventory_balance_stock')
      .select('*')
      .limit(5);
    
    if (balanceStockError) {
      console.error('Error checking inventory_balance_stock view:', balanceStockError);
      console.log('Creating inventory_balance_stock view...');
      
      // Try to create the view
      const { data: execData, error: execError } = await supabase
        .rpc('exec_sql', {
          sql_query: `
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
            
            NOTIFY pgrst, 'reload schema';
          `
        });
      
      if (execError) {
        console.error('Error creating inventory_balance_stock view:', execError);
      } else {
        console.log('Successfully created inventory_balance_stock view');
      }
    } else {
      console.log('inventory_balance_stock view exists with data:', balanceStock);
    }
    
    // Check if we have products with stock
    const { data: productsWithStock, error: stockError } = await supabase
      .from('inventory_balance_stock')
      .select('*')
      .gt('balance_qty', 0);
    
    if (stockError) {
      console.error('Error fetching products with stock:', stockError);
    } else {
      const stockCount = productsWithStock?.length || 0;
      console.log(`Found ${stockCount} products with stock > 0`);
      
      if (stockCount > 0) {
        console.log('Products available for POS:', productsWithStock.map(p => ({
          name: p.product_name,
          stock: p.balance_qty,
          price: p.mrp_incl_gst
        })));
      } else if (purchaseCount > 0) {
        console.warn('Warning: You have purchases but no products with stock > 0');
      }
    }
    
    console.log('Inventory check completed');
    
  } catch (error) {
    console.error('Error checking inventory:', error);
  }
}

// Execute the function
checkInventory(); 