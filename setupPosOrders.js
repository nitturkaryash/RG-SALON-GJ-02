import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://cpkxkoosykyahuezxela.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa3hrb29zeWt5YWh1ZXp4ZWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzQ0NzcsImV4cCI6MjA1NTcxMDQ3N30.R0MaAaqVFMLObwnMVz-eghsKb_HYDWhCOAeFrQcw8e0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const setupPosOrders = async () => {
  console.log('Checking pos_orders table...');

  try {
    // First check if the table exists
    console.log('Testing if pos_orders exists...');
    const { data, error } = await supabase
      .from('pos_orders')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Error checking pos_orders:', error);
      
      if (error.code === '42P01') {
        console.log('pos_orders table does not exist. Creating it...');
        
        try {
          // Try direct insertion method (will fail if table doesn't exist)
          console.log('Attempting to create pos_orders table via Supabase dashboard SQL editor.');
          console.log('Please run the following SQL in your Supabase SQL editor:');
          console.log(`
CREATE TABLE IF NOT EXISTS pos_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_name TEXT,
  consumption_purpose TEXT,
  consumption_notes TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  type TEXT DEFAULT 'sale',
  is_salon_consumption BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  payment_method TEXT DEFAULT 'cash'
);

CREATE TABLE IF NOT EXISTS pos_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID,
  service_name TEXT NOT NULL,
  service_type TEXT DEFAULT 'service',
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  gst_percentage NUMERIC DEFAULT 18,
  hsn_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pos_order_id UUID REFERENCES pos_orders(id)
);

CREATE OR REPLACE VIEW inventory_balance_stock AS
SELECT
  product_name,
  balance_qty,
  mrp_incl_gst
FROM (
  SELECT
    'Sample Product' as product_name,
    100 as balance_qty,
    500 as mrp_incl_gst
) as sample_data;
          `);
        } catch (e) {
          console.error('Error creating pos_orders table:', e);
        }
      }
    } else {
      console.log('pos_orders table exists!');
      console.log('Sample data:', data);
      
      // Now check for pos_order_items
      console.log('Checking pos_order_items table...');
      const { data: itemsData, error: itemsError } = await supabase
        .from('pos_order_items')
        .select('*')
        .limit(1);
        
      if (itemsError) {
        console.log('Error checking pos_order_items:', itemsError);
        
        if (itemsError.code === '42P01') {
          console.log('pos_order_items table does not exist. Please create it using the SQL above.');
        }
      } else {
        console.log('pos_order_items table exists!');
        console.log('Sample data:', itemsData);
      }
    }
  } catch (e) {
    console.error('Exception:', e);
  }
};

// Run the setup
setupPosOrders()
  .then(() => {
    console.log('\nCheck completed. If needed, run the SQL statements above in the Supabase SQL editor.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup check failed:', error);
    process.exit(1);
  }); 