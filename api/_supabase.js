import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client with fallback values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mymrrfriupjbsmickekd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bXJyZnJpdXBqYnNtaWNrZWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzI3MTYsImV4cCI6MjA2OTcwODcxNn0.EQfteRnGfyUzn9VpEyoqdLBu0AbUCqLY7m7NPLfDS28';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Using fallback Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables for production.');
}

// Create client with additional options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}); 