// Supabase connection test script
import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This is a minimal test script to verify Supabase connection
// It can be run directly with Node.js

console.log('🔍 Checking Supabase Connection with NEW credentials...');

// Supabase configuration strictly from env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env variables');
  process.exit(1);
}

console.log('📡 URL set');
console.log('🔑 Key present');

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