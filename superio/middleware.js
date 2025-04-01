import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Create an actionable Supabase client for middleware.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          req.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          req.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  const loginUrl = new URL('/login', req.url); // Construct login URL based on request

  
    // Define protected dashboard paths
    const employerDashboardPaths = ['/employers-dashboard', '/candidates-list-v1']; // Added applicant list
    const candidateDashboardPaths = ['/candidates-dashboard'];
    // Combine all paths that require *some* login
    const protectedPaths = [...employerDashboardPaths, ...candidateDashboardPaths];
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // If no session, redirect to login
    if (!session) {
      console.log('Middleware: No session, redirecting to login');
      return NextResponse.redirect(loginUrl);
    }

    // If session exists, check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Middleware: Error fetching profile or profile not found', profileError);
      // Decide how to handle: redirect to login or show error? Redirecting to login is safer.
      return NextResponse.redirect(loginUrl);
    }

    // Check if user role matches the required dashboard
    const userRole = profile.role;
    const isEmployerPath = employerDashboardPaths.some(path => pathname.startsWith(path));
    const isCandidatePath = candidateDashboardPaths.some(path => pathname.startsWith(path));

    if (isEmployerPath && userRole !== 'employer') {
      console.log(`Middleware: Role mismatch (${userRole}) for employer path, redirecting`);
      // Redirect non-employers away from employer dashboard (e.g., to candidate dashboard or home)
      return NextResponse.redirect(new URL('/candidates-dashboard/dashboard', req.url)); // Or '/'
    }

    if (isCandidatePath && userRole !== 'candidate') {
      console.log(`Middleware: Role mismatch (${userRole}) for candidate path, redirecting`);
      // Redirect non-candidates away from candidate dashboard (e.g., to employer dashboard or home)
      return NextResponse.redirect(new URL('/employers-dashboard/dashboard', req.url)); // Or '/'
    }

    // Role matches or it's an admin (if admin role exists and has access) - allow access
    console.log(`Middleware: Access granted for role ${userRole} to path ${pathname}`);
  }

  // Allow the request to proceed for non-protected paths or authorized users
  return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login
     * - register
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
    // Explicitly include dashboard paths if the negative lookahead isn't sufficient (optional)
    // '/employers-dashboard/:path*',
    // '/candidates-dashboard/:path*',
  ],
};