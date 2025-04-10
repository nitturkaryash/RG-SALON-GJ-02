import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://cpkxkoosykyahuezxela.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa3hrb29zeWt5YWh1ZXp4ZWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzQ0NzcsImV4cCI6MjA1NTcxMDQ3N30.R0MaAaqVFMLObwnMVz-eghsKb_HYDWhCOAeFrQcw8e0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to execute SQL
const executeSQL = async (sql) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.error('SQL execution error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (e) {
    console.error('Exception executing SQL:', e);
    return { success: false, error: e };
  }
};

const createTables = async () => {
  console.log('Setting up Supabase database tables...');

  try {
    // Try creating services table first
    console.log('Creating services table...');
    const servicesResult = await supabase
      .from('services')
      .insert([{ 
        name: 'Test Service', 
        description: 'Test service description', 
        duration: 30, 
        price: 100 
      }])
      .select();

    if (servicesResult.error && servicesResult.error.code === '42P01') {
      console.log('Services table does not exist, trying to create it...');
      
      // Fallback: Try using custom function if available
      const createServicesResult = await executeSQL(`
        CREATE TABLE IF NOT EXISTS services (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          description TEXT,
          duration INTEGER NOT NULL,
          price NUMERIC NOT NULL,
          category TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      
      if (!createServicesResult.success) {
        console.log('Could not create services table using RPC. This may require using the Supabase SQL editor.');
      } else {
        console.log('Services table created successfully via RPC.');
      }
    } else if (servicesResult.error) {
      console.error('Error testing services table:', servicesResult.error);
    } else {
      console.log('Services table already exists.');
      // Delete the test service
      await supabase.from('services').delete().eq('name', 'Test Service');
    }

    // Try creating pos_orders table
    console.log('Creating pos_orders table...');
    const ordersResult = await supabase
      .from('pos_orders')
      .insert([{ 
        client_name: 'Test Client',
        total: 100,
        type: 'test'
      }])
      .select();
      
    if (ordersResult.error && ordersResult.error.code === '42P01') {
      console.log('pos_orders table does not exist, trying to create it...');
      
      const createOrdersResult = await executeSQL(`
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
      `);
      
      if (!createOrdersResult.success) {
        console.log('Could not create pos_orders table using RPC. This may require using the Supabase SQL editor.');
      } else {
        console.log('pos_orders table created successfully via RPC.');
      }
    } else if (ordersResult.error) {
      console.error('Error testing pos_orders table:', ordersResult.error);
    } else {
      console.log('pos_orders table already exists.');
      // Delete the test order
      await supabase.from('pos_orders').delete().eq('type', 'test');
    }

    // Try creating clients table
    console.log('Creating clients table...');
    const clientsResult = await supabase
      .from('clients')
      .insert([{ 
        full_name: 'Test Client',
        phone: '1234567890'
      }])
      .select();
      
    if (clientsResult.error && clientsResult.error.code === '42P01') {
      console.log('clients table does not exist, trying to create it...');
      
      const createClientsResult = await executeSQL(`
        CREATE TABLE IF NOT EXISTS clients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          full_name TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          notes TEXT,
          total_spent NUMERIC DEFAULT 0,
          pending_payment NUMERIC DEFAULT 0,
          last_visit TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      
      if (!createClientsResult.success) {
        console.log('Could not create clients table using RPC. This may require using the Supabase SQL editor.');
      } else {
        console.log('clients table created successfully via RPC.');
      }
    } else if (clientsResult.error) {
      console.error('Error testing clients table:', clientsResult.error);
    } else {
      console.log('clients table already exists.');
      // Delete the test client
      await supabase.from('clients').delete().eq('full_name', 'Test Client');
    }

    // Try accessing inventory_balance_stock
    console.log('Checking inventory_balance_stock...');
    const balanceResult = await supabase
      .from('inventory_balance_stock')
      .select('*')
      .limit(1);
      
    if (balanceResult.error && balanceResult.error.code === '42P01') {
      console.log('inventory_balance_stock does not exist, trying to create it...');
      
      const createBalanceResult = await executeSQL(`
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
      
      if (!createBalanceResult.success) {
        console.log('Could not create inventory_balance_stock view using RPC. This may require using the Supabase SQL editor.');
      } else {
        console.log('inventory_balance_stock view created successfully via RPC.');
      }
    } else if (balanceResult.error) {
      console.error('Error testing inventory_balance_stock view:', balanceResult.error);
    } else {
      console.log('inventory_balance_stock already exists.');
    }

    console.log('Database check completed. Use the Supabase SQL editor if you need to manually create any missing tables.');

  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

// Run the setup
createTables()
  .then(() => {
    console.log('Setup completed, exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  }); 