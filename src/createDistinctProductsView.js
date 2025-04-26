import { supabase } from './utils/supabase/supabaseClient.js';

// Main function to create the distinct_products view
async function createDistinctProductsView() {
  try {
    console.log('Starting script to create distinct_products view...');
    
    // SQL to create the distinct_products view
    const sql = `
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
    `;
    
    // Execute the SQL using RPC
    console.log('Executing SQL to create the view...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error creating view:', error);
      return;
    }
    
    console.log('Successfully created distinct_products view.');
    
    // Force a schema refresh
    const refreshSQL = `NOTIFY pgrst, 'reload schema';`;
    await supabase.rpc('exec_sql', { sql_query: refreshSQL });
    
    console.log('Schema refreshed. Script completed successfully.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createDistinctProductsView(); 