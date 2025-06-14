const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mtyudylsozncvilibxda.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA');

async function syncPurchaseTables() {
  console.log('=== Syncing inventory_purchases to purchase_history_with_stock ===');
  
  try {
    // Get all records from inventory_purchases
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_purchases')
      .select('*')
      .order('date', { ascending: false });
    
    if (inventoryError) {
      console.error('Error fetching inventory_purchases:', inventoryError);
      return;
    }
    
    console.log(`Found ${inventoryData.length} records in inventory_purchases`);
    
    // Get existing records in purchase_history_with_stock to avoid duplicates
    const { data: existingHistory, error: existingError } = await supabase
      .from('purchase_history_with_stock')
      .select('purchase_id');
    
    if (existingError) {
      console.error('Error fetching existing history:', existingError);
      return;
    }
    
    const existingIds = new Set(existingHistory.map(record => record.purchase_id));
    console.log(`Found ${existingIds.size} existing records in purchase_history_with_stock`);
    
    // Filter out records that already exist
    const newRecords = inventoryData.filter(record => !existingIds.has(record.purchase_id));
    console.log(`${newRecords.length} new records to sync`);
    
    if (newRecords.length === 0) {
      console.log('✅ All records are already synced!');
      return;
    }
    
    // Transform records for purchase_history_with_stock table
    const transformedRecords = newRecords.map(item => ({
      purchase_id: item.purchase_id,
      product_id: item.product_id,
      date: item.date,
      product_name: item.product_name,
      hsn_code: item.hsn_code,
      units: item.units,
      purchase_invoice_number: item.purchase_invoice_number,
      purchase_qty: item.purchase_qty,
      mrp_incl_gst: item.mrp_incl_gst,
      mrp_excl_gst: item.mrp_excl_gst,
      discount_on_purchase_percentage: item.discount_on_purchase_percentage,
      gst_percentage: item.gst_percentage,
      purchase_taxable_value: item.purchase_taxable_value,
      purchase_igst: item.purchase_igst,
      purchase_cgst: item.purchase_cgst,
      purchase_sgst: item.purchase_sgst,
      purchase_invoice_value_rs: item.purchase_invoice_value_rs,
      created_at: item.created_at,
      updated_at: item.updated_at,
      transaction_type: item.transaction_type || 'purchase',
      supplier: item.Vendor || item.supplier,
      current_stock_at_purchase: item.current_stock,
      'Purchase_Cost/Unit(Ex.GST)': item.purchase_cost_per_unit_ex_gst,
      // Add computed stock values (can be null initially)
      computed_stock_taxable_value: null,
      computed_stock_cgst: null,
      computed_stock_sgst: null,
      computed_stock_igst: null,
      computed_stock_total_value: null
    }));
    
    // Insert records in batches
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < transformedRecords.length; i += batchSize) {
      const batch = transformedRecords.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('purchase_history_with_stock')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        // Try inserting one by one for this batch
        for (const record of batch) {
          const { error: singleError } = await supabase
            .from('purchase_history_with_stock')
            .insert([record]);
          
          if (singleError) {
            console.error(`Error inserting record ${record.purchase_id}:`, singleError);
          } else {
            successCount++;
          }
        }
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
        successCount += batch.length;
      }
    }
    
    console.log(`\n✅ Sync completed! Successfully synced ${successCount}/${newRecords.length} records`);
    
    // Verify the final count
    const { count: finalCount, error: finalCountError } = await supabase
      .from('purchase_history_with_stock')
      .select('*', { count: 'exact', head: true });
    
    if (!finalCountError) {
      console.log(`Final count in purchase_history_with_stock: ${finalCount}`);
    }
    
  } catch (err) {
    console.error('Error during sync:', err);
  }
}

syncPurchaseTables().catch(console.error); 