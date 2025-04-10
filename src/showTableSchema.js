import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to show table schema
async function showTableSchema() {
  try {
    console.log('Checking services table schema...\n');
    
    // Read and clean environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL?.toString().trim();
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.toString().trim();
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials in .env file');
      return false;
    }
    
    console.log(`Supabase URL: ${supabaseUrl}`);
    
    // Create Supabase client
    console.log('\nConnecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Query to get table info
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'services' });
    
    if (tableError) {
      console.error('❌ Error getting table info:', tableError);
      
      // Fall back to using a SQL query to get column info
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'services');
      
      if (columnError) {
        console.error('❌ Error getting column info:', columnError);
        return false;
      }
      
      console.log('\nServices table columns:');
      if (columns && columns.length > 0) {
        columns.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'Nullable' : 'Not Nullable'})`);
        });
      } else {
        console.log('No columns found or table does not exist.');
      }
    } else {
      console.log('\nServices table info:');
      tableInfo.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'Nullable' : 'Not Nullable'})`);
      });
    }
    
    // Try a simple select to see what fields are actually in the table
    const { data: sampleRow, error: sampleError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error querying services table:', sampleError);
    } else {
      console.log('\nSample row from services table:');
      if (sampleRow && sampleRow.length > 0) {
        console.log(JSON.stringify(sampleRow[0], null, 2));
      } else {
        console.log('No data found in services table.');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error showing table schema:', error);
    return false;
  }
}

// Run the show schema function
showTableSchema().then(success => {
  if (success) {
    console.log('\nSchema check completed.');
  } else {
    console.log('\nSchema check failed.');
  }
}); 