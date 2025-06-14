/**
 * Test Supabase MCP Connection
 * This script tests the connection to Supabase with the new credentials
 */

import { createClient } from '@supabase/supabase-js';

// New Supabase credentials
const SUPABASE_URL = 'https://mtyudylsozncvilibxda.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

console.log('🔍 Testing Supabase MCP Connection');
console.log('📡 URL:', SUPABASE_URL);
console.log('🔑 Key length:', SUPABASE_ANON_KEY.length);
console.log('='.repeat(50));

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // For server-side usage
  }
});

/**
 * Test database connection
 */
async function testConnection() {
  try {
    console.log('🚀 Testing basic connection...');
    
    // Test 1: Basic connection test - try a simple table
    const { data, error } = await supabase
      .from('auth')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      
      // Try with a different approach - test the service status
      const { data: rpcData, error: rpcError } = await supabase.rpc('version');
      
      if (rpcError) {
        console.log('❌ RPC test also failed:', rpcError.message);
        return false;
      }
    }
    
    console.log('✅ Basic connection successful!');
    return true;
    
  } catch (err) {
    console.error('💥 Connection error:', err.message);
    return false;
  }
}

/**
 * Test table existence
 */
async function testTables() {
  console.log('\n📊 Testing table existence...');
  
  const tables = [
    'auth',
    'clients', 
    'services',
    'products',
    'inventory_purchases',
    'inventory_sales',
    'pos_orders',
    'sales_products'
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        results[table] = `❌ ${error.message}`;
      } else {
        results[table] = '✅ Exists';
      }
    } catch (err) {
      results[table] = `💥 ${err.message}`;
    }
  }
  
  console.log('\n📋 Table Status:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`  ${table}: ${status}`);
  });
  
  return results;
}

/**
 * Test auth table specifically
 */
async function testAuthTable() {
  console.log('\n🔐 Testing auth table...');
  
  try {
    const { data, error } = await supabase
      .from('auth')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Auth table error:', error.message);
      return false;
    }
    
    console.log('✅ Auth table accessible');
    console.log('📝 Records found:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('👤 Sample user:', data[0].username);
    }
    
    return true;
    
  } catch (err) {
    console.error('💥 Auth table error:', err.message);
    return false;
  }
}

/**
 * Test data insertion
 */
async function testDataInsertion() {
  console.log('\n📝 Testing data insertion...');
  
  try {
    // Test inserting a client
    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          full_name: 'Test Client MCP',
          phone: '+91-9999999999',
          email: 'test@mcp.com'
        }
      ])
      .select();
    
    if (error) {
      console.log('❌ Insert error:', error.message);
      return false;
    }
    
    console.log('✅ Data insertion successful');
    console.log('📄 Inserted record ID:', data[0]?.id);
    
    // Clean up - delete the test record
    await supabase
      .from('clients')
      .delete()
      .eq('email', 'test@mcp.com');
    
    console.log('🧹 Test record cleaned up');
    return true;
    
  } catch (err) {
    console.error('💥 Insert error:', err.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🔥 Starting Supabase MCP Tests\n');
  
  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Table Existence Test', fn: testTables },
    { name: 'Auth Table Test', fn: testAuthTable },
    { name: 'Data Insertion Test', fn: testDataInsertion }
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      console.log(`\n⚡ Running ${test.name}...`);
      const result = await test.fn();
      results[test.name] = result;
    } catch (err) {
      console.error(`💥 ${test.name} failed:`, err.message);
      results[test.name] = false;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${test}: ${status}`);
  });
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Supabase MCP is ready to use.');
    console.log('🚀 You can now use the database in your application.');
    console.log('🔑 Login credentials: username="admin", password="admin"');
  } else {
    console.log('\n⚠️  Some tests failed. You need to run the database setup first.');
    console.log('📋 Steps to fix:');
    console.log('   1. Go to https://mtyudylsozncvilibxda.supabase.co');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the complete_database_setup.sql content');
    console.log('   4. Click Run to execute the script');
    console.log('   5. Re-run this test');
  }
  
  return allPassed;
}

// Run the tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Test runner error:', err);
    process.exit(1);
  });

export { runTests, testConnection, testTables, testAuthTable, testDataInsertion }; 