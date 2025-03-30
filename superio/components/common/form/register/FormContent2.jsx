'use client'; // Add this for client-side hooks

import { useState } from 'react';
import { supabase } from '../../../../utils/supabaseClient'; // Import Supabase client

const FormContent2 = ({ role }) => { // Accept role prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // For success messages

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    if (!supabase) {
      setError('Supabase client not initialized. Check environment variables.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            role: role, // Use the passed role
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if email confirmation is required (common Supabase setting)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
         setMessage('Signup successful, but email confirmation might be required (check Supabase settings).');
         // Potentially redirect or clear form here
      } else if (data.session) {
         setMessage('Signup successful! Check your email for confirmation.');
         // Potentially redirect or clear form here
         setEmail('');
         setPassword('');
         setFirstName('');
         setLastName('');
      } else {
         // This case might occur if email confirmation is required
         setMessage('Signup successful! Please check your email to confirm your account.');
         setEmail('');
         setPassword('');
         setFirstName('');
         setLastName('');
      }


    } catch (err) {
      console.error('Signup Error:', err);
      setError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit}> {/* Use onSubmit */}
      {/* Display Messages/Errors */}
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

       <div className="form-group">
         <label>First Name</label>
         <input
           type="text"
           name="first-name"
           placeholder="First Name"
           required
           value={firstName}
           onChange={(e) => setFirstName(e.target.value)}
           disabled={loading}
         />
       </div>

       <div className="form-group">
         <label>Last Name</label>
         <input
           type="text"
           name="last-name"
           placeholder="Last Name"
           required
           value={lastName}
           onChange={(e) => setLastName(e.target.value)}
           disabled={loading}
         />
       </div>


      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          name="email" // Changed name to email
          placeholder="Email" // Changed placeholder
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
          id="password-field"
          type="password"
          name="password"
          placeholder="Password"
          required // Added required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      {/* password */}

      <div className="form-group">
        <button
          className="theme-btn btn-style-one"
          type="submit"
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Registering...' : 'Register'} {/* Change text when loading */}
        </button>
      </div>
      {/* login */}
    </form>
  );
};

export default FormContent2;
