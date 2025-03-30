'use client'; // Add this for client-side hooks

import Link from "next/link";
import LoginWithSocial from "./LoginWithSocial";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { supabase } from '../../../../utils/supabaseClient'; // Import Supabase client

const FormContent2 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize router

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase client not initialized.');
      setLoading(false);
      return;
    }

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        throw signInError;
      }

      // Login successful, now fetch profile to get role
      if (signInData?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .single();

        if (profileError) {
          throw new Error(`Could not fetch user profile: ${profileError.message}`);
        }

        if (profileData?.role === 'employer') {
          router.push('/employers-dashboard/dashboard');
        } else if (profileData?.role === 'candidate') {
          router.push('/candidates-dashboard/dashboard');
        } else {
          // Handle unexpected role or admin login if needed
          console.warn('User logged in with unexpected role:', profileData?.role);
          router.push('/'); // Redirect to homepage as a fallback
        }
      } else {
         throw new Error('Login successful, but user data not returned.');
      }

    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="form-inner">
      <h3>Login to My ABA Jobs</h3> {/* Update Title */}

      {/* <!--Login Form--> */}
      <form onSubmit={handleSubmit}> {/* Use onSubmit */}
         {/* Display Errors */}
         {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-group">
          <label>Email Address</label> {/* Changed Label */}
          <input
            type="email"        // Changed type to email
            name="email"        // Changed name to email
            placeholder="Email"  // Changed placeholder
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
           />
        </div>
        {/* email */}

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        {/* password */}

        <div className="form-group">
          <div className="field-outer">
            <div className="input-group checkboxes square">
              {/* Remember me functionality might need separate implementation */}
              <input type="checkbox" name="remember-me" id="remember" />
              <label htmlFor="remember" className="remember">
                <span className="custom-checkbox"></span> Remember me
              </label>
            </div>
            <a href="#" className="pwd"> {/* TODO: Implement password reset link */}
              Forgot password?
            </a>
          </div>
        </div>
        {/* forgot password */}

        <div className="form-group">
          <button
            className="theme-btn btn-style-one"
            type="submit"
            name="log-in"
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Logging In...' : 'Log In'} {/* Change text when loading */}
          </button>
        </div>
        {/* login */}
      </form>
      {/* End form */}

      <div className="bottom-box">
        <div className="text">
          Don&apos;t have an account? <Link href="/register">Signup</Link>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <LoginWithSocial />
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default FormContent2;
