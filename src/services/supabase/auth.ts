
import { Session, createClient } from '@supabase/supabase-js';
import { supabase as globalSupabase } from "@/integrations/supabase/client";

// Initialize Supabase client with fallback values if env vars are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Use the global supabase client if available, or create a new one
export const supabase = globalSupabase || (supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null);

// Function to check if Supabase is properly configured
export function checkSupabaseConfig() {
  if (!supabase) {
    throw new Error('Supabase configuration is missing. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables or ensure the global client is initialized.');
  }
}

// Check if the user is logged in and return the session
export async function checkUserAuthentication(): Promise<Session> {
  checkSupabaseConfig();
  const { data: { session } } = await supabase!.auth.getSession();
  if (!session) {
    throw new Error('You need to be logged in to use this feature.');
  }
  return session;
}
