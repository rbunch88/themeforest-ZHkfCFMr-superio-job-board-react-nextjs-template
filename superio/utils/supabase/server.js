import { createServerClient } from '@supabase/ssr'

// Define a function to create the client instance for Server Components.
// It accepts the cookieStore instance from the caller (e.g., a Server Component or Route Handler).
export function createClient(cookieStore) {
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
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          // Ensure cookieStore is valid and has getAll method
          return typeof cookieStore?.getAll === 'function' ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          // Ensure cookieStore is valid, has set method, and cookiesToSet is an array
          if (typeof cookieStore?.set === 'function' && Array.isArray(cookiesToSet)) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // Basic validation for name and value
                if (name && value !== undefined) {
                  cookieStore.set(name, value, options);
                }
              });
            } catch (error) {
              console.error('Error setting cookies in Supabase server client:', error);
            }
          }
        },
        // Optional: Add remove method based on common Supabase patterns if needed later
        // remove(name, options) {
        //   if (typeof cookieStore?.set === 'function' && name) {
        //     try {
        //       cookieStore.set({ name, value: '', ...options });
        //     } catch (error) {
        //       console.error(`Error removing cookie "${name}":`, error);
        //     }
        //   }
        // }
      },
    }
  );
}