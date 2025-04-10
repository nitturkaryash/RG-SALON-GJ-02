import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Declare variables first without initialization
let supabaseUrl: string;
let supabaseAnonKey: string;
let supabaseClient: SupabaseClient;

// Initialize variables in a function to control order
function initSupabase() {
  // Get environment variables with fallbacks
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cpkxkoosykyahuezxela.supabase.co';
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa3hrb29zeWt5YWh1ZXp4ZWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzQ0NzcsImV4cCI6MjA1NTcxMDQ3N30.R0MaAaqVFMLObwnMVz-eghsKb_HYDWhCOAeFrQcw8e0';
  
  // Create the Supabase client
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
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