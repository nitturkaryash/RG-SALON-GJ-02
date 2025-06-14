// Supabase connection test script
import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This is a minimal test script to verify Supabase connection
// It can be run directly with Node.js

console.log('🔍 Checking Supabase Connection with NEW credentials...');

// NEW Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

console.log('📡 URL:', supabaseUrl);
console.log('🔑 Key preview:', supabaseAnonKey.substring(0, 50) + '...');

if (supabaseUrl.includes('mtyudylsozncvilibxda')) {
  console.log('✅ Using NEW Supabase database');
} else {
  console.warn('⚠️ WARNING: Still using old database!');
}

// Create the client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.error('Connection test error:', error);
      return false;
    }
    
    console.log('Connection successful!');
    console.log('Data sample:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

// Run the test
testConnection()
  .then(result => {
    console.log('Test completed with result:', result);
    // Exit with appropriate code
    process.exit(result ? 0 : 1);
  })
  .catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
  }); 