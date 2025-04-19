import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr' // Use standard SSR client

export async function middleware(request) {
  // Create a response object that we can modify and return
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for middleware using standard SSR pattern
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // If the cookie is set, update the request and response cookies
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ // Recreate response to apply changes
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          // If the cookie is removed, update the request and response cookies
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ // Recreate response to apply changes
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session and get current user data
  const { data: { session } } = await supabase.auth.getSession()

  // --- Existing Role-Based Logic ---
  const { pathname } = request.nextUrl;
  const loginUrl = new URL('/login', request.url);

  // Define protected dashboard paths
  const employerDashboardPaths = ['/employers-dashboard', '/candidates'];
  const candidateDashboardPaths = ['/candidates-dashboard'];
  const protectedPaths = [...employerDashboardPaths, ...candidateDashboardPaths];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // If no session, redirect to login
    if (!session) {
      console.log('Middleware: No session, redirecting to login');
      return NextResponse.redirect(loginUrl); // Use return to stop further execution
    }

    // If session exists, check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Middleware: Error fetching profile or profile not found', profileError);
      // Redirecting to login is safer.
      return NextResponse.redirect(loginUrl); // Use return
    }

    // Check if user role matches the required dashboard
    const userRole = profile.role;
    const isEmployerPath = employerDashboardPaths.some(path => pathname.startsWith(path));
    const isCandidatePath = candidateDashboardPaths.some(path => pathname.startsWith(path));

    if (isEmployerPath && userRole !== 'employer') {
      console.log(`Middleware: Role mismatch (${userRole}) for employer path, redirecting`);
      return NextResponse.redirect(new URL('/candidates-dashboard/dashboard', request.url)); // Use return
    }

    if (isCandidatePath && userRole !== 'candidate') {
      console.log(`Middleware: Role mismatch (${userRole}) for candidate path, redirecting`);
      return NextResponse.redirect(new URL('/employers-dashboard/dashboard', request.url)); // Use return
    }

    // Role matches - allow access
    console.log(`Middleware: Access granted for role ${userRole} to path ${pathname}`);
  }
  // --- End Role-Based Logic ---

  // Return the response (possibly modified by cookie updates or redirects)
  return response
}

// Keep existing config, add common asset extensions
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};