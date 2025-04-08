import { createBrowserClient } from '@supabase/ssr'

// Define a function to create the client instance
// Assumes NEXT_PUBLIC_ variables are set in the environment
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, // Note: JS doesn't use '!', but we remove the check as requested
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Note: JS doesn't use '!', but we remove the check as requested
  )
}