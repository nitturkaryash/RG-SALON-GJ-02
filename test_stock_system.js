/**
 * Comprehensive Stock System Testing
 * This file tests the entire stock management flow
 */

import { supabase } from './src/utils/supabase/supabaseClient.js';
import { addPurchaseTransaction } from './src/utils/inventoryUtils.js';

// Test product for all scenarios
const TEST_PRODUCT = 'test_stock_fix';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'blue');
  console.log('='.repeat(80) + '\n');
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const statusColor = passed ? 'green' : 'red';
  log(`${status} | ${testName}`, statusColor);
  if (details) {
    log(`   └─ ${details}`, 'yellow');
  }
}

// Test 1: Clean slate - Remove existing test product
async function test1_cleanSlate() {
  logSection('TEST 1: Clean Slate - Remove Existing Test Product');
  
  try {
    // Get product ID if exists
    const { data: existingProduct } = await supabase
      .from('product_master')
      .select('id')
      .eq('name', TEST_PRODUCT)
      .single();

    if (existingProduct) {
      // Delete purchase history
      await supabase
        .from('purchase_history_with_stock')
        .delete()
        .eq('product_name', TEST_PRODUCT);
      
      // Delete stock transactions
      await supabase
        .from('product_stock_transactions')
        .delete()
        .eq('product_id', existingProduct.id);
      
      // Delete product
      await supabase
        .from('product_master')
        .delete()
        .eq('id', existingProduct.id);
      
      logTest('Clean slate', true, 'Removed existing test product and all related data');
    } else {
      logTest('Clean slate', true, 'No existing test product found');
    }
    
    return { success: true };
  } catch (error) {
    logTest('Clean slate', false, error.message);
    return { success: false, error };
  }
}

// Test 2: Create fresh test product
async function test2_createProduct() {
  logSection('TEST 2: Create Fresh Test Product');
  
  try {
    const { data, error } = await supabase
      .from('product_master')
      .insert({
        name: TEST_PRODUCT,
        category: 'Test',
        stock_quantity: 0,
        price: 100,
        hsn_code: 'TEST001',
        units: 'pcs',
        product_type: 'Product'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    logTest('Create product', true, `Product created with ID: ${data.id}, stock: ${data.stock_quantity}`);
    return { success: true, productId: data.id };
  } catch (error) {
    logTest('Create product', false, error.message);
    return { success: false, error };
  }
}

// Test 3: First purchase - Add 10 units
async function test3_firstPurchase() {
  logSection('TEST 3: First Purchase - Add 10 Units');
  
  try {
    const purchaseData = {
      product_name: TEST_PRODUCT,
      purchase_qty: 10,
      mrp_excl_gst: 100,
      gst_percentage: 18,
      vendor: 'Test Vendor',
      date: new Date().toISOString()
    };
    
    await addPurchaseTransaction(purchaseData);
    
    // Verify product_master
    const { data: productData } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('name', TEST_PRODUCT)
      .single();
    
    // Verify purchase_history
    const { data: purchaseHistory } = await supabase
      .from('purchase_history_with_stock')
      .select('purchase_qty, current_stock_at_purchase')
      .eq('product_name', TEST_PRODUCT)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const productStock = productData?.stock_quantity || 0;
    const purchaseStock = purchaseHistory?.current_stock_at_purchase || 0;
    const expectedStock = 10;
    
    const productMatch = productStock === expectedStock;
    const purchaseMatch = purchaseStock === expectedStock;
    const bothMatch = productStock === purchaseStock;
    
    log(`Product Master Stock: ${productStock}`, productMatch ? 'green' : 'red');
    log(`Purchase History Stock: ${purchaseStock}`, purchaseMatch ? 'green' : 'red');
    
    const passed = productMatch && purchaseMatch && bothMatch;
    logTest(
      'First purchase (10 units)',
      passed,
      passed 
        ? 'Both show correct stock: 10' 
        : `MISMATCH - Product: ${productStock}, Purchase: ${purchaseStock}, Expected: ${expectedStock}`
    );
    
    return { 
      success: passed, 
      productStock, 
      purchaseStock, 
      expectedStock,
      match: bothMatch 
    };
  } catch (error) {
    logTest('First purchase', false, error.message);
    return { success: false, error };
  }
}

// Test 4: Add manual reduction (simulate sale/consumption)
async function test4_manualReduction() {
  logSection('TEST 4: Manual Stock Reduction - Remove 3 Units');
  
  try {
    const { data: productData } = await supabase
      .from('product_master')
      .select('id, stock_quantity')
      .eq('name', TEST_PRODUCT)
      .single();
    
    const previousStock = productData.stock_quantity;
    const reduction = 3;
    const newStock = previousStock - reduction;
    
    // Create stock transaction for reduction
    await supabase
      .from('product_stock_transactions')
      .insert({
        product_id: productData.id,
        transaction_type: 'reduction',
        quantity: reduction,
        previous_stock: previousStock,
        new_stock: newStock
      });
    
    // Update product master
    await supabase
      .from('product_master')
      .update({ stock_quantity: newStock })
      .eq('id', productData.id);
    
    // Verify
    const { data: verifyData } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('name', TEST_PRODUCT)
      .single();
    
    const passed = verifyData.stock_quantity === newStock;
    logTest(
      'Manual reduction',
      passed,
      `Stock reduced from ${previousStock} to ${verifyData.stock_quantity} (expected ${newStock})`
    );
    
    return { success: passed, previousStock, newStock: verifyData.stock_quantity };
  } catch (error) {
    logTest('Manual reduction', false, error.message);
    return { success: false, error };
  }
}

// Test 5: Second purchase after reduction - Add 5 units
async function test5_secondPurchaseAfterReduction() {
  logSection('TEST 5: Second Purchase After Reduction - Add 5 Units');
  
  try {
    // Get current stock BEFORE purchase
    const { data: beforeData } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('name', TEST_PRODUCT)
      .single();
    
    const stockBeforePurchase = beforeData.stock_quantity;
    const purchaseQty = 5;
    const expectedAfter = stockBeforePurchase + purchaseQty;
    
    log(`Stock BEFORE purchase: ${stockBeforePurchase}`, 'blue');
    log(`Adding: ${purchaseQty} units`, 'blue');
    log(`Expected AFTER: ${expectedAfter}`, 'blue');
    
    // Make purchase
    const purchaseData = {
      product_name: TEST_PRODUCT,
      purchase_qty: purchaseQty,
      mrp_excl_gst: 100,
      gst_percentage: 18,
      vendor: 'Test Vendor',
      date: new Date().toISOString()
    };
    
    await addPurchaseTransaction(purchaseData);
    
    // Small delay to ensure all updates complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify product_master
    const { data: afterProduct } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('name', TEST_PRODUCT)
      .single();
    
    // Verify purchase_history
    const { data: afterPurchase } = await supabase
      .from('purchase_history_with_stock')
      .select('purchase_qty, current_stock_at_purchase')
      .eq('product_name', TEST_PRODUCT)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const productStock = afterProduct?.stock_quantity || 0;
    const purchaseStock = afterPurchase?.current_stock_at_purchase || 0;
    
    log(`Product Master Stock AFTER: ${productStock}`, productStock === expectedAfter ? 'green' : 'red');
    log(`Purchase History Stock: ${purchaseStock}`, purchaseStock === expectedAfter ? 'green' : 'red');
    
    const productCorrect = productStock === expectedAfter;
    const purchaseCorrect = purchaseStock === expectedAfter;
    const bothMatch = productStock === purchaseStock;
    
    const passed = productCorrect && purchaseCorrect && bothMatch;
    
    logTest(
      'Second purchase after reduction (5 units)',
      passed,
      passed
        ? `Both show correct stock: ${expectedAfter}`
        : `CRITICAL MISMATCH - Before: ${stockBeforePurchase}, Product: ${productStock}, Purchase: ${purchaseStock}, Expected: ${expectedAfter}`
    );
    
    return { 
      success: passed, 
      stockBeforePurchase,
      productStock, 
      purchaseStock, 
      expectedAfter,
      match: bothMatch 
    };
  } catch (error) {
    logTest('Second purchase after reduction', false, error.message);
    return { success: false, error };
  }
}

// Test 6: Verify stock transaction log consistency
async function test6_verifyStockTransactionLog() {
  logSection('TEST 6: Verify Stock Transaction Log Consistency');
  
  try {
    const { data: productData } = await supabase
      .from('product_master')
      .select('id, stock_quantity')
      .eq('name', TEST_PRODUCT)
      .single();
    
    // Get all stock transactions
    const { data: transactions } = await supabase
      .from('product_stock_transactions')
      .select('*')
      .eq('product_id', productData.id)
      .order('created_at', { ascending: true });
    
    // Calculate expected stock from transactions
    let calculatedStock = 0;
    transactions.forEach(tx => {
      if (tx.transaction_type === 'addition') {
        calculatedStock += tx.quantity;
      } else if (tx.transaction_type === 'reduction') {
        calculatedStock -= tx.quantity;
      }
    });
    
    const actualStock = productData.stock_quantity;
    const passed = calculatedStock === actualStock;
    
    log(`Stock from transactions: ${calculatedStock}`, passed ? 'green' : 'red');
    log(`Product master stock: ${actualStock}`, passed ? 'green' : 'red');
    
    logTest(
      'Stock transaction log consistency',
      passed,
      passed
        ? `Transaction log matches product master: ${actualStock}`
        : `MISMATCH - Calculated: ${calculatedStock}, Actual: ${actualStock}`
    );
    
    if (!passed) {
      log('\nTransaction Log:', 'yellow');
      transactions.forEach(tx => {
        log(`  ${tx.transaction_type}: ${tx.quantity} (prev: ${tx.previous_stock} → new: ${tx.new_stock})`, 'yellow');
      });
    }
    
    return { success: passed, calculatedStock, actualStock };
  } catch (error) {
    logTest('Stock transaction log', false, error.message);
    return { success: false, error };
  }
}

// Test 7: Check for race conditions with concurrent purchases
async function test7_concurrentPurchases() {
  logSection('TEST 7: Race Condition Test - Concurrent Purchases');
  
  try {
    const { data: beforeData } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('name', TEST_PRODUCT)
      .single();
    
    const stockBefore = beforeData.stock_quantity;
    
    log(`Stock before concurrent purchases: ${stockBefore}`, 'blue');
    log('Attempting 3 concurrent purchases of 2 units each...', 'blue');
    
    // Create 3 concurrent purchase requests
    const purchases = [
      addPurchaseTransaction({
        product_name: TEST_PRODUCT,
        purchase_qty: 2,
        mrp_excl_gst: 100,
        gst_percentage: 18,
        vendor: 'Vendor A',
        date: new Date().toISOString()
      }),
      addPurchaseTransaction({
        product_name: TEST_PRODUCT,
        purchase_qty: 2,
        mrp_excl_gst: 100,
        gst_percentage: 18,
        vendor: 'Vendor B',
        date: new Date().toISOString()
      }),
      addPurchaseTransaction({
        product_name: TEST_PRODUCT,
        purchase_qty: 2,
        mrp_excl_gst: 100,
        gst_percentage: 18,
        vendor: 'Vendor C',
        date: new Date().toISOString()
      })
    ];
    
    await Promise.all(purchases);
    
    // Wait for all to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: afterData } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('name', TEST_PRODUCT)
      .single();
    
    const stockAfter = afterData.stock_quantity;
    const expectedAfter = stockBefore + 6; // 3 purchases × 2 units
    
    const passed = stockAfter === expectedAfter;
    
    log(`Stock after concurrent purchases: ${stockAfter}`, passed ? 'green' : 'red');
    log(`Expected: ${expectedAfter}`, passed ? 'green' : 'red');
    
    logTest(
      'Concurrent purchases',
      passed,
      passed
        ? `Stock correctly updated: ${stockBefore} + 6 = ${stockAfter}`
        : `RACE CONDITION - Before: ${stockBefore}, After: ${stockAfter}, Expected: ${expectedAfter}`
    );
    
    return { success: passed, stockBefore, stockAfter, expectedAfter };
  } catch (error) {
    logTest('Concurrent purchases', false, error.message);
    return { success: false, error };
  }
}

// Main test runner
async function runAllTests() {
  logSection('🧪 STOCK SYSTEM COMPREHENSIVE TEST SUITE');
  log('Testing stock calculation consistency and race condition handling\n', 'magenta');
  
  const results = {
    total: 7,
    passed: 0,
    failed: 0,
    details: []
  };
  
  // Run all tests in sequence
  const test1 = await test1_cleanSlate();
  results.details.push({ name: 'Clean Slate', ...test1 });
  
  const test2 = await test2_createProduct();
  results.details.push({ name: 'Create Product', ...test2 });
  
  const test3 = await test3_firstPurchase();
  results.details.push({ name: 'First Purchase', ...test3 });
  
  const test4 = await test4_manualReduction();
  results.details.push({ name: 'Manual Reduction', ...test4 });
  
  const test5 = await test5_secondPurchaseAfterReduction();
  results.details.push({ name: 'Second Purchase After Reduction', ...test5 });
  
  const test6 = await test6_verifyStockTransactionLog();
  results.details.push({ name: 'Stock Transaction Log', ...test6 });
  
  const test7 = await test7_concurrentPurchases();
  results.details.push({ name: 'Concurrent Purchases', ...test7 });
  
  // Calculate results
  results.passed = results.details.filter(d => d.success).length;
  results.failed = results.total - results.passed;
  
  // Summary
  logSection('📊 TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed > 0) {
    log('\n❌ FAILED TESTS:', 'red');
    results.details.filter(d => !d.success).forEach(test => {
      log(`  - ${test.name}`, 'red');
      if (test.error) {
        log(`    Error: ${test.error.message}`, 'yellow');
      }
    });
  } else {
    log('\n✅ ALL TESTS PASSED!', 'green');
  }
  
  return results;
}

// Export for use
export { runAllTests };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}


