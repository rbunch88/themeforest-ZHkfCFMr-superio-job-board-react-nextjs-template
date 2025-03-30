import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded (especially important for server-side usage)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Basic validation
if (!supabaseUrl) {
  console.error('Error: Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  console.error('Error: Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create and export the Supabase client instance
// Handle the case where keys might be missing during build or initial setup
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null; // Or provide a mock client / throw error if preferred

// Optional: Log a warning if the client couldn't be initialized
if (!supabase) {
  console.warn('Supabase client could not be initialized. Check environment variables.');
}