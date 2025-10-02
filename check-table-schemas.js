import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('📋 Checking Table Schemas...\n');

const tables = ['clients', 'appointments', 'services', 'products', 'product_master', 'pos_orders'];

async function checkTableSchema(tableName) {
  console.log(`\n🔍 Table: ${tableName}`);
  console.log('─'.repeat(50));
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Error: ${error.message}`);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Accessible - Sample columns:');
      console.log(Object.keys(data[0]).join(', '));
    } else {
      console.log('✅ Accessible but empty - trying insert to see columns...');
      
      // Try a test insert to see what columns are expected
      const { error: insertError } = await supabase
        .from(tableName)
        .insert({});
      
      if (insertError) {
        console.log(`Insert error (shows required fields): ${insertError.message}`);
      }
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

async function run() {
  for (const table of tables) {
    await checkTableSchema(table);
  }
  
  console.log('\n\n═'.repeat(25));
  console.log('Checking database connection and RLS policies...\n');
  
  // Check if we can access product_master details
  const { data: pmData } = await supabase
    .from('product_master')
    .select('*')
    .limit(1);
  
  if (pmData && pmData.length > 0) {
    console.log('📦 Product Master sample record:');
    console.log(JSON.stringify(pmData[0], null, 2));
  }
}

run();

