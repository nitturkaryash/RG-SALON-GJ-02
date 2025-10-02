import { createClient } from '@supabase/supabase-js';

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

console.log('=== Supabase Connection Test ===');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n=== Testing Supabase Connection ===');
    
    // Test basic connection
    const { data, error } = await supabase.from('admin_users').select('count');
    
    if (error) {
      console.error('Connection test failed:', error.message);
    } else {
      console.log('✅ Connection successful!');
    }

    // Get list of tables (this might require different permissions)
    console.log('\n=== Attempting to list tables ===');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_tables')
      .select('*');
    
    if (tablesError) {
      console.log('Cannot list tables directly, trying alternative approach...');
      
      // Try to query known tables including test table
      const knownTables = [
        'test',
        'tests',
        'test_table',
        'admin_users',
        'clients',
        'services',
        'appointments',
        'stylists',
        'products',
        'inventory',
        'orders'
      ];
      
      console.log('\n=== Checking known tables ===');
      for (const table of knownTables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            console.log(`✅ Table '${table}': ${count || 0} records`);
          } else {
            console.log(`❌ Table '${table}': ${error.message}`);
          }
        } catch (err) {
          console.log(`❌ Table '${table}': ${err.message}`);
        }
      }
    } else {
      console.log('Available tables:', tables);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testConnection();