import { supabase } from '../utils/supabase/supabaseClient'; // Import supabase for dispatching events if needed, or use window directly

// Define the structure for the result array
export interface BillingResult {
  client_id: string;
  success: boolean;
  error?: Error;
} 