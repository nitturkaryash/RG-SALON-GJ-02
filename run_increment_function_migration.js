import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SQL for creating the increment_product_stock function
const incrementFunctionSQL = `
-- Create RPC function for incrementing product stock safely
CREATE OR REPLACE FUNCTION increment_product_stock(product_id UUID, increment_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Check if product exists
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = product_id) THEN
        RAISE EXCEPTION 'Product with ID % not found', product_id;
    END IF;

    -- Update the stock by adding the increment amount
    UPDATE products
    SET 
        current_stock = COALESCE(current_stock, 0) + increment_amount,
        updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
`;

async function createIncrementFunction() {
  console.log('Creating increment_product_stock function...');
  
  try {
    // Try using supabase.rpc to execute SQL
    const { data, error } = await supabase.rpc('exec', { sql: incrementFunctionSQL });
    
    if (error) {
      console.error('Error using RPC exec:', error);
      
      // Alternative: Try using a simple query
      console.log('Trying alternative approach with query...');
      const { data: queryData, error: queryError } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', 'increment_product_stock')
        .single();
        
      if (queryError && queryError.code !== 'PGRST116') {
        console.error('Error checking function existence:', queryError);
      } else if (queryData) {
        console.log('Function already exists!');
      } else {
        console.log('Function does not exist. Please run the SQL manually in your Supabase dashboard.');
        console.log('\nSQL to execute:');
        console.log(incrementFunctionSQL);
      }
      
    } else {
      console.log('Function created successfully!');
    }
    
    // Test if the function exists by trying to call it with invalid parameters
    console.log('Testing if function is accessible...');
    const { data: testData, error: testError } = await supabase.rpc('increment_product_stock', {
      product_id: '00000000-0000-0000-0000-000000000000',
      increment_amount: 1
    });
    
    if (testError) {
      if (testError.message.includes('not found')) {
        console.log('✅ Function exists and is accessible (test error as expected)');
      } else if (testError.message.includes('function')) {
        console.log('❌ Function still not found in schema');
        console.log('Please manually execute the following SQL in your Supabase SQL editor:');
        console.log(incrementFunctionSQL);
      } else {
        console.log('✅ Function exists and is accessible (different test error)');
      }
    } else {
      console.log('✅ Function exists and was called successfully');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
    console.log('\nPlease manually execute the following SQL in your Supabase SQL editor:');
    console.log(incrementFunctionSQL);
  }
}

// Run the script
createIncrementFunction()
  .then(() => console.log('\nScript execution complete'))
  .catch(err => console.error('Script failed:', err)); 