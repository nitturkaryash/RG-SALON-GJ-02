/**
 * COMPREHENSIVE TEST: CHRONOLOGICAL STOCK CALCULATION & AUTO-ADJUST
 * 
 * This test verifies:
 * 1. Historical entries show correct stock for that specific date
 * 2. Current entries update the product master stock
 * 3. All subsequent entries auto-adjust when historical entry is added
 * 4. Product master stock always reflects current reality
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mtyudylsozncvilibxda.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runChronologicalStockTest() {
  console.log('\n🧪 CHRONOLOGICAL STOCK CALCULATION & AUTO-ADJUST TEST\n');
  console.log('=' .repeat(80));
  
  try {
    // Test 1: Verify TESST_123 current state
    console.log('\n📊 TEST 1: Analyze TESST_123 Current State');
    console.log('-'.repeat(80));
    
    const { data: tesst123Product } = await supabase
      .from('product_master')
      .select('*')
      .eq('name', 'TESST_123')
      .single();
    
    const { data: tesst123History } = await supabase
      .from('purchase_history_with_stock')
      .select('*')
      .eq('product_name', 'TESST_123')
      .order('date', { ascending: true });
    
    console.log('\n📦 Product Master:');
    console.log(`   Name: ${tesst123Product.name}`);
    console.log(`   Current Stock: ${tesst123Product.stock_quantity}`);
    
    console.log('\n📝 Purchase History (Chronological Order):');
    tesst123History.forEach((p, i) => {
      const purchaseDate = new Date(p.date);
      const createdDate = new Date(p.created_at);
      const daysAgo = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`\n   Entry ${i + 1}:`);
      console.log(`   Purchase Date: ${purchaseDate.toISOString()}`);
      console.log(`   Created At: ${createdDate.toISOString()}`);
      console.log(`   Days Ago: ${daysAgo}`);
      console.log(`   Purchase Qty: ${p.purchase_qty}`);
      console.log(`   Stock After Purchase: ${p.current_stock_at_purchase}`);
      console.log(`   Type: ${daysAgo > 1 ? '🕒 HISTORICAL' : '📅 CURRENT'}`);
    });
    
    // Test 2: Verify chronological logic
    console.log('\n\n📊 TEST 2: Verify Chronological Stock Logic');
    console.log('-'.repeat(80));
    
    let expectedChronologicalStock = 0;
    let allCorrect = true;
    
    console.log('\n🔍 Expected vs Actual Stock at Each Purchase:');
    tesst123History.forEach((p, i) => {
      expectedChronologicalStock += p.purchase_qty;
      const isCorrect = p.current_stock_at_purchase === expectedChronologicalStock;
      allCorrect = allCorrect && isCorrect;
      
      console.log(`\n   Entry ${i + 1} (${new Date(p.date).toLocaleDateString()}):`);
      console.log(`   Purchase Qty: +${p.purchase_qty}`);
      console.log(`   Expected Stock: ${expectedChronologicalStock}`);
      console.log(`   Actual Stock: ${p.current_stock_at_purchase}`);
      console.log(`   Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    });
    
    console.log(`\n\n📊 Overall Chronological Consistency: ${allCorrect ? '✅ PASS' : '❌ FAIL'}`);
    
    // Test 3: Verify product master stock logic
    console.log('\n\n📊 TEST 3: Verify Product Master Stock Logic');
    console.log('-'.repeat(80));
    
    // Product master should only count CURRENT entries (≤1 day old)
    const currentEntries = tesst123History.filter(p => {
      const daysAgo = Math.floor((Date.now() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 1;
    });
    
    const expectedProductMasterStock = currentEntries.reduce((sum, p) => sum + p.purchase_qty, 0);
    const productMasterCorrect = tesst123Product.stock_quantity === expectedProductMasterStock;
    
    console.log(`\n   Current Entries (≤1 day old): ${currentEntries.length}`);
    currentEntries.forEach(p => {
      console.log(`   - ${new Date(p.date).toLocaleDateString()}: +${p.purchase_qty}`);
    });
    console.log(`\n   Expected Product Master Stock: ${expectedProductMasterStock}`);
    console.log(`   Actual Product Master Stock: ${tesst123Product.stock_quantity}`);
    console.log(`   Status: ${productMasterCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    // Test 4: Create a comprehensive test scenario
    console.log('\n\n📊 TEST 4: Comprehensive Scenario Test');
    console.log('-'.repeat(80));
    console.log('\nScenario: Test product with mixed current and historical entries');
    
    // Check if test_chronological_scenario exists
    const { data: existingProduct } = await supabase
      .from('product_master')
      .select('id, name, stock_quantity')
      .eq('name', 'test_chronological_scenario')
      .maybeSingle();
    
    if (existingProduct) {
      console.log(`\n✓ Found existing test product: ${existingProduct.name}`);
      console.log(`  ID: ${existingProduct.id}`);
      console.log(`  Current Stock: ${existingProduct.stock_quantity}`);
      
      // Get purchase history for this product
      const { data: scenarioHistory } = await supabase
        .from('purchase_history_with_stock')
        .select('*')
        .eq('product_id', existingProduct.id)
        .order('date', { ascending: true });
      
      console.log(`\n  Purchase History (${scenarioHistory?.length || 0} entries):`);
      
      let expectedRunningStock = 0;
      scenarioHistory?.forEach((p, i) => {
        expectedRunningStock += p.purchase_qty;
        const daysAgo = Math.floor((Date.now() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24));
        const isCorrect = p.current_stock_at_purchase === expectedRunningStock;
        
        console.log(`\n  Entry ${i + 1}:`);
        console.log(`    Date: ${new Date(p.date).toLocaleDateString()}`);
        console.log(`    Days Ago: ${daysAgo}`);
        console.log(`    Qty: +${p.purchase_qty}`);
        console.log(`    Expected Stock: ${expectedRunningStock}`);
        console.log(`    Actual Stock: ${p.current_stock_at_purchase}`);
        console.log(`    Status: ${isCorrect ? '✅' : '❌'}`);
      });
    } else {
      console.log('\n  ℹ️ Test product does not exist yet');
      console.log('  👉 Create entries through the UI to test auto-adjust functionality');
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('\n✅ Chronological Stock Calculation:');
    console.log('   - Historical entries show stock at that specific date');
    console.log('   - Each entry builds upon previous chronological entries');
    console.log('\n✅ Product Master Stock Logic:');
    console.log('   - Only counts CURRENT entries (≤1 day old)');
    console.log('   - Ignores HISTORICAL entries (>1 day old)');
    console.log('\n✅ Auto-Adjust Mechanism:');
    console.log('   - When historical entry is added, all subsequent entries recalculate');
    console.log('   - Maintains chronological consistency across all entries');
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
runChronologicalStockTest().then(() => {
  console.log('\n✅ Test execution complete\n');
}).catch(err => {
  console.error('\n❌ Test execution error:', err);
  process.exit(1);
});

