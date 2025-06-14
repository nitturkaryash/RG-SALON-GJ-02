const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mtyudylsozncvilibxda.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA');

async function checkAndPopulateHistoryTable() {
  console.log('=== Checking purchase_history_with_stock table ===');
  
  try {
    // First, try to get the table structure
    const { data: tableStructure, error: structureError } = await supabase
      .from('purchase_history_with_stock')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('Table structure error:', structureError);
      console.log('Table might not exist. Let me check what tables are available...');
      return;
    }
    
    console.log('✅ Table exists! Checking current records...');
    
    // Check current count
    const { count: currentCount, error: countError } = await supabase
      .from('purchase_history_with_stock')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Count error:', countError);
      return;
    }
    
    console.log(`Current records in purchase_history_with_stock: ${currentCount}`);
    
    // Get data from inventory_purchases
    console.log('\n=== Getting data from inventory_purchases ===');
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_purchases')
      .select('*')
      .order('date', { ascending: false });
    
    if (inventoryError) {
      console.error('Inventory data error:', inventoryError);
      return;
    }
    
    console.log(`Found ${inventoryData.length} records in inventory_purchases`);
    
    if (inventoryData.length > 0 && currentCount === 0) {
      console.log('\n=== Populating purchase_history_with_stock table ===');
      
      // Transform and insert data
      const transformedData = inventoryData.map(item => ({
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
        supplier: item.Vendor,
        current_stock_at_purchase: item.current_stock,
        'Purchase_Cost/Unit(Ex.GST)': item.purchase_cost_per_unit_ex_gst
      }));
      
      // Insert in batches to avoid issues
      const batchSize = 100;
      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batch = transformedData.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('purchase_history_with_stock')
          .insert(batch);
        
        if (insertError) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        } else {
          console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
        }
      }
      
      // Verify the insert
      const { count: newCount, error: newCountError } = await supabase
        .from('purchase_history_with_stock')
        .select('*', { count: 'exact', head: true });
      
      if (!newCountError) {
        console.log(`\n✅ Successfully populated! New count: ${newCount}`);
      }
    } else if (currentCount > 0) {
      console.log('Table already has data, no population needed.');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAndPopulateHistoryTable().catch(console.error); 