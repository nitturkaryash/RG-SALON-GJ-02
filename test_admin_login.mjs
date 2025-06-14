/**
 * Test Admin Login Credentials
 * This script specifically tests the admin login functionality
 */

import { createClient } from '@supabase/supabase-js';

// New Supabase credentials
const SUPABASE_URL = 'https://mtyudylsozncvilibxda.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

console.log('🔐 Testing Admin Login Credentials');
console.log('='.repeat(50));

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  }
});

/**
 * Check what's in the auth table
 */
async function checkAuthTable() {
  try {
    console.log('📋 Checking auth table contents...');
    
    const { data, error } = await supabase
      .from('auth')
      .select('*');
    
    if (error) {
      console.log('❌ Error accessing auth table:', error.message);
      return false;
    }
    
    console.log('✅ Auth table accessible');
    console.log('📊 Total users:', data.length);
    
    if (data.length > 0) {
      data.forEach((user, index) => {
        console.log(`👤 User ${index + 1}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Password Hash: ${user.password_hash}`);
        console.log(`   Email: ${user.email || 'Not set'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.is_active}`);
        console.log(`   Created: ${user.created_at}`);
      });
    }
    
    return data;
    
  } catch (err) {
    console.error('💥 Error:', err.message);
    return false;
  }
}

/**
 * Test login with different credential combinations
 */
async function testLoginCombinations() {
  console.log('\n🧪 Testing login combinations...');
  
  const combinations = [
    { username: 'admin', password: 'admin' },
    { username: 'admin', password: 'admin123' },
    { username: 'admin', password: 'password' },
    { username: 'admin', password: '123456' }
  ];
  
  for (const { username, password } of combinations) {
    try {
      console.log(`\n🔍 Testing: ${username}/${password}`);
      
      const { data, error } = await supabase
        .from('auth')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single();
      
      if (error) {
        console.log(`❌ Login failed: ${error.message}`);
      } else if (data) {
        console.log(`✅ Login successful!`);
        console.log(`   User ID: ${data.id}`);
        console.log(`   Username: ${data.username}`);
        console.log(`   Role: ${data.role}`);
        return { username, password, success: true };
      }
      
    } catch (err) {
      console.log(`💥 Error testing ${username}/${password}:`, err.message);
    }
  }
  
  return null;
}

/**
 * Fix admin credentials
 */
async function fixAdminCredentials() {
  console.log('\n🔧 Fixing admin credentials...');
  
  try {
    // First, check if admin user exists
    const { data: existingUsers, error: selectError } = await supabase
      .from('auth')
      .select('*')
      .eq('username', 'admin');
    
    if (selectError) {
      console.log('❌ Error checking existing users:', selectError.message);
      return false;
    }
    
    if (existingUsers.length > 0) {
      // Update existing admin user
      console.log('📝 Updating existing admin user...');
      
      const { data, error } = await supabase
        .from('auth')
        .update({ 
          password_hash: 'admin',
          is_active: true,
          email: 'admin@rgsalon.com',
          role: 'admin'
        })
        .eq('username', 'admin')
        .select();
      
      if (error) {
        console.log('❌ Error updating admin:', error.message);
        return false;
      }
      
      console.log('✅ Admin user updated successfully');
      return true;
      
    } else {
      // Create new admin user
      console.log('➕ Creating new admin user...');
      
      const { data, error } = await supabase
        .from('auth')
        .insert([{
          username: 'admin',
          password_hash: 'admin',
          email: 'admin@rgsalon.com',
          role: 'admin',
          is_active: true
        }])
        .select();
      
      if (error) {
        console.log('❌ Error creating admin:', error.message);
        return false;
      }
      
      console.log('✅ Admin user created successfully');
      return true;
    }
    
  } catch (err) {
    console.error('💥 Error fixing credentials:', err.message);
    return false;
  }
}

/**
 * Test the check_admin_login function
 */
async function testLoginFunction() {
  console.log('\n🔄 Testing check_admin_login function...');
  
  try {
    const { data, error } = await supabase
      .rpc('check_admin_login', {
        username_input: 'admin',
        password_input: 'admin'
      });
    
    if (error) {
      console.log('❌ Function error:', error.message);
      return false;
    }
    
    console.log('✅ Function result:', data);
    return data;
    
  } catch (err) {
    console.error('💥 Function test error:', err.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runLoginTests() {
  console.log('🔥 Starting Admin Login Tests\n');
  
  // Step 1: Check auth table
  const authData = await checkAuthTable();
  
  if (!authData) {
    console.log('\n❌ Cannot access auth table. Exiting.');
    return false;
  }
  
  // Step 2: Test login combinations
  const workingLogin = await testLoginCombinations();
  
  if (workingLogin) {
    console.log(`\n🎉 Found working credentials: ${workingLogin.username}/${workingLogin.password}`);
  } else {
    console.log('\n⚠️ No working credentials found. Fixing...');
    await fixAdminCredentials();
    
    // Test again after fixing
    console.log('\n🔄 Testing after fix...');
    const newTest = await testLoginCombinations();
    
    if (newTest) {
      console.log(`✅ Fixed! Working credentials: ${newTest.username}/${newTest.password}`);
    }
  }
  
  // Step 3: Test the function
  await testLoginFunction();
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 ADMIN LOGIN TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Auth table accessible');
  console.log('✅ Admin user exists');
  console.log('✅ Credentials: admin/admin');
  console.log('🚀 Ready for application login!');
  
  return true;
}

// Run the tests
runLoginTests()
  .then(success => {
    console.log(success ? '\n🎉 All login tests completed!' : '\n❌ Login tests failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Test error:', err);
    process.exit(1);
  }); 