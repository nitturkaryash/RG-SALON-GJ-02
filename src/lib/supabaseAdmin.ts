import { createClient } from '@supabase/supabase-js';

// Admin client with service role key for server-side operations
// This should ONLY be used for admin operations and never exposed to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'sbp_f58062ed7f48caa1b88deca10b054bb2c59a010b';

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

// Create admin client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin-only operations that require elevated permissions
export const adminOperations = {
  // Execute raw SQL queries (admin only)
  async executeSql(query: string) {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { query });
    return { data, error };
  },

  // Bypass RLS for admin operations
  async adminSelect(table: string, options?: any) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(options?.select || '*', options);
    return { data, error };
  },

  // Admin insert operations
  async adminInsert(table: string, records: any[]) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .insert(records);
    return { data, error };
  },

  // Admin update operations
  async adminUpdate(table: string, updates: any, filter: any) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .update(updates)
      .match(filter);
    return { data, error };
  },

  // Admin delete operations
  async adminDelete(table: string, filter: any) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .delete()
      .match(filter);
    return { data, error };
  },
};

export default supabaseAdmin;
