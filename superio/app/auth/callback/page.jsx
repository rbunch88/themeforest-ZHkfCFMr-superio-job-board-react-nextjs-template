'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Listener for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session ? ' vorhanden' : 'null');

      // We are primarily interested in the SIGNED_IN event which occurs after redirect
      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        console.log('SIGNED_IN event received, fetching profile for user ID:', userId);

        try {
          // Fetch the user's profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError.message, 'Code:', profileError.code);
            // If the error is specifically 'PGRST116' (No rows found), it means the profile doesn't exist yet.
            if (profileError.code === 'PGRST116') {
              console.log('Profile not found (likely new user), redirecting to complete profile.');
              router.push('/complete-profile');
            } else {
              // For other DB errors, redirect to login with an error
              router.push(`/login?error=profile_fetch_failed&code=${profileError.code}`);
            }
            return; // Stop further processing in case of error
          }

          console.log('Profile fetched:', profile);

          // Redirect based on role
          if (profile?.role) {
            if (profile.role === 'Employer') {
              console.log('Redirecting Employer to employer-dashboard');
              router.push('/employer-dashboard/dashboard');
            } else if (profile.role === 'Candidate') { // Make sure role name matches exactly
              console.log('Redirecting Candidate to candidate-dashboard');
              router.push('/candidate-dashboard/dashboard');
            } else {
              console.warn('Unexpected user role found:', profile.role);
              router.push('/login?error=unexpected_role');
            }
          } else {
            // If role is null or undefined in the profile, redirect to complete profile
            console.log('Profile exists but role is null, redirecting to complete profile.');
            router.push('/complete-profile');
          }
        } catch (err) {
          console.error('Unexpected error fetching profile or redirecting:', err);
          router.push('/login?error=callback_processing_exception');
        }
      } else if (event === 'INITIAL_SESSION') {
         // This event might fire if a session already exists. Handle similarly if needed,
         // but SIGNED_IN after redirect is the primary target here.
         console.log('INITIAL_SESSION event');
         // Potentially add similar profile fetch/redirect logic if needed for this case too
      } else if (event === 'SIGNED_OUT') {
         console.log('SIGNED_OUT event');
         router.push('/login?message=signed_out');
      }
      // Handle other events like USER_UPDATED, PASSWORD_RECOVERY if necessary
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase]); // Dependencies for useEffect

  // Keep the loading indicator while waiting for the auth state change
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Processing authentication, please wait...</p>
      {/* Optionally, add a loading spinner component here */}
    </div>
  );
}
