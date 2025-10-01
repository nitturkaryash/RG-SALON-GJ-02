import { createClient } from '@supabase/supabase-js';

// Manually set environment variables (from .env.local)
const supabaseUrl = 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

console.log('=== Detailed Test Table Analysis ===');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTestTables() {
  const testTables = ['test', 'tests', 'test_table'];
  
  for (const tableName of testTables) {
    console.log(`\n🔍 === Analyzing Table: ${tableName} ===`);
    
    try {
      // Get count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`❌ Cannot access table '${tableName}': ${countError.message}`);
        continue;
      }
      
      console.log(`📊 Record count: ${count || 0}`);
      
      // Get first few records to understand structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`❌ Error fetching data: ${error.message}`);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log(`📝 Sample data (first ${data.length} records):`);
        data.forEach((record, index) => {
          console.log(`  Record ${index + 1}:`, JSON.stringify(record, null, 2));
        });
        
        // Show column structure
        console.log(`🏗️  Table structure (columns):`);
        const columns = Object.keys(data[0]);
        columns.forEach(col => {
          const sampleValue = data[0][col];
          const type = typeof sampleValue;
          console.log(`  - ${col}: ${type} (example: ${JSON.stringify(sampleValue)})`);
        });
      } else {
        console.log(`📝 Table is empty`);
        
        // Try to get table schema by inserting and immediately rolling back
        // or by checking table info (this might not work with current permissions)
        console.log(`🏗️  Attempting to determine table structure...`);
        
        try {
          // Try a select with a fake condition to get column info from error
          const { error: schemaError } = await supabase
            .from(tableName)
            .select('*')
            .eq('fake_column_that_does_not_exist', 'fake_value');
          
          if (schemaError) {
            console.log(`ℹ️  Schema detection result: ${schemaError.message}`);
          }
        } catch (schemaErr) {
          console.log(`ℹ️  Could not determine schema automatically`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error analyzing table '${tableName}': ${error.message}`);
    }
  }
}

// Also check for any tables with 'test' in the name
async function searchForTestRelatedTables() {
  console.log(`\n🔎 === Searching for other test-related tables ===`);
  
  // Try some variations
  const possibleTestTables = [
    'test_data', 'testing', 'test_records', 'test_users', 'test_items',
    'sample_test', 'test_products', 'test_services', 'test_appointments'
  ];
  
  for (const tableName of possibleTestTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`✅ Found additional table: '${tableName}' with ${count || 0} records`);
      }
    } catch (error) {
      // Silently skip non-existent tables
    }
  }
}

async function main() {
  await checkTestTables();
  await searchForTestRelatedTables();
  console.log(`\n✅ Test table analysis complete!`);
}

main().catch(console.error);