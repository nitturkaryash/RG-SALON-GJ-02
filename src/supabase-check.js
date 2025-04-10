// Supabase connection test script
import { createClient } from '@supabase/supabase-js';

// This is a minimal test script to verify Supabase connection
// It can be run directly with Node.js

// Get environment variables with fallbacks
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cpkxkoosykyahuezxela.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa3hrb29zeWt5YWh1ZXp4ZWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzQ0NzcsImV4cCI6MjA1NTcxMDQ3N30.R0MaAaqVFMLObwnMVz-eghsKb_HYDWhCOAeFrQcw8e0';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key length:', supabaseAnonKey.length);

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