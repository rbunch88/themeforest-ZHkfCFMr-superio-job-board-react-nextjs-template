import { createClient } from '@/utils/supabase/server' // Use server client
import { redirect } from 'next/navigation'
import { updateProfile } from './actions' // Import the server action

// Make it an async Server Component
export default async function CompleteProfilePage({ searchParams }) {
  const supabase = createClient() // Uses cookies() from next/headers

  // Fetch user server-side
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Middleware should handle this, but as a safeguard
    return redirect('/login?message=You need to be logged in to complete your profile')
  }

  // Check if profile already exists and has a role, server-side
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, first_name, last_name') // Select fields to pre-fill
    .eq('id', user.id)
    .maybeSingle(); // Handles profile not existing yet

  if (profileError && profileError.code !== 'PGRST116') { // Ignore 'Row not found'
      console.error("Complete Profile Page: Error fetching profile", profileError);
      // Consider rendering an error message within the page
  }

  // If role is already set, redirect server-side
  if (profile?.role === 'employer') {
    return redirect('/employers-dashboard/dashboard?message=Profile already complete');
  } else if (profile?.role === 'candidate') {
    return redirect('/candidates-dashboard/dashboard?message=Profile already complete');
  }

  // Get potential error message from Server Action redirect
  const errorMessage = searchParams?.message

  // Render the form, using the Server Action
  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Complete Your Profile</h2>
      <p>Welcome! Please provide your details and select your role.</p>

      {errorMessage && (
        <p style={{ color: 'red', border: '1px solid red', padding: '10px', marginBottom: '15px' }}>
          {errorMessage}
        </p>
      )}

      {/* Use standard form with Server Action */}
      <form action={updateProfile}>
        {/* Email (Read Only) */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            id="email"
            name="email" // Good practice, even if not used by action
            defaultValue={user.email}
            readOnly
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#eee' }}
          />
        </div>

        {/* First Name (Required) */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="firstName" style={{ display: 'block', marginBottom: '5px' }}>First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            defaultValue={profile?.first_name || ''} // Pre-fill if exists
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Last Name (Required) */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="lastName" style={{ display: 'block', marginBottom: '5px' }}>Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            defaultValue={profile?.last_name || ''} // Pre-fill if exists
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Role Selection (Required) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Your Role</label>
          <div>
            <label style={{ marginRight: '20px' }}>
              <input type="radio" name="role" value="candidate" required /> Candidate (Job Seeker)
            </label>
            <label>
              <input type="radio" name="role" value="employer" required /> Employer
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{ padding: '10px 20px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Save Profile & Continue
        </button>
      </form>
    </div>
  )
}
