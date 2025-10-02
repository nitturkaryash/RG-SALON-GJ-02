import { createClient } from '@supabase/supabase-js';

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSyncFlow() {
    console.log('🔄 TESTING COMPLETE SYNC FLOW\n');

    const testProductName = 'TESST_123';
    
    // Step 1: Get current state
    console.log('=== STEP 1: Current State ===');
    const { data: currentPM } = await supabase
        .from('product_master')
        .select('id, name, stock_quantity, updated_at')
        .eq('name', testProductName)
        .single();

    const { data: latestPH } = await supabase
        .from('purchase_history_with_stock')
        .select('current_stock_at_purchase, date, created_at, purchase_id')
        .eq('product_name', testProductName)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    console.log(`Product Master: ${currentPM?.stock_quantity}`);
    console.log(`Latest Purchase History: ${latestPH?.current_stock_at_purchase}`);
    console.log(`PM Updated: ${currentPM?.updated_at}`);
    console.log(`PH Created: ${latestPH?.created_at}`);
    console.log('');

    // Step 2: Simulate adding a new purchase (like the UI would)
    console.log('=== STEP 2: Simulating New Purchase ===');
    const newPurchaseQty = 3;
    const newDate = '2025-10-01';
    
    // Get current stock from product_master (this is what the code should do)
    const currentStock = currentPM?.stock_quantity || 0;
    const newStock = currentStock + newPurchaseQty;
    
    console.log(`Current Stock: ${currentStock}`);
    console.log(`Adding: ${newPurchaseQty}`);
    console.log(`Expected New Stock: ${newStock}`);
    
    // Insert new purchase history record
    const { data: newPurchase, error: insertError } = await supabase
        .from('purchase_history_with_stock')
        .insert({
            product_id: currentPM.id,
            product_name: testProductName,
            purchase_qty: newPurchaseQty,
            date: newDate,
            vendor: 'Test Vendor',
            purchase_invoice_number: 'TEST-SYNC-001',
            mrp_incl_gst: 100,
            current_stock_at_purchase: newStock,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (insertError) {
        console.error('❌ Insert failed:', insertError);
        return;
    }

    console.log(`✅ New purchase inserted: ${newPurchase.purchase_id}, Stock: ${newPurchase.current_stock_at_purchase}`);
    console.log('');

    // Step 3: Sync product_master (simulating the code logic)
    console.log('=== STEP 3: Syncing Product Master ===');
    
    // Get latest purchase (like the code does)
    const { data: latestPurchase, error: latestError } = await supabase
        .from('purchase_history_with_stock')
        .select('current_stock_at_purchase, date, purchase_id')
        .eq('product_id', currentPM.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (latestError) {
        console.error('❌ Failed to get latest purchase:', latestError);
        return;
    }

    console.log(`Latest purchase: ${latestPurchase.purchase_id}, Stock: ${latestPurchase.current_stock_at_purchase}`);
    
    // Update product_master (like the code does)
    const { error: updateError } = await supabase
        .from('product_master')
        .update({
            stock_quantity: latestPurchase.current_stock_at_purchase,
            updated_at: new Date().toISOString()
        })
        .eq('id', currentPM.id);

    if (updateError) {
        console.error('❌ Update failed:', updateError);
        return;
    }

    console.log(`✅ Product master updated to: ${latestPurchase.current_stock_at_purchase}`);
    console.log('');

    // Step 4: Verify sync
    console.log('=== STEP 4: Verification ===');
    const { data: verifyPM } = await supabase
        .from('product_master')
        .select('stock_quantity, updated_at')
        .eq('id', currentPM.id)
        .single();

    const { data: verifyPH } = await supabase
        .from('purchase_history_with_stock')
        .select('current_stock_at_purchase')
        .eq('product_name', testProductName)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    console.log(`Final PM Stock: ${verifyPM?.stock_quantity}`);
    console.log(`Final PH Stock: ${verifyPH?.current_stock_at_purchase}`);
    console.log(`PM Updated: ${verifyPM?.updated_at}`);
    
    if (verifyPM?.stock_quantity === verifyPH?.current_stock_at_purchase) {
        console.log('✅ SYNC SUCCESSFUL!');
    } else {
        console.log('❌ SYNC FAILED!');
    }
}

testSyncFlow().catch(console.error);





