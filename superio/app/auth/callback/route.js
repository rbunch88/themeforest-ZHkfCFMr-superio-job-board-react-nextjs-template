import { createClient } from '@/utils/supabase/server' // Use server client
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/' // Default redirect to home if no profile logic needed initially

  if (code) {
    const supabase = createClient() // Uses cookies() from next/headers
    const { error: authError, data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (!authError && session) {
        // --- Start: Role-based redirect logic ---
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = Row not found
            console.error('Auth Callback: Error fetching profile:', profileError);
            // Redirect to an error page or login?
            return NextResponse.redirect(`${origin}/login?message=Error fetching profile`);
        }

        if (profile?.role === 'employer') {
            console.log('Auth Callback: Redirecting employer to dashboard');
            return NextResponse.redirect(`${origin}/employers-dashboard/dashboard`);
        } else if (profile?.role === 'candidate') {
            console.log('Auth Callback: Redirecting candidate to dashboard');
            return NextResponse.redirect(`${origin}/candidates-dashboard/dashboard`);
        } else {
            // New user or profile without role - redirect to complete profile
            console.log('Auth Callback: Redirecting new user to complete profile');
            return NextResponse.redirect(`${origin}/complete-profile`);
        }
        // --- End: Role-based redirect logic ---

    } else {
        console.error('Auth Callback: Error exchanging code or no session:', authError);
        // Redirect to an error page or login
        return NextResponse.redirect(`${origin}/login?message=Could not exchange code for session`);
    }
  } else {
      console.error('Auth Callback: No code found in query params');
      // Redirect user back to login page with error message
      return NextResponse.redirect(`${origin}/login?message=Could not log you in (missing code)`);
  }

  // Fallback redirect (should ideally not be reached with the logic above)
  // return NextResponse.redirect(`${origin}${next}`);
}
