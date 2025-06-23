import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlwlhrewrhcjfyqicjvn.supabase.co';
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sd2xocmV3cmhjamZ5cWljanZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODU1NzEsImV4cCI6MjA2NTc2MTU3MX0.z10Ix_HdYBGvHDqHQK9SR1kO7tp8YZ7-nmrk_7xelmQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  }
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
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  }
};

export default supabase; 