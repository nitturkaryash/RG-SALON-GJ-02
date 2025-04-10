/**
 * Supabase Connection Debugging Utilities
 * 
 * This file provides utilities to help debug Supabase connection issues.
 */

import { supabase } from './supabaseClient';

/**
 * Tests the Supabase connection and returns detailed diagnostics
 */
export const testSupabaseConnection = async () => {
  const results = {
    client: {
      url: supabase.supabaseUrl,
      keyLength: supabase.supabaseKey?.length || 0,
      initialized: !!supabase
    },
    tests: {},
    overall: 'pending'
  };
  
  // Test 1: Try to get table names
  try {
    results.tests.tableListing = { status: 'pending' };
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
      
    if (error) {
      results.tests.tableListing = { 
        status: 'failed',
        error: error.message,
        details: error
      };
    } else {
      results.tests.tableListing = { 
        status: 'success',
        tableCount: data?.length || 0,
        sampleTables: data?.map(t => t.tablename).slice(0, 3)
      };
    }
  } catch (err) {
    results.tests.tableListing = { 
      status: 'error',
      error: err.message,
      details: err
    };
  }
  
  // Test 2: Try to query product_collections
  try {
    results.tests.productCollections = { status: 'pending' };
    const { data, error } = await supabase
      .from('product_collections')
      .select('id, name')
      .limit(3);
      
    if (error) {
      results.tests.productCollections = { 
        status: 'failed',
        error: error.message,
        details: error
      };
    } else {
      results.tests.productCollections = { 
        status: 'success',
        count: data?.length || 0,
        sample: data?.slice(0, 2)
      };
    }
  } catch (err) {
    results.tests.productCollections = { 
      status: 'error',
      error: err.message,
      details: err
    };
  }
  
  // Test 3: Try to query inventory_products
  try {
    results.tests.inventoryProducts = { status: 'pending' };
    const { data, error } = await supabase
      .from('inventory_products')
      .select('product_id, product_name')
      .limit(3);
      
    if (error) {
      results.tests.inventoryProducts = { 
        status: 'failed',
        error: error.message,
        details: error
      };
    } else {
      results.tests.inventoryProducts = { 
        status: 'success',
        count: data?.length || 0,
        sample: data?.slice(0, 2)
      };
    }
  } catch (err) {
    results.tests.inventoryProducts = { 
      status: 'error',
      error: err.message,
      details: err
    };
  }
  
  // Set overall status
  const statuses = Object.values(results.tests).map(t => t.status);
  if (statuses.every(s => s === 'success')) {
    results.overall = 'success';
  } else if (statuses.some(s => s === 'success')) {
    results.overall = 'partial';
  } else {
    results.overall = 'failed';
  }
  
  return results;
};

/**
 * Helper function to test the connection and log results
 */
export const debugSupabaseConnection = async () => {
  console.group('🔍 Supabase Connection Debug');
  console.log('Testing Supabase connection...');
  
  try {
    const results = await testSupabaseConnection();
    console.log('Connection test results:', results);
    
    if (results.overall === 'success') {
      console.log('✅ All tests passed! Connection is working properly.');
    } else if (results.overall === 'partial') {
      console.warn('⚠️ Some tests passed, but not all. Check details above.');
    } else {
      console.error('❌ All tests failed. Connection is not working.');
      console.log('Recommendations:');
      console.log('1. Check API keys and URL in .env file');
      console.log('2. Verify Supabase project is running');
      console.log('3. Check network connectivity and CORS settings');
    }
  } catch (err) {
    console.error('Error running connection tests:', err);
  }
  
  console.groupEnd();
}; 