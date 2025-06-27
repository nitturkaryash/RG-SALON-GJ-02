import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the correct credentials
const supabaseUrl = 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...');

  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('🔐 Auth Status:', authError ? '❌ Error' : '✅ Connected');
    if (authError) console.error('Auth Error:', authError.message);

    // Test database query
    const { data: dbData, error: dbError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact' });
    
    console.log('📊 Database Status:', dbError ? '❌ Error' : '✅ Connected');
    if (dbError) console.error('Database Error:', dbError.message);
    else console.log('Total admin users:', Array.isArray(dbData) ? dbData.length : 0);

    // Test storage
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();
    
    console.log('📦 Storage Status:', storageError ? '❌ Error' : '✅ Connected');
    if (storageError) console.error('Storage Error:', storageError.message);
    else console.log('Available buckets:', buckets.length);

    // Test RLS policies
    const { data: testData, error: rlsError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    console.log('🔒 RLS Status:', rlsError ? '❌ Error' : '✅ Connected');
    if (rlsError) console.error('RLS Error:', rlsError.message);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSupabaseConnection(); 