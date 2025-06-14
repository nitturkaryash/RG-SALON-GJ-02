const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mtyudylsozncvilibxda.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA');

async function testHistoryTableQuery() {
  console.log('Testing the updated query from purchase_history_with_stock...');
  
  try {
    // Simulate the exact query that the updated hook will make
    const { data: purchaseRecords, error: fetchError } = await supabase
      .from('purchase_history_with_stock')
      .select(
        'purchase_id,product_id,date,product_name,hsn_code,units,purchase_invoice_number,' +
        'purchase_qty,mrp_incl_gst,mrp_excl_gst,discount_on_purchase_percentage,gst_percentage,' +
        'purchase_taxable_value,purchase_igst,purchase_cgst,purchase_sgst,purchase_invoice_value_rs,' +
        'supplier,current_stock_at_purchase,computed_stock_taxable_value,computed_stock_cgst,' +
        'computed_stock_sgst,computed_stock_igst,computed_stock_total_value,"Purchase_Cost/Unit(Ex.GST)",created_at,updated_at,transaction_type'
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
        supplier: purchaseRecords[0].supplier,
        transaction_type: purchaseRecords[0].transaction_type,
        current_stock_at_purchase: purchaseRecords[0].current_stock_at_purchase,
        computed_stock_taxable_value: purchaseRecords[0].computed_stock_taxable_value
      });

      console.log('\n✅ The frontend should now display purchase data correctly from purchase_history_with_stock table!');
    } else {
      console.log('❌ No records found in purchase_history_with_stock table');
      
      // Check if we need to populate the table
      console.log('\nChecking inventory_purchases table...');
      const { count: inventoryCount, error: inventoryError } = await supabase
        .from('inventory_purchases')
        .select('*', { count: 'exact', head: true });
      
      if (!inventoryError && inventoryCount > 0) {
        console.log(`Found ${inventoryCount} records in inventory_purchases. You may need to populate purchase_history_with_stock table.`);
      }
    }
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testHistoryTableQuery().catch(console.error); 