import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Define a function to create the client instance for Server Components.
// It accepts no parameters.
export function createClient() {
  const cookieStore = cookies()

  // Ensure environment variables are available
  // Note: Using NEXT_PUBLIC_ variables on the server is generally okay in Next.js,
  // but sensitive keys should ideally use non-public variables if possible.
  // Sticking to user's explicit request for NEXT_PUBLIC_ vars here.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Consider throwing an error or logging a more specific message
    console.error("Supabase URL or Anon Key is missing from environment variables.");
    // Depending on the desired behavior, you might return null or throw an error.
    // For now, let's proceed assuming they might be set later or handled elsewhere.
    // However, createServerClient will likely fail without them.
    // Throwing an error might be better for debugging missing env vars
    throw new Error("Supabase environment variables are not set.");
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name, options) {
          try {
            // In Next.js, setting a cookie with an empty value deletes it.
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}