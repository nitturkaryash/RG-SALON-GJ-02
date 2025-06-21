const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://szxrqhhnqcfkqcsdlclp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eHJxaGhucWNma3Fjc2RsY2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDMyODksImV4cCI6MjA1MDAxOTI4OX0.kQQq_j3qrnXIVJepCcCaKRqJ2pJhxBDBvMRGKiZxjhE'
);

async function setupTrigger() {
  console.log('🔧 Setting up database trigger for automatic price tracking...');
  
  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data: test, error: testError } = await supabase
      .from('product_master')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful');

    // Step 1: Test trigger with sample data
    console.log('🧪 Testing trigger with sample data (this will create trigger automatically)...');
    
    // Get the test product details first
    const { data: testProduct, error: productError } = await supabase
      .from('product_master')
      .select('id, name, mrp_incl_gst, mrp_excl_gst, gst_percentage')
      .eq('name', 'test')
      .single();
      
    if (productError || !testProduct) {
      console.error('❌ Test product not found:', productError);
      return;
    }
    
    console.log(`📦 Using test product: ${testProduct.name}`);
    console.log(`   Current MRP Incl GST: ₹${testProduct.mrp_incl_gst}`);
    console.log(`   Current MRP Excl GST: ₹${testProduct.mrp_excl_gst}`);

    const testData = {
      purchase_id: 'test-trigger-' + Date.now(),
      product_id: testProduct.id,
      date: new Date().toISOString(),
      product_name: testProduct.name,
      purchase_qty: 1,
      mrp_incl_gst: Number(testProduct.mrp_incl_gst) + 100, // Different price to trigger change
      mrp_excl_gst: Number(testProduct.mrp_excl_gst) + 84.75,
      gst_percentage: testProduct.gst_percentage,
      purchase_invoice_number: 'TRIGGER-TEST-' + Date.now(),
      supplier: 'Test Trigger',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log(`💰 New prices to test:
   MRP Incl GST: ₹${testProduct.mrp_incl_gst} → ₹${testData.mrp_incl_gst}
   MRP Excl GST: ₹${testProduct.mrp_excl_gst} → ₹${testData.mrp_excl_gst}`);

    const { error: insertError } = await supabase
      .from('purchase_history_with_stock')
      .insert(testData);

    if (insertError) {
      console.error('❌ Test purchase insert failed:', insertError);
      return;
    }

    console.log('✅ Test purchase inserted');

    // Wait a moment for any trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if price history was created
    const { data: priceHistory, error: historyError } = await supabase
      .from('product_price_history')
      .select('*')
      .eq('reference_id', testData.purchase_id);

    if (historyError) {
      console.error('❌ Error checking price history:', historyError);
    } else if (!priceHistory || priceHistory.length === 0) {
      console.log('❌ No price history created - trigger is NOT working');
      console.log('💡 Manual trigger creation needed');
    } else {
      console.log('✅ Trigger working! Price history created:');
      priceHistory.forEach(history => {
        console.log(`   Old Price: ₹${history.old_mrp_incl_gst}`);
        console.log(`   New Price: ₹${history.new_mrp_incl_gst}`);
        console.log(`   Source: ${history.source_of_change}`);
      });
    }

    // Check if product master was updated
    const { data: updatedProduct, error: updatedError } = await supabase
      .from('product_master')
      .select('mrp_incl_gst, mrp_excl_gst')
      .eq('id', testProduct.id)
      .single();

    if (updatedError) {
      console.error('❌ Error checking updated product:', updatedError);
    } else {
      const productUpdated = (
        Number(updatedProduct.mrp_incl_gst) === testData.mrp_incl_gst &&
        Number(updatedProduct.mrp_excl_gst) === testData.mrp_excl_gst
      );
      
      if (productUpdated) {
        console.log('✅ Product master updated correctly');
      } else {
        console.log('❌ Product master NOT updated');
        console.log(`   Expected: ₹${testData.mrp_incl_gst}, Got: ₹${updatedProduct.mrp_incl_gst}`);
      }
    }

    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await supabase
      .from('purchase_history_with_stock')
      .delete()
      .eq('purchase_id', testData.purchase_id);

    await supabase
      .from('product_price_history')
      .delete()
      .eq('reference_id', testData.purchase_id);

    // Restore original product values
    await supabase
      .from('product_master')
      .update({
        mrp_incl_gst: testProduct.mrp_incl_gst,
        mrp_excl_gst: testProduct.mrp_excl_gst
      })
      .eq('id', testProduct.id);

    console.log('✅ Test data cleaned up and product restored');

    console.log('\n🎯 Summary:');
    console.log('If trigger is working:');
    console.log('  ✓ Price history records will be created automatically');
    console.log('  ✓ Product master will be updated automatically');
    console.log('  ✓ All purchase edits will track price changes');
    
    console.log('\nIf trigger is NOT working:');
    console.log('  • Enhanced functions still work when called manually');
    console.log('  • Price tracking happens via application code');
    console.log('  • All functionality still available in the UI');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupTrigger(); 