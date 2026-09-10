'use client';

import { useEffect } from 'react';
import { useUser, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from "next/link";

const RegisterPage = () => {
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
    <div className="register-page-wrapper" style={{ maxWidth: '600px', margin: '96px auto', textAlign: 'center', padding: '30px' }}>
        <div className="register-message">
            <h2>Create a New Account</h2>
            <p style={{ margin: '20px 0' }}>Please sign up to create your account.</p>
            
            <div style={{ margin: '30px 0' }}>
              <SignUpButton mode="modal">
                <button className="theme-btn btn-style-one" style={{ padding: '12px 30px', fontSize: '16px' }}>
                  Sign Up Here
                </button>
              </SignUpButton>
            </div>
            
            <p>Already have an account? <Link href="/login" style={{ textDecoration: 'underline' }}>Sign in here</Link>.</p>
            
            <div style={{ marginTop: '30px' }}>
              <Link href="/" className="theme-btn btn-style-three">
                Back to Home
              </Link>
            </div>
        </div>
    </div>
  );
};

export default RegisterPage;
