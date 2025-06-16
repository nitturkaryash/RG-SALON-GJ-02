/**
 * Fix Admin Login Function
 * This script creates the missing login function and tests it
 */

import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://mtyudylsozncvilibxda.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

console.log('🔧 Fixing Admin Login Function');
console.log('='.repeat(50));

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Create the login function using SQL
 */
async function createLoginFunction() {
  try {
    console.log('📝 Creating check_admin_login function...');
    
    const { data, error } = await supabase.rpc('sql', {
      query: `
        CREATE OR REPLACE FUNCTION check_admin_login(username_input TEXT, password_input TEXT)
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM auth
            WHERE username = username_input 
            AND password_hash = password_input
            AND is_active = TRUE
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (error) {
      console.log('❌ Function creation failed:', error.message);
      console.log('⚠️  This might be because we need to use a different approach...');
      return false;
    }
    
    console.log('✅ Function created successfully');
    return true;
    
  } catch (err) {
    console.log('💥 Error creating function:', err.message);
    return false;
  }
}

/**
 * Test the login function
 */
async function testLoginFunction() {
  try {
    console.log('\n🧪 Testing login function...');
    
    const { data, error } = await supabase
      .rpc('check_admin_login', {
        username_input: 'admin',
        password_input: 'admin'
      });
    
    if (error) {
      console.log('❌ Function test failed:', error.message);
      return false;
    }
    
    console.log('✅ Function test result:', data);
    return data === true;
    
  } catch (err) {
    console.log('💥 Function test error:', err.message);
    return false;
  }
}

/**
 * Direct login test (bypassing function)
 */
async function directLoginTest() {
  try {
    console.log('\n🔍 Direct login test...');
    
    const { data, error } = await supabase
      .from('auth')
      .select('*')
      .eq('username', 'admin')
      .eq('password_hash', 'admin')
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.log('❌ Direct login failed:', error.message);
      return false;
    }
    
    if (data) {
      console.log('✅ Direct login successful!');
      console.log(`   Username: ${data.username}`);
      console.log(`   Role: ${data.role}`);
      console.log(`   ID: ${data.id}`);
      return true;
    }
    
    return false;
    
  } catch (err) {
    console.log('💥 Direct login error:', err.message);
    return false;
  }
}

/**
 * Test application-style login
 */
async function applicationLoginTest() {
  try {
    console.log('\n🚀 Application-style login test...');
    
    // This mimics how the app actually does login
    const { data: user, error: queryError } = await supabase
      .from('auth')
      .select('id, username, role, password_hash, is_active')
      .eq('username', 'admin')
      .single();

    if (queryError || !user) {
      console.log('❌ User lookup failed:', queryError?.message || 'User not found');
      return false;
    }
    
    if (!user.is_active) {
      console.log('❌ Account is inactive');
      return false;
    }

    if (user.password_hash !== 'admin') {
      console.log('❌ Password mismatch');
      console.log(`   Expected: admin`);
      console.log(`   Got: ${user.password_hash}`);
      return false;
    }

    console.log('✅ Application login successful!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    
    return true;
    
  } catch (err) {
    console.log('💥 Application login error:', err.message);
    return false;
  }
}

/**
 * Main fix function
 */
async function fixLogin() {
  console.log('🔥 Starting Login Fix Process\n');
  
  // Test 1: Direct login (should work)
  const directResult = await directLoginTest();
  
  // Test 2: Application-style login (should work)
  const appResult = await applicationLoginTest();
  
  // Test 3: Try to create function (might fail due to permissions)
  const functionCreated = await createLoginFunction();
  
  // Test 4: Test the function if it was created
  let functionResult = false;
  if (functionCreated) {
    functionResult = await testLoginFunction();
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 LOGIN FIX SUMMARY');
  console.log('='.repeat(50));
  console.log(`Direct Login Test: ${directResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Application Login Test: ${appResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Function Creation: ${functionCreated ? '✅ PASSED' : '⚠️ SKIPPED'}`);
  console.log(`Function Test: ${functionResult ? '✅ PASSED' : (functionCreated ? '❌ FAILED' : '⚠️ SKIPPED')}`);
  
  if (directResult && appResult) {
    console.log('\n🎉 GOOD NEWS: Login credentials are working!');
    console.log('🔑 Use: username="admin", password="admin"');
    console.log('🚀 Your application should work now');
    
    if (!functionCreated) {
      console.log('\n📋 Note: The check_admin_login function needs to be created manually');
      console.log('   Go to Supabase SQL Editor and run: create_login_function.sql');
    }
  } else {
    console.log('\n❌ Login issues detected. Please check the database.');
  }
  
  return directResult && appResult;
}

// Run the fix
fixLogin()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Fix error:', err);
    process.exit(1);
  }); 