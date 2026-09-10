'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganization } from '@clerk/nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { organization } = useOrganization();

  useEffect(() => {
    if (!isLoaded) return;

    async function checkUserProfile() {
      if (isSignedIn && userId) {
        console.log('User is signed in');
        
        try {
          // For now, we'll use Clerk's user metadata to determine the user's role
          // In a real implementation, you would fetch this from your database or set it in Clerk's user metadata
          
          // Check if user is part of an organization (this is a Clerk concept)
          if (organization) {
            console.log('User is part of an organization, redirecting to employer dashboard');
            router.push('/employers-dashboard/dashboard');
          } else {
            // Default to candidate dashboard for now
            // In a real implementation, you would check user metadata or your database
            console.log('User is not part of an organization, redirecting to candidate dashboard');
            router.push('/candidates-dashboard/dashboard');
          }
        } catch (error) {
          console.error('Error during auth callback:', error);
          router.push('/?error=auth_callback_failed');
        }
      } else {
        // User is not signed in
        console.log('User is not signed in, redirecting to home');
        router.push('/');
      }
    }
    
    checkUserProfile();
  }, [isLoaded, userId, isSignedIn, organization, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-semibold">Checking your login...</h2>
      <p>You'll be redirected automatically.</p>
    </div>
  );
}
