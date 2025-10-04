import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)'
  );
}

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database types for better TypeScript support
export interface AdminUser {
  id: number;
  user_id: string;
  email: string;
  password: string;
  is_active: boolean;
  created_at: string;
  gst_percentage?: string;
  hsn_code?: string;
  igst?: string;
}

export interface DatabaseTables {
  admin_users: AdminUser;
  // Add other table types as needed
}

// Helper functions for admin user operations
export const adminUserService = {
  // Create a new admin user
  async createAdminUser(userData: Omit<AdminUser, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([userData])
      .select()
      .single();

    return { data, error };
  },

  // Get admin user by user_id
  async getAdminUserByUserId(userId: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Get admin user by email
  async getAdminUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    return { data, error };
  },

  // Update admin user
  async updateAdminUser(id: number, updates: Partial<AdminUser>) {
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Get all admin users
  async getAllAdminUsers() {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Toggle user active status
  async toggleUserStatus(id: number, isActive: boolean) {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Delete admin user
  async deleteAdminUser(id: number) {
    const { data, error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    return { data, error };
  },
};

// Authentication helper functions
export const authService = {
  // Sign up a new user
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },
};

// Database tables constants
export const TABLES = {
  PURCHASES: 'purchase_history_with_stock',
  PURCHASE_HISTORY_WITH_STOCK: 'purchase_history_with_stock',
  SALES: 'sales_history_final',
  SALES_BASE: 'inventory_sales_new',
  CONSUMPTION: 'salon_consumption_new',
  BALANCE_STOCK: 'balance_stock',
  POS_ORDERS: 'pos_orders',
  POS_ORDER_ITEMS: 'pos_order_items',
  SALES_CONSUMER: 'inventory_sales_consumer',
  SALON_CONSUMPTION: 'salon_consumption_new',
  SALON_CONSUMPTION_PRODUCTS: 'salon_consumption_products',
};

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
    return new Error(
      'Database connection error. Please check your internet connection.'
    );
  }

  return new Error(error.message || 'Database operation failed');
};

export default supabase;
