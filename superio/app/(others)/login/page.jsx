'use client';

import { useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from "next/link";

const LoginPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/'); // Redirect to homepage if already signed in
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    // Show a loading state or null while checking auth state or redirecting
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div className="login-page-wrapper" style={{ maxWidth: '600px', margin: '96px auto', textAlign: 'center', padding: '30px' }}>
        <div className="login-message">
            <h2>Sign In to Your Account</h2>
            <p style={{ margin: '20px 0' }}>Please sign in to access your account.</p>
            
            <div style={{ margin: '30px 0' }}>
              <SignInButton mode="modal">
                <button className="theme-btn btn-style-one" style={{ padding: '12px 30px', fontSize: '16px' }}>
                  Sign In Here
                </button>
              </SignInButton>
            </div>
            
            <p>Don't have an account? <Link href="/register" style={{ textDecoration: 'underline' }}>Sign up here</Link>.</p>
            
            <div style={{ marginTop: '30px' }}>
              <Link href="/" className="theme-btn btn-style-three">
                Back to Home
              </Link>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
