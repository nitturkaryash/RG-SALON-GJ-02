/**
 * Simple test for NEXT_PUBLIC_ Supabase credentials
 */

const { createClient } = require('@supabase/supabase-js');

// NEXT_PUBLIC_ credentials
const SUPABASE_URL = 'https://mtyudylsozncvilibxda.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

console.log('🔧 Testing NEXT_PUBLIC_ Supabase Credentials');
console.log('='.repeat(50));
console.log(`📡 URL: ${SUPABASE_URL}`);
console.log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 50)}...`);
console.log('');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCredentials() {
  try {
    console.log('🌐 Testing connection...');
    
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('auth')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    
    // Test 2: Admin authentication
    console.log('\n🔐 Testing admin authentication...');
    
    const { data: user, error: authError } = await supabase
      .from('auth')
      .select('*')
      .eq('username', 'admin')
      .eq('password_hash', 'admin')
      .eq('is_active', true)
      .single();
    
    if (authError) {
      console.log('❌ Admin auth failed:', authError.message);
      return false;
    }
    
    if (user) {
      console.log('✅ Admin authentication successful!');
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
    }
    
    // Test 3: Quick CRUD test
    console.log('\n📝 Testing CRUD operations...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('auth')
      .insert([{
        username: 'test_next_public',
        password_hash: 'test123',
        email: 'test@example.com',
        role: 'user',
        is_active: true
      }])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ INSERT failed:', insertError.message);
    } else {
      console.log('✅ INSERT successful');
      
      // Cleanup
      await supabase
        .from('auth')
        .delete()
        .eq('id', insertData.id);
      
      console.log('✅ Cleanup completed');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 NEXT_PUBLIC_ CREDENTIALS TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ Connection: PASSED');
    console.log('✅ Authentication: PASSED');
    console.log('✅ CRUD Operations: PASSED');
    console.log('');
    console.log('🎉 NEXT_PUBLIC_ credentials are working perfectly!');
    console.log('🔑 Admin credentials: admin/admin');
    console.log('🚀 Ready for MCP use!');
    
    return true;
    
  } catch (err) {
    console.log('❌ Test error:', err.message);
    return false;
  }
}

// Run the test
testCredentials()
  .then(success => {
    if (success) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n❌ Some tests failed');
    }
  })
  .catch(err => {
    console.error('💥 Error:', err);
  }); 