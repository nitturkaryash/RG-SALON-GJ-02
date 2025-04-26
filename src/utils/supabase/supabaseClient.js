import { createClient } from '@supabase/supabase-js';
// Get environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gvetdbrdcdhpkicppzry.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2ZXRkYnJkY2RocGtpY3BwenJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4ODY0NDUsImV4cCI6MjA1ODQ2MjQ0NX0.eU73eMLG0CZBWI6rTjVuvwPAOkh5aYjpVysm_JxpAWk';

// Create a function to get or create the Supabase client
let _supabaseInstance = null;
const getSupabaseClient = () => {
  if (!_supabaseInstance) {
    _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Don't persist the session to avoid JWT errors
        autoRefreshToken: false, // Don't try to refresh the token
        detectSessionInUrl: false, // Don't look for the session in the URL
      },
    });
    
    // Add URL and key to the instance for debugging
    _supabaseInstance.supabaseUrl = supabaseUrl;
    _supabaseInstance.supabaseKey = supabaseAnonKey;
    
    console.log('Supabase client initialized with URL:', supabaseUrl);
    console.log('Supabase key length:', supabaseAnonKey.length);
  }
  
  return _supabaseInstance;
};

// Export a proxy object that lazily initializes the client
export const supabase = new Proxy({}, {
  get: function(target, prop) {
    const client = getSupabaseClient();
    return client[prop];
  }
});

// DEVELOPMENT MODE: Create mock data handlers
// This should be removed in production
const DEVELOPMENT_MODE = false;
// List of tables to use mock data for
// Commenting out since we're no longer using mock data
/* 
const MOCK_DATA_TABLES = [
    'inventory_purchases',
    'inventory_sales',
    'inventory_consumption',
    'inventory_balance_stock',
    'product_collections',
    'products'
];

// Mock data for inventory
const mockInventoryData = {
    // Mock data removed/commented
};
*/
// Override Supabase methods in development mode
// Commenting out since we're no longer using mock data
/*
if (DEVELOPMENT_MODE) {
    console.log('🔧 DEVELOPMENT MODE: Using mock data for inventory and real data for products');
    // Create a proxy to intercept Supabase calls
    const originalFrom = supabase.from;
    // Override the from method to intercept table access
    supabase.from = function (table) {
        // Mock implementation removed/commented
    };
}
*/
// Tables for inventory management
export const TABLES = {
    PURCHASES: 'inventory_purchases',
    SALES: 'sales',
    CONSUMPTION: 'inventory_salon_consumption',
    BALANCE_STOCK: 'balance_stock_view',
    PRODUCTS: 'products',
    POS_ORDERS: 'pos_orders',
    POS_ORDER_ITEMS: 'pos_order_items',
    CLIENTS: 'clients',
    STYLISTS: 'stylists',
    APPOINTMENTS: 'appointments',
    SERVICES: 'services'
};
// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
    console.error('Supabase error:', error);
    return new Error(error.message || 'An error occurred with the database operation');
};
// Helper function to check if user is authenticated
// DEVELOPMENT MODE: Always returns a fake user
export const checkAuthentication = async () => {
    // In development mode, always return a fake user
    if (DEVELOPMENT_MODE) {
        return {
            id: 'dev-user-id',
            email: 'dev@example.com',
            user_metadata: { name: 'Development User' }
        };
    }
    // Normal authentication check
    const client = getSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser();
    
    if (error) {
        console.error('Authentication error:', error);
        throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!user) {
        throw new Error('User is not authenticated. Please log in again.');
    }
    
    return user;
};
