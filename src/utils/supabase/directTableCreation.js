const { createClient } = require('@supabase/supabase-js');

// Supabase configuration strictly from env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTable() {
  try {
    console.log('Attempting to create inventory_salon_consumption table...');
    
    // SQL for creating the table directly
    const sql = `
      CREATE TABLE IF NOT EXISTS inventory_salon_consumption (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        product_name TEXT NOT NULL,
        hsn_code TEXT,
        units TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        purpose TEXT DEFAULT 'Salon Use',
        stylist_name TEXT,
        notes TEXT,
        price_per_unit NUMERIC DEFAULT 0,
        gst_percentage NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_salon_consumption_date ON inventory_salon_consumption(date);
      CREATE INDEX IF NOT EXISTS idx_salon_consumption_product ON inventory_salon_consumption(product_name);
    `;
    
    // Execute raw SQL query
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sql 
    });
    
    if (error) {
      // If the RPC method fails, try an alternative approach using REST API
      console.error('Failed to create table using RPC:', error);
      console.log('Trying alternative approach...');
      
      // Make a direct REST call to create the table
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: sql
        })
      });
      
      if (!response.ok) {
        throw new Error(`REST API call failed: ${response.statusText}`);
      }
      
      console.log('Table created successfully using REST API!');
    } else {
      console.log('Table created successfully using RPC!', data);
    }
    
    // Verify the table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'inventory_salon_consumption');
    
    if (tableError) {
      console.warn('Could not verify table creation:', tableError);
    } else {
      console.log('Table verification result:', tableCheck);
      if (tableCheck && tableCheck.length > 0) {
        console.log('✅ Table exists!');
      } else {
        console.log('❌ Table not found!');
      }
    }
    
  } catch (err) {
    console.error('Unexpected error during table creation:', err);
  }
}

// Run the table creation
createTable(); 