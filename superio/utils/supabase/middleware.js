import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Define the createClient function matching the new structure
export async function createClient(request) {
  // Create an initial response object
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Initialize the Supabase client
  const supabase = createServerClient(
    // Use environment variables for Supabase URL and Anon Key
    // Note: Removed TypeScript '!' non-null assertion for JS compatibility
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      // Define cookie handling methods as per the example
      cookies: {
        getAll() {
          // Retrieve all cookies from the request
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on the request object first
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          // Recreate the response object to reflect updated request cookies
          supabaseResponse = NextResponse.next({
            request,
          })
          // Set cookies on the response object
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fetch the user session after initializing the Supabase client
  const { data: { session } } = await supabase.auth.getSession();

  // Return the supabase client, session, and response object
  return { supabase, session, response: supabaseResponse }
}