const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mtyudylsozncvilibxda.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA');

async function checkPurchaseData() {
  console.log('Checking inventory_purchases table...');
  
  // Check table structure
  const { data: tableInfo, error: tableError } = await supabase
    .from('inventory_purchases')
    .select('*', { count: 'exact', head: true });
    
  if (tableError) {
    console.error('Table error:', tableError);
    return;
  }
  
  console.log('Table exists, checking data...');
  
  // Get count of records
  const { count, error: countError } = await supabase
    .from('inventory_purchases')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Count error:', countError);
    return;
  }
  
  console.log('Total records in inventory_purchases:', count);
  
  if (count > 0) {
    // Get sample records
    const { data: samples, error: sampleError } = await supabase
      .from('inventory_purchases')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
      
    if (sampleError) {
      console.error('Sample error:', sampleError);
    } else {
      console.log('Sample records:', JSON.stringify(samples, null, 2));
    }
  }
}

checkPurchaseData().catch(console.error); 