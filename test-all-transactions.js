import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Transactions...\n');
console.log('URL:', supabaseUrl);
console.log('═══════════════════════════════════════════════════\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (message) console.log(`   ${message}`);
  
  testResults.tests.push({ name, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function testReadOperations() {
  console.log('\n📖 Testing READ Operations:');
  console.log('─────────────────────────────────────────────────');
  
  // Test 1: Read Clients
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Read Clients', true, `Found ${data?.length || 0} records`);
  } catch (err) {
    logTest('Read Clients', false, err.message);
  }
  
  // Test 2: Read Appointments
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Read Appointments', true, `Found ${data?.length || 0} records`);
  } catch (err) {
    logTest('Read Appointments', false, err.message);
  }
  
  // Test 3: Read Services
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Read Services', true, `Found ${data?.length || 0} records`);
  } catch (err) {
    logTest('Read Services', false, err.message);
  }
  
  // Test 4: Read Products
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Read Products', true, `Found ${data?.length || 0} records`);
  } catch (err) {
    logTest('Read Products', false, err.message);
  }
  
  // Test 5: Read Product Master
  try {
    const { data, error } = await supabase
      .from('product_master')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Read Product Master', true, `Found ${data?.length || 0} records`);
  } catch (err) {
    logTest('Read Product Master', false, err.message);
  }
  
  // Test 6: Read POS Orders
  try {
    const { data, error } = await supabase
      .from('pos_orders')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Read POS Orders', true, `Found ${data?.length || 0} records`);
  } catch (err) {
    logTest('Read POS Orders', false, err.message);
  }
  
  // Test 7: Read Stylists
  try {
    const { data, error } = await supabase
      .from('stylists')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Read Stylists', true, `Found ${data?.length || 0} records`);
  } catch (err) {
    logTest('Read Stylists', false, err.message);
  }
}

async function testWriteOperations() {
  console.log('\n✍️  Testing WRITE Operations:');
  console.log('─────────────────────────────────────────────────');
  
  const testClientName = `TEST_CLIENT_${Date.now()}`;
  let testClientId = null;
  
  // Test 8: Insert Client
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: testClientName,
        phone: '9999999999',
        email: 'test@example.com'
      })
      .select()
      .single();
    
    if (error) throw error;
    testClientId = data.id;
    logTest('Insert Client', true, `Created client: ${testClientName}`);
  } catch (err) {
    logTest('Insert Client', false, err.message);
  }
  
  // Test 9: Update Client
  if (testClientId) {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ phone: '8888888888' })
        .eq('id', testClientId);
      
      if (error) throw error;
      logTest('Update Client', true, `Updated phone number`);
    } catch (err) {
      logTest('Update Client', false, err.message);
    }
  } else {
    logTest('Update Client', false, 'No test client ID available');
  }
  
  // Test 10: Read Updated Client
  if (testClientId) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', testClientId)
        .single();
      
      if (error) throw error;
      const phoneCorrect = data.phone === '8888888888';
      logTest('Read Updated Client', phoneCorrect, 
        phoneCorrect ? 'Update verified' : 'Update not reflected');
    } catch (err) {
      logTest('Read Updated Client', false, err.message);
    }
  }
  
  // Test 11: Delete Client
  if (testClientId) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', testClientId);
      
      if (error) throw error;
      logTest('Delete Client', true, `Deleted test client`);
    } catch (err) {
      logTest('Delete Client', false, err.message);
    }
  } else {
    logTest('Delete Client', false, 'No test client ID available');
  }
}

async function testComplexQueries() {
  console.log('\n🔍 Testing COMPLEX Queries:');
  console.log('─────────────────────────────────────────────────');
  
  // Test 12: Join Query (if applicable)
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, clients(*), stylists(*)')
      .limit(3);
    
    if (error) throw error;
    logTest('Join Query (Appointments)', true, 
      `Fetched ${data?.length || 0} appointments with relations`);
  } catch (err) {
    logTest('Join Query (Appointments)', false, err.message);
  }
  
  // Test 13: Filtering
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('date', today)
      .limit(5);
    
    if (error) throw error;
    logTest('Filtering (Future Appointments)', true, 
      `Found ${data?.length || 0} future appointments`);
  } catch (err) {
    logTest('Filtering (Future Appointments)', false, err.message);
  }
  
  // Test 14: Ordering
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    logTest('Ordering (Recent Clients)', true, 
      `Found ${data?.length || 0} clients ordered by date`);
  } catch (err) {
    logTest('Ordering (Recent Clients)', false, err.message);
  }
  
  // Test 15: Count
  try {
    const { count, error } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    logTest('Count Query (Total Clients)', true, 
      `Total clients: ${count}`);
  } catch (err) {
    logTest('Count Query (Total Clients)', false, err.message);
  }
}

async function testInventoryOperations() {
  console.log('\n📦 Testing INVENTORY Operations:');
  console.log('─────────────────────────────────────────────────');
  
  // Test 16: Read Product Master with Stock
  try {
    const { data, error } = await supabase
      .from('product_master')
      .select('id, name, current_stock_quantity, price')
      .gt('current_stock_quantity', 0)
      .limit(5);
    
    if (error) throw error;
    logTest('Products with Stock', true, 
      `Found ${data?.length || 0} products in stock`);
  } catch (err) {
    logTest('Products with Stock', false, err.message);
  }
  
  // Test 17: Read Inventory Consumption
  try {
    const { data, error } = await supabase
      .from('inventory_consumption')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Inventory Consumption', true, 
      `Found ${data?.length || 0} consumption records`);
  } catch (err) {
    logTest('Inventory Consumption', false, err.message);
  }
  
  // Test 18: Read Balance Stock
  try {
    const { data, error } = await supabase
      .from('balance_stock')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    logTest('Balance Stock', true, 
      `Found ${data?.length || 0} balance records`);
  } catch (err) {
    logTest('Balance Stock', false, err.message);
  }
}

async function runAllTests() {
  try {
    await testReadOperations();
    await testWriteOperations();
    await testComplexQueries();
    await testInventoryOperations();
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📝 Total:  ${testResults.tests.length}`);
    
    const successRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (testResults.failed === 0) {
      console.log('\n🎉 All transactions are working perfectly!');
    } else {
      console.log('\n⚠️  Some transactions failed. Check the details above.');
    }
    
  } catch (err) {
    console.error('❌ Fatal error running tests:', err);
  }
}

runAllTests();

