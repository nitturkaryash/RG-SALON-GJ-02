// Import required modules
const { createClient } = require('@supabase/supabase-js');

// Use environment variables or provide connection details directly
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'your-anon-key';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL statements for creating and populating the sales_products table
const createTableSQL = `
  DROP TABLE IF EXISTS public.sales_products;
  
  CREATE TABLE public.sales_products (
    "serial_no" TEXT PRIMARY KEY,
    "order_id" TEXT,
    "date" TEXT,
    "product_name" TEXT,
    "quantity" TEXT,
    "unit_price_ex_gst" TEXT,
    "gst_percentage" TEXT,
    "taxable_value" TEXT,
    "cgst_amount" TEXT,
    "sgst_amount" TEXT,
    "total_purchase_cost" TEXT,
    "discount" TEXT,
    "tax" TEXT,
    "payment_amount" TEXT,
    "payment_method" TEXT,
    "payment_date" TEXT
  );
  
  INSERT INTO "public"."sales_products" ("serial_no", "order_id", "date", "product_name", "quantity", "unit_price_ex_gst", "gst_percentage", "taxable_value", "cgst_amount", "sgst_amount", "total_purchase_cost", "discount", "tax", "payment_amount", "payment_method", "payment_date") 
  VALUES 
  ('SALES-01', '9825edc8-0943-4f49-a0e2-2b0534d9d105', '2025-04-09', 'facemask', '1', '590', '18', '590.00', '53.10', '53.10', '696.20', '0', '160', '1050', 'cash', '2025-04-09 12:34:23.581'),
  ('SALES-02', '66bc3fd4-78f2-4a73-8514-b605f078e845', '2025-04-09', 'hair fall control shampoo', '1', '5310', '18', '5310.00', '477.90', '477.90', '6265.80', '0', '1912', '12532', 'cash', '2025-04-09 12:34:57.902'),
  ('SALES-03', '66bc3fd4-78f2-4a73-8514-b605f078e845', '2025-04-09', 'hair fall control shampoo', '1', '5310', '18', '5310.00', '477.90', '477.90', '6265.80', '0', '1912', '12532', 'cash', '2025-04-09 12:34:57.902');
`;

async function runSQL() {
  console.log('Starting SQL execution...');
  
  try {
    // Execute the SQL
    const { error } = await supabase.rpc('execute_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try another approach if the first one fails
      console.log('Trying alternative approach...');
      
      // Drop table
      const { error: dropError } = await supabase
        .from('sales_products')
        .delete()
        .neq('serial_no', '');
        
      if (dropError) {
        console.error('Error dropping data:', dropError);
      } else {
        console.log('Existing data dropped successfully');
      }
      
      // Insert data directly
      const { error: insertError } = await supabase
        .from('sales_products')
        .insert([
          {
            "serial_no": 'SALES-01',
            "order_id": '9825edc8-0943-4f49-a0e2-2b0534d9d105',
            "date": '2025-04-09',
            "product_name": 'facemask',
            "quantity": '1',
            "unit_price_ex_gst": '590',
            "gst_percentage": '18',
            "taxable_value": '590.00',
            "cgst_amount": '53.10',
            "sgst_amount": '53.10',
            "total_purchase_cost": '696.20',
            "discount": '0',
            "tax": '160',
            "payment_amount": '1050',
            "payment_method": 'cash',
            "payment_date": '2025-04-09 12:34:23.581'
          },
          {
            "serial_no": 'SALES-02',
            "order_id": '66bc3fd4-78f2-4a73-8514-b605f078e845',
            "date": '2025-04-09',
            "product_name": 'hair fall control shampoo',
            "quantity": '1',
            "unit_price_ex_gst": '5310',
            "gst_percentage": '18',
            "taxable_value": '5310.00',
            "cgst_amount": '477.90',
            "sgst_amount": '477.90',
            "total_purchase_cost": '6265.80',
            "discount": '0',
            "tax": '1912',
            "payment_amount": '12532',
            "payment_method": 'cash',
            "payment_date": '2025-04-09 12:34:57.902'
          },
          {
            "serial_no": 'SALES-03',
            "order_id": '66bc3fd4-78f2-4a73-8514-b605f078e845',
            "date": '2025-04-09',
            "product_name": 'hair fall control shampoo',
            "quantity": '1',
            "unit_price_ex_gst": '5310',
            "gst_percentage": '18',
            "taxable_value": '5310.00',
            "cgst_amount": '477.90',
            "sgst_amount": '477.90',
            "total_purchase_cost": '6265.80',
            "discount": '0',
            "tax": '1912',
            "payment_amount": '12532',
            "payment_method": 'cash',
            "payment_date": '2025-04-09 12:34:57.902'
          }
        ]);
        
      if (insertError) {
        console.error('Error inserting data:', insertError);
      } else {
        console.log('Data inserted successfully via direct insert');
      }
    } else {
      console.log('SQL executed successfully!');
    }
    
    // Verify the data
    const { data, error: verifyError } = await supabase
      .from('sales_products')
      .select('*');
      
    if (verifyError) {
      console.error('Error verifying data:', verifyError);
    } else {
      console.log(`Verification: Found ${data.length} rows`);
      console.log('First row:', data[0]);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
runSQL()
  .then(() => console.log('Script execution complete'))
  .catch(err => console.error('Script failed:', err)); 