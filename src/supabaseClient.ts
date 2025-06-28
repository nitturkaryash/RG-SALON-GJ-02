import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Declare variables first without initialization
let supabaseUrl: string;
let supabaseAnonKey: string;
let supabaseClient: SupabaseClient;

// Initialize variables in a function to control order
function initSupabase() {
  // Use NEXT_PUBLIC_ credentials as primary, with fallbacks
  supabaseUrl = 
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    'https://mlwlhrewrhcjfyqicjvn.supabase.co';

  supabaseAnonKey = 
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sd2xocmV3cmhjamZ5cWljanZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODU1NzEsImV4cCI6MjA2NTc2MTU3MX0.z10Ix_HdYBGvHDqHQK9SR1kO7tp8YZ7-nmrk_7xelmQ';

  console.log('🔧 Supabase Client Configuration:');
  console.log('📡 URL:', supabaseUrl);
  console.log('🔑 Key length:', supabaseAnonKey.length);

  // Verify we're using the correct credentials
  if (supabaseUrl.includes('mlwlhrewrhcjfyqicjvn')) {
    console.log('✅ Using CORRECT Supabase credentials for pankajhadole24@gmail.com');
  } else {
    console.warn('⚠️ WARNING: Still using wrong Supabase project!');
  }

  // Create the Supabase client
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
  
  return supabaseClient;
}

// Initialize immediately
const supabase = initSupabase();

// Export everything
export { supabase, supabaseUrl, supabaseAnonKey };

// Database Types
export type Tables = {
  profiles: Profile
  services: Service
  appointments: Appointment
  stylists: Stylist
  clients: Client
  orders: Order
}

export type Profile = {
  id: string
  created_at: string
  email: string
  full_name: string
  avatar_url?: string
}

export type Service = {
  id: string
  created_at: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  active: boolean
}

export type Appointment = {
  id: string
  created_at: string
  client_id: string
  stylist_id: string
  service_id: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export type Stylist = {
  id: string
  created_at: string
  profile_id: string
  specialties: string[]
  bio: string
  available: boolean
}

export type Client = {
  id: string
  created_at: string
  profile_id: string
  phone: string
  preferences?: string
  last_visit?: string
}

export type Order = {
  id: string
  created_at: string
  client_id: string
  stylist_id: string
  total: number
  status: 'pending' | 'completed' | 'refunded'
  payment_method: string
}

// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export default supabase 