const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mtyudylsozncvilibxda.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA');

async function checkBothTables() {
  console.log('=== Checking inventory_purchases table ===');
  
  // Check inventory_purchases table
  const { count: inventoryCount, error: inventoryError } = await supabase
    .from('inventory_purchases')
    .select('*', { count: 'exact', head: true });
    
  if (inventoryError) {
    console.error('inventory_purchases error:', inventoryError);
  } else {
    console.log('inventory_purchases records:', inventoryCount);
  }
  
  console.log('\n=== Checking purchase_history_with_stock table ===');
  
  // Check purchase_history_with_stock table
  const { count: historyCount, error: historyError } = await supabase
    .from('purchase_history_with_stock')
    .select('*', { count: 'exact', head: true });
    
  if (historyError) {
    console.error('purchase_history_with_stock error:', historyError);
  } else {
    console.log('purchase_history_with_stock records:', historyCount);
    
    if (historyCount > 0) {
      // Get sample from history table
      const { data: historySamples, error: historyDataError } = await supabase
        .from('purchase_history_with_stock')
        .select('*')
        .limit(2);
        
      if (historyDataError) {
        console.error('Error fetching history samples:', historyDataError);
      } else {
        console.log('Sample from purchase_history_with_stock:', JSON.stringify(historySamples, null, 2));
      }
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`inventory_purchases: ${inventoryCount || 0} records`);
  console.log(`purchase_history_with_stock: ${historyCount || 0} records`);
}

checkBothTables().catch(console.error); 