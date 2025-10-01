import { createClient } from '@supabase/supabase-js';

// Manually set environment variables (from .env.local)
const supabaseUrl = 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

console.log('=== Focused Test Table Check ===');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSpecificTestTables() {
  const testTablesFound = [
    'test_data', 'testing', 'test_records', 'test_users', 'test_items',
    'sample_test', 'test_products', 'test_services', 'test_appointments'
  ];
  
  console.log('🔍 Checking tables that showed positive count results...\n');
  
  for (const tableName of testTablesFound) {
    console.log(`--- Table: ${tableName} ---`);
    
    try {
      // Try to get actual data
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(3);
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ Success! Records: ${count || 0}`);
        if (data && data.length > 0) {
          console.log(`📊 Sample data:`, JSON.stringify(data[0], null, 2));
        } else {
          console.log(`📊 Table exists but is empty`);
        }
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

// Let's also try to check what tables actually exist using a different approach
async function tryAlternativeTableList() {
  console.log('🔎 Trying alternative method to list tables...\n');
  
  try {
    // Try to query the information schema (might not work due to permissions)
    const { data, error } = await supabase
      .rpc('get_table_list'); // This would be a custom function if it exists
    
    if (error) {
      console.log('Custom table list function not available:', error.message);
    } else {
      console.log('Tables found via RPC:', data);
    }
  } catch (err) {
    console.log('RPC method failed:', err.message);
  }
  
  // Try a different approach - check for common table patterns
  console.log('Checking main application tables for comparison...');
  const mainTables = ['admin_users', 'clients', 'services'];
  
  for (const table of mainTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`✅ Main table '${table}' is accessible`);
      } else {
        console.log(`❌ Main table '${table}': ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Main table '${table}' exception: ${err.message}`);
    }
  }
}

async function main() {
  await checkSpecificTestTables();
  await tryAlternativeTableList();
}

main().catch(console.error);