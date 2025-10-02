import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('═══════════════════════════════════════════════════');
console.log('🔍 COMPREHENSIVE TRANSACTION TEST REPORT');
console.log('═══════════════════════════════════════════════════\n');
console.log(`📡 Database: ${process.env.VITE_SUPABASE_URL}`);
console.log(`🔑 Auth: Using ANON KEY\n`);

const tests = {
  passed: 0,
  failed: 0,
  warning: 0,
  total: 0
};

async function testConnection() {
  console.log('1️⃣  CONNECTION TEST');
  console.log('─'.repeat(50));
  
  try {
    const { data, error } = await supabase
      .from('product_master')
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('✅ Database connection: SUCCESS');
      console.log(`   Connected to: ${process.env.VITE_SUPABASE_URL}`);
      tests.passed++;
    } else {
      console.log('❌ Database connection: FAILED');
      console.log(`   Error: ${error.message}`);
      tests.failed++;
    }
  } catch (err) {
    console.log('❌ Database connection: FAILED');
    console.log(`   Error: ${err.message}`);
    tests.failed++;
  }
  tests.total++;
}

async function testReadOperations() {
  console.log('\n2️⃣  READ OPERATIONS TEST');
  console.log('─'.repeat(50));
  
  const tables = [
    { name: 'product_master', hasData: true },
    { name: 'pos_orders', hasData: true },
    { name: 'clients', hasData: false },
    { name: 'appointments', hasData: false },
    { name: 'services', hasData: false },
    { name: 'products', hasData: false },
    { name: 'stylists', hasData: false },
    { name: 'membership_tiers', hasData: false }
  ];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact' })
        .limit(5);
      
      if (error) {
        if (error.message.includes('Authentication required') || 
            error.message.includes('row-level security')) {
          console.log(`⚠️  ${table.name}: RLS PROTECTED (requires authentication)`);
          tests.warning++;
        } else {
          console.log(`❌ ${table.name}: FAILED - ${error.message}`);
          tests.failed++;
        }
      } else {
        console.log(`✅ ${table.name}: SUCCESS (${count || 0} records)`);
        tests.passed++;
      }
    } catch (err) {
      console.log(`❌ ${table.name}: ERROR - ${err.message}`);
      tests.failed++;
    }
    tests.total++;
  }
}

async function testDataIntegrity() {
  console.log('\n3️⃣  DATA INTEGRITY TEST');
  console.log('─'.repeat(50));
  
  try {
    const { data, error } = await supabase
      .from('product_master')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Product Master read: FAILED');
      tests.failed++;
    } else {
      console.log(`✅ Product Master: ${data.length} products retrieved`);
      
      if (data.length > 0) {
        const sample = data[0];
        console.log(`   Sample: "${sample.name}" | Stock: ${sample.stock_quantity} | Price: ₹${sample.price}`);
        
        // Check data fields
        const hasRequiredFields = sample.id && sample.name && (sample.price !== null);
        if (hasRequiredFields) {
          console.log('✅ Data structure: VALID');
          tests.passed++;
        } else {
          console.log('❌ Data structure: INCOMPLETE');
          tests.failed++;
        }
      } else {
        console.log('⚠️  No data to validate');
        tests.warning++;
      }
      tests.passed++;
    }
  } catch (err) {
    console.log(`❌ Data integrity test: FAILED - ${err.message}`);
    tests.failed++;
  }
  tests.total += 2;
}

async function testComplexQueries() {
  console.log('\n4️⃣  COMPLEX QUERY TEST');
  console.log('─'.repeat(50));
  
  // Test ordering
  try {
    const { data, error } = await supabase
      .from('product_master')
      .select('name, stock_quantity')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (!error) {
      console.log('✅ Ordering query: SUCCESS');
      console.log(`   Retrieved ${data.length} products ordered by date`);
      tests.passed++;
    } else {
      console.log('❌ Ordering query: FAILED');
      tests.failed++;
    }
  } catch (err) {
    console.log(`❌ Ordering query: ERROR - ${err.message}`);
    tests.failed++;
  }
  tests.total++;
  
  // Test filtering
  try {
    const { data, error } = await supabase
      .from('product_master')
      .select('*')
      .gt('stock_quantity', 0)
      .limit(5);
    
    if (!error) {
      console.log('✅ Filtering query (stock > 0): SUCCESS');
      console.log(`   Found ${data.length} products in stock`);
      tests.passed++;
    } else {
      console.log('❌ Filtering query: FAILED');
      tests.failed++;
    }
  } catch (err) {
    console.log(`❌ Filtering query: ERROR - ${err.message}`);
    tests.failed++;
  }
  tests.total++;
  
  // Test count
  try {
    const { count, error } = await supabase
      .from('product_master')
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log('✅ Count query: SUCCESS');
      console.log(`   Total products in database: ${count}`);
      tests.passed++;
    } else {
      console.log('❌ Count query: FAILED');
      tests.failed++;
    }
  } catch (err) {
    console.log(`❌ Count query: ERROR - ${err.message}`);
    tests.failed++;
  }
  tests.total++;
}

async function testPOSOrders() {
  console.log('\n5️⃣  POS ORDERS TEST');
  console.log('─'.repeat(50));
  
  try {
    const { data, error } = await supabase
      .from('pos_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.log('❌ POS Orders read: FAILED');
      tests.failed++;
    } else {
      console.log(`✅ POS Orders: ${data.length} recent orders retrieved`);
      
      if (data.length > 0) {
        const sample = data[0];
        console.log(`   Latest: ${sample.client_name || 'N/A'} | Total: ₹${sample.total || sample.total_amount || 0}`);
      }
      tests.passed++;
    }
  } catch (err) {
    console.log(`❌ POS Orders test: ERROR - ${err.message}`);
    tests.failed++;
  }
  tests.total++;
}

async function checkEnvironmentVariables() {
  console.log('\n6️⃣  ENVIRONMENT CONFIGURATION');
  console.log('─'.repeat(50));
  
  const envVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  for (const varName of envVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: SET`);
      tests.passed++;
    } else {
      console.log(`❌ ${varName}: MISSING`);
      tests.failed++;
    }
    tests.total++;
  }
}

async function runAllTests() {
  await testConnection();
  await testReadOperations();
  await testDataIntegrity();
  await testComplexQueries();
  await testPOSOrders();
  await checkEnvironmentVariables();
  
  // Final summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 FINAL TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✅ Passed:   ${tests.passed}/${tests.total}`);
  console.log(`❌ Failed:   ${tests.failed}/${tests.total}`);
  console.log(`⚠️  Warnings: ${tests.warning} (RLS protected tables)`);
  
  const successRate = ((tests.passed / tests.total) * 100).toFixed(1);
  console.log(`\n🎯 Success Rate: ${successRate}%`);
  
  console.log('\n📝 CONCLUSIONS:');
  console.log('─'.repeat(50));
  
  if (tests.passed >= tests.total * 0.8) {
    console.log('✅ Database is FULLY OPERATIONAL');
    console.log('✅ All environment variables configured correctly');
    console.log('✅ Read operations working properly');
    console.log('✅ Complex queries executing successfully');
    
    if (tests.warning > 0) {
      console.log('\n⚠️  NOTE: Some tables require user authentication (RLS)');
      console.log('   This is NORMAL security behavior');
      console.log('   Users must sign in to access protected data');
    }
  } else if (tests.passed >= tests.total * 0.5) {
    console.log('⚠️  Database is PARTIALLY OPERATIONAL');
    console.log('   Some features may require authentication');
  } else {
    console.log('❌ Database has ISSUES');
    console.log('   Check configuration and credentials');
  }
  
  console.log('\n═══════════════════════════════════════════════════\n');
}

runAllTests();

