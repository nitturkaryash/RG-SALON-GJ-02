import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductMasterSync() {
    console.log('🔍 TESTING PRODUCT MASTER SYNC ISSUES\n');

    // Test 1: Check current state
    console.log('=== TEST 1: Current State ===');
    const { data: testProducts, error: testError } = await supabase
        .from('product_master')
        .select('id, name, stock_quantity, updated_at')
        .in('name', ['TESST_123', 'test_5', 'test_6', 'test_7', 'stock_test']);

    if (testError) {
        console.error('Error fetching test products:', testError);
        return;
    }

    for (const product of testProducts) {
        const { data: latestPurchase } = await supabase
            .from('purchase_history_with_stock')
            .select('current_stock_at_purchase, date, created_at')
            .eq('product_id', product.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        console.log(`Product: ${product.name}`);
        console.log(`  PM Stock: ${product.stock_quantity}`);
        console.log(`  PH Latest: ${latestPurchase?.current_stock_at_purchase || 'N/A'}`);
        console.log(`  PM Updated: ${product.updated_at}`);
        console.log(`  PH Created: ${latestPurchase?.created_at || 'N/A'}`);
        console.log('');
    }

    // Test 2: Simulate the sync logic from addPurchaseTransaction
    console.log('=== TEST 2: Simulating Sync Logic ===');
    const testProduct = testProducts.find(p => p.name === 'TESST_123');
    
    if (testProduct) {
        console.log(`Testing sync for ${testProduct.name}...`);
        
        // Get latest purchase (simulating the code logic)
        const { data: latestPurchase, error: latestError } = await supabase
            .from('purchase_history_with_stock')
            .select('current_stock_at_purchase, purchase_id, date')
            .eq('product_name', testProduct.name)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (latestError) {
            console.error('Error getting latest purchase:', latestError);
        } else if (latestPurchase) {
            console.log(`Latest purchase found: ${latestPurchase.purchase_id}, Stock: ${latestPurchase.current_stock_at_purchase}`);
            
            // Simulate the update
            const { error: updateError } = await supabase
                .from('product_master')
                .update({
                    stock_quantity: latestPurchase.current_stock_at_purchase,
                    updated_at: new Date().toISOString()
                })
                .eq('id', testProduct.id);

            if (updateError) {
                console.error('❌ Update failed:', updateError);
            } else {
                console.log('✅ Update successful');
                
                // Verify
                const { data: verifyPM } = await supabase
                    .from('product_master')
                    .select('stock_quantity, updated_at')
                    .eq('id', testProduct.id)
                    .single();

                console.log(`Verification - PM Stock: ${verifyPM?.stock_quantity}, Expected: ${latestPurchase.current_stock_at_purchase}`);
            }
        }
    }

    // Test 3: Check all products with mismatches
    console.log('\n=== TEST 3: All Mismatched Products ===');
    const { data: allProducts } = await supabase
        .from('product_master')
        .select('id, name, stock_quantity');

    let mismatchCount = 0;
    for (const product of allProducts || []) {
        const { data: latestPurchase } = await supabase
            .from('purchase_history_with_stock')
            .select('current_stock_at_purchase')
            .eq('product_id', product.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (latestPurchase && product.stock_quantity !== latestPurchase.current_stock_at_purchase) {
            mismatchCount++;
            if (mismatchCount <= 10) { // Show first 10 mismatches
                console.log(`${product.name}: PM=${product.stock_quantity}, PH=${latestPurchase.current_stock_at_purchase}`);
            }
        }
    }

    console.log(`\nTotal mismatched products: ${mismatchCount}`);
}

testProductMasterSync().catch(console.error);



