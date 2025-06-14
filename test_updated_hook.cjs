const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mtyudylsozncvilibxda.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA');

async function testUpdatedQuery() {
  console.log('Testing the updated query from inventory_purchases...');
  
  try {
    // Simulate the exact query that the updated hook will make
    const { data: purchaseRecords, error: fetchError } = await supabase
      .from('inventory_purchases')
      .select(
        'purchase_id,product_id,date,product_name,hsn_code,units,purchase_invoice_number,' +
        'purchase_qty,mrp_incl_gst,mrp_excl_gst,discount_on_purchase_percentage,gst_percentage,' +
        'purchase_taxable_value,purchase_igst,purchase_cgst,purchase_sgst,purchase_invoice_value_rs,' +
        'created_at,updated_at,transaction_type,current_stock,Vendor,purchase_cost_per_unit_ex_gst'
      )
      .order('date', { ascending: false });

    if (fetchError) {
      console.error('Query error:', fetchError);
      return;
    }

    console.log(`✅ Query successful! Found ${purchaseRecords.length} records`);
    
    if (purchaseRecords.length > 0) {
      console.log('Sample record:');
      console.log({
        purchase_id: purchaseRecords[0].purchase_id,
        product_name: purchaseRecords[0].product_name,
        date: purchaseRecords[0].date,
        purchase_qty: purchaseRecords[0].purchase_qty,
        supplier: purchaseRecords[0].Vendor,
        transaction_type: purchaseRecords[0].transaction_type
      });
    }

    console.log('\n✅ The frontend should now display purchase data correctly!');
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testUpdatedQuery().catch(console.error); 