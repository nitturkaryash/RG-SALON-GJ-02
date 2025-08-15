import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Define TABLES immediately after imports
export const TABLES = {
  PURCHASES: 'purchase_history_with_stock',
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

// Global state management
export const connectionState = {
  status: 'initializing',
  error: null as Error | null
};

// Initialize supabase client strictly from env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): Error => {
  if (!error) {
    return new Error('Unknown error occurred');
  }

  // JWT errors
  if (error.message?.includes('JWT') || error.message?.includes('JWS')) {
    return new Error('Authentication error. Please log in again.');
  }

  // Connection errors
  if (error.code === 'PGRST16' || error.message?.includes('Failed to fetch')) {
    return new Error('Database connection error. Please check your internet connection.');
  }

  return new Error(error.message || 'Database operation failed');
};

// Check if user is authenticated
export const checkAuthentication = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session?.user || null;
  } catch {
    return null;
  }
};

// Check database connection
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.SALES)
      .select('*', { count: 'exact', head: true });

    if (error) {
      connectionState.status = 'error';
      connectionState.error = error;
      return { connected: false, error };
    }

    connectionState.status = 'connected';
    connectionState.error = null;
    return { connected: true, error: null };
  } catch (error) {
    connectionState.status = 'error';
    connectionState.error = error instanceof Error ? error : new Error('Unknown error');
    return { connected: false, error: connectionState.error };
  }
};

// Retry failed database operations
export const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt === maxRetries) break;
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  
  throw lastError || new Error('Operation failed after multiple retries');
}; 