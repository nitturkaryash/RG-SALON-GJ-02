import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Define TABLES immediately after imports
export const TABLES = {
  PURCHASES: 'inventory_purchases',
  PURCHASE_HISTORY_WITH_STOCK: 'purchase_history_with_stock',
  SALES: 'inventory_sales_new',
  CONSUMPTION: 'inventory_consumption',
  BALANCE_STOCK: 'balance_stock_view',
  POS_ORDERS: 'pos_orders',
  POS_ORDER_ITEMS: 'pos_order_items',
  SALES_CONSUMER: 'inventory_sales_consumer',
  SALON_CONSUMPTION: 'inventory_salon_consumption',
  SALON_CONSUMPTION_PRODUCTS: 'salon_consumption_products'
};

// Global variable to track connection status and error for diagnostics - initialize first
export let connectionStatus = 'initializing';
export let connectionError: Error | null = null;

// Function to validate JWT token format
const validateJwtFormat = (token: string): boolean => {
  if (!token) return false;
  
  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be base64url encoded
  for (const part of parts) {
    if (!/^[A-Za-z0-9_-]+$/g.test(part)) return false;
  }
  
  return true;
};

// Initialize supabase client creation in a controlled function
function initializeSupabaseClient() {
  // Get environment variables for Supabase
  let supabaseUrl = 'https://mtyudylsozncvilibxda.supabase.co';
  let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

  // Try different environment variable formats (Vite, Next.js, etc.)
  if (import.meta.env.VITE_SUPABASE_URL) {
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  } else if (import.meta.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string;
  }

  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  } else if (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  }

  // Clean the key very aggressively
  let cleanedSupabaseUrl = supabaseUrl ? supabaseUrl.trim() : import.meta.env.VITE_SUPABASE_URL || '';
  let cleanedSupabaseAnonKey = '';

  if (supabaseAnonKey) {
    // Remove ALL whitespace, quotes, and non-essential characters
    cleanedSupabaseAnonKey = supabaseAnonKey.replace(/[\s\n\r"'`]/g, '');
    
    // Check if it has the correct format (3 parts separated by periods)
    const parts = cleanedSupabaseAnonKey.split('.');
    
    if (parts.length !== 3) {
      // Use a valid format fallback key from environment variable
      cleanedSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      connectionStatus = 'using-fallback-token';
      connectionError = new Error(`Invalid JWT format (${parts.length} parts), using fallback`);
    }
  }

  // Validate environment variables
  if (!cleanedSupabaseUrl || !cleanedSupabaseAnonKey) {
    connectionStatus = 'missing-credentials';
    connectionError = new Error('Missing Supabase credentials');
  }

  // Create the Supabase client
  let client: SupabaseClient;

  try {
    // Create the client with the cleaned URL and key
    client = createClient(cleanedSupabaseUrl, cleanedSupabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
    
    connectionStatus = 'initialized';
    
  } catch (error) {
    connectionStatus = 'initialization-error';
    connectionError = error instanceof Error ? error : new Error('Unknown error during initialization');
    
    // Create a fallback client with a properly formatted JWT token
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      { 
        auth: { 
          autoRefreshToken: false, 
          persistSession: false 
        } 
      }
    );
  }

  return client;
}

// Initialize the client
const supabase = initializeSupabaseClient();

// Test the connection asynchronously
(async () => {
  try {
    const { data, error } = await supabase
      .from('inventory_sales_new')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      connectionStatus = 'connection-test-failed';
      connectionError = new Error(`Connection test failed: ${error.message}`);
    } else {
      connectionStatus = 'connected';
    }
  } catch (e) {
    connectionStatus = 'connection-test-exception';
    connectionError = e instanceof Error ? e : new Error('Unknown error during connection test');
  }
})();

// Export the client
export { supabase };

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): Error => {
  // Check for JWT-specific errors
  if (error?.message && (
    error.message.includes('JWSError') || 
    error.message.includes('JWT') ||
    error.message.includes('CompactDecodeError')
  )) {
    return new Error(`Authentication token error. Please check the console for details. Status: ${connectionStatus}`);
  }
  
  // Check for connection errors
  if (error?.code === 'PGRST16' || (error?.message && error.message.includes('Failed to fetch'))) {
    return new Error('Unable to connect to the database. Please check your internet connection.');
  }
  
  return new Error(error?.message || 'An error occurred with the database operation');
};

// Helper function to check if user is authenticated
export const checkAuthentication = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
  
    if (error) {
      return null;
    }
    
    return data.session?.user || null;
  } catch (error) {
    return null;
  }
};

// Helper function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SALES)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      return {
        connected: false,
        status: connectionStatus,
        error: error
      };
    }
    
    return {
      connected: true,
      status: 'connected',
      error: null
    };
  } catch (error) {
    return {
      connected: false,
      status: 'exception',
      error: error
    };
  }
};

/**
 * Retry a database operation with exponential backoff
 * @param operation Function to retry
 * @param maxRetries Maximum number of retries
 * @returns Promise with the result of the operation
 */
export const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>, 
  maxRetries = 3
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Calculate delay with exponential backoff (starts at 500ms)
      const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw handleSupabaseError(lastError);
}; 