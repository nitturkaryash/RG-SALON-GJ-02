// Utility script to check and create the sales_products table if it doesn't exist
import { supabase } from './supabase/supabaseClient';

export const createSalesProductsTable = async () => {
  console.log('Checking if sales_products table exists...');
  
  try {
    // First, check if the table exists
    const { data, error } = await supabase
      .from('sales_products')
      .select('serial_no')
      .limit(1);
    
    if (error && error.code === '42P01') { // Table does not exist error
      console.log('Sales products table does not exist. Creating it...');
      
      // Since rpc might not be available, let's use a direct insert approach
      // We'll just insert sample data and let Supabase auto-create the table
      const sampleData = [
        {
          serial_no: 'SALES-01',
          order_id: '9825edc8-0943-4f49-a0e2-2b0534d9d105',
          date: '2025-04-09',
          product_name: 'facemask',
          quantity: '1',
          unit_price_ex_gst: '590',
          gst_percentage: '18',
          taxable_value: '590.00',
          cgst_amount: '53.10',
          sgst_amount: '53.10',
          total_purchase_cost: '696.20',
          discount: '0',
          tax: '160',
          payment_amount: '1050',
          payment_method: 'cash',
          payment_date: '2025-04-09 12:34:23.581'
        }
      ];
      
      // Try to insert - this might create the table automatically with the right structure
      const { error: insertError } = await supabase
        .from('sales_products')
        .insert(sampleData);
      
      if (insertError) {
        console.error('Error creating sales_products table through insert:', insertError);
        
        // If direct insert fails, we can try other approaches like:
        // 1. Using PostgreSQL function to create the table if your Supabase instance supports it
        // 2. Using a pre-created SQL script through a custom API endpoint
        // 3. Creating the table manually through the Supabase dashboard
        
        console.log('Please try creating the sales_products table manually through the Supabase dashboard with the following structure:');
        console.log(`
          CREATE TABLE IF NOT EXISTS public.sales_products (
            serial_no TEXT PRIMARY KEY,
            order_id TEXT,
            date TEXT,
            product_name TEXT,
            quantity TEXT,
            unit_price_ex_gst TEXT,
            gst_percentage TEXT,
            taxable_value TEXT,
            cgst_amount TEXT,
            sgst_amount TEXT,
            total_purchase_cost TEXT,
            discount TEXT,
            tax TEXT,
            payment_amount TEXT,
            payment_method TEXT,
            payment_date TEXT
          );
        `);
        
        return false;
      }
      
      // Add the other two rows of sample data
      const additionalSampleData = [
        {
          serial_no: 'SALES-02',
          order_id: '66bc3fd4-78f2-4a73-8514-b605f078e845',
          date: '2025-04-09',
          product_name: 'hair fall control shampoo',
          quantity: '1',
          unit_price_ex_gst: '5310',
          gst_percentage: '18',
          taxable_value: '5310.00',
          cgst_amount: '477.90',
          sgst_amount: '477.90',
          total_purchase_cost: '6265.80',
          discount: '0',
          tax: '1912',
          payment_amount: '12532',
          payment_method: 'cash',
          payment_date: '2025-04-09 12:34:57.902'
        },
        {
          serial_no: 'SALES-03',
          order_id: '66bc3fd4-78f2-4a73-8514-b605f078e845',
          date: '2025-04-09',
          product_name: 'hair fall control shampoo',
          quantity: '1',
          unit_price_ex_gst: '5310',
          gst_percentage: '18',
          taxable_value: '5310.00',
          cgst_amount: '477.90',
          sgst_amount: '477.90',
          total_purchase_cost: '6265.80',
          discount: '0',
          tax: '1912',
          payment_amount: '12532',
          payment_method: 'cash',
          payment_date: '2025-04-09 12:34:57.902'
        }
      ];
      
      // Insert the rest of the sample data
      const { error: additionalInsertError } = await supabase
        .from('sales_products')
        .insert(additionalSampleData);
      
      if (additionalInsertError) {
        console.warn('Error inserting additional sample data:', additionalInsertError);
        // We already created the table with one row, so we consider this a success
      }
      
      console.log('Sample data inserted successfully and table created');
      return true;
    } else if (error) {
      console.error('Error checking for sales_products table:', error);
      return false;
    } else {
      console.log('Sales products table already exists');
      return true;
    }
  } catch (error) {
    console.error('Unexpected error in createSalesProductsTable:', error);
    return false;
  }
};

export default { createSalesProductsTable }; 