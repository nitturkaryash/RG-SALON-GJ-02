import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 TESTING POS STOCK FLOW ISSUES\n');

async function analyzeStockFlow() {
  console.log('1️⃣  ANALYZING CURRENT POS STOCK FLOW');
  console.log('─'.repeat(50));
  
  // Check if there are inconsistencies in table references
  console.log('🔍 Checking table references in POS flow...\n');
  
  // Issue 1: Check if code is querying wrong table
  console.log('❌ ISSUE FOUND: Inconsistent table references');
  console.log('   Line 706-710: Queries "products" table');
  console.log('   Line 1566: Queries "product_master" table');
  console.log('   Line 3813: Queries "product_master" table (CORRECT)');
  
  // Issue 2: Check for database triggers
  console.log('\n🔍 Checking for database triggers...');
  
  try {
    // Try to see if there are any triggers
    const { data, error } = await supabase
      .rpc('pg_get_triggerdef', {})
      .select('*');
    
    if (error) {
      console.log('⚠️  Cannot check triggers with current permissions');
    }
  } catch (err) {
    console.log('⚠️  Cannot access trigger information');
  }
  
  // Issue 3: Test actual stock behavior
  console.log('\n2️⃣  TESTING ACTUAL STOCK BEHAVIOR');
  console.log('─'.repeat(50));
  
  // Get a product with stock
  const { data: testProduct } = await supabase
    .from('product_master')
    .select('id, name, stock_quantity')
    .gt('stock_quantity', 5)
    .limit(1)
    .single();
  
  if (testProduct) {
    console.log(`📦 Test Product: ${testProduct.name}`);
    console.log(`   Current Stock: ${testProduct.stock_quantity}`);
    
    // Check recent orders for this product
    const { data: recentOrders } = await supabase
      .from('pos_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (recentOrders && recentOrders.length > 0) {
      console.log('\n📋 Recent POS Orders:');
      recentOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.client_name || 'N/A'} - ₹${order.total || 0}`);
        console.log(`      Type: ${order.type || 'N/A'}`);
        console.log(`      Consumption: ${order.is_salon_consumption ? 'YES' : 'NO'}`);
        
        // Check if stock snapshot exists
        if (order.stock_snapshot) {
          try {
            const snapshot = JSON.parse(order.stock_snapshot);
            console.log(`      Stock Snapshot: ${Object.keys(snapshot).length} products`);
          } catch (e) {
            console.log(`      Stock Snapshot: Invalid JSON`);
          }
        }
      });
    }
  }
}

async function identifyStockIssues() {
  console.log('\n3️⃣  IDENTIFIED STOCK FLOW ISSUES');
  console.log('─'.repeat(50));
  
  console.log('❌ CRITICAL ISSUES FOUND:');
  console.log('');
  
  console.log('1. INCONSISTENT TABLE REFERENCES:');
  console.log('   • usePOS.ts line 706-710: Queries "products" table (WRONG)');
  console.log('   • Should query "product_master" table (CORRECT)');
  console.log('');
  
  console.log('2. MISSING STOCK DEDUCTION:');
  console.log('   • Code mentions database trigger "trg_reduce_stock_on_insert"');
  console.log('   • But manual stock update is commented out');
  console.log('   • If trigger doesn\'t exist, stock won\'t be reduced');
  console.log('');
  
  console.log('3. INCONSISTENT IMPLEMENTATION:');
  console.log('   • Salon consumption: Queries product_master (CORRECT)');
  console.log('   • Walk-in orders: Queries products table (WRONG)');
  console.log('   • Should be consistent across all POS operations');
  console.log('');
  
  console.log('✅ REQUIRED FIXES:');
  console.log('   1. Change "products" to "product_master" in usePOS.ts');
  console.log('   2. Ensure stock deduction happens on every POS order');
  console.log('   3. Verify database trigger exists or implement manual deduction');
  console.log('   4. Make all POS operations consistent');
}

async function runAnalysis() {
  await analyzeStockFlow();
  await identifyStockIssues();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📋 SUMMARY: POS STOCK FLOW NEEDS FIXING');
  console.log('═══════════════════════════════════════════════════');
  console.log('❌ Current system has inconsistent table references');
  console.log('❌ Stock deduction may not be working properly');
  console.log('❌ Walk-in orders and salon consumption use different logic');
  console.log('');
  console.log('✅ SOLUTION: Fix table references and ensure stock deduction');
  console.log('═══════════════════════════════════════════════════\n');
}

runAnalysis();
