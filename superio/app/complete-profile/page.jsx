import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { updateProfile } from './actions' // Import the server action
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Make it an async Server Component
export default async function CompleteProfilePage({ searchParams }) {
  // Get user from Clerk
  const { userId } = auth()
  
  if (!userId) {
    // Middleware should handle this, but as a safeguard
    return redirect('/?message=You need to be logged in to complete your profile')
  }
  
  const supabase = await createServerSupabaseClient()

  // Check if profiles already exist
  const { data: employerProfile } = await supabase
    .from('employer_profile')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();
    
  const { data: candidateProfile } = await supabase
    .from('candidate_profile')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();
  
  // If profile already exists, redirect to appropriate dashboard
  if (employerProfile) {
    return redirect('/employers-dashboard/dashboard?message=Profile already complete');
  } else if (candidateProfile) {
    return redirect('/candidates-dashboard/dashboard?message=Profile already complete');
  }
  
  // Get user data from Clerk
  const { getToken, getUser } = auth();
  const user = await getUser();
  const token = await getToken();
  const tokenData = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const orgId = tokenData?.org_id;
  
  // Pre-select role if user is part of an organization
  const preSelectedRole = orgId ? 'employer' : searchParams?.role || '';

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
            name="email"
            defaultValue={user?.emailAddresses?.[0]?.emailAddress || ''}
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
            defaultValue={user?.firstName || ''}
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
            defaultValue={user?.lastName || ''}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        {/* Role Selection (Required) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Your Role</label>
          <div>
            <label style={{ marginRight: '20px' }}>
              <input 
                type="radio" 
                name="role" 
                value="candidate" 
                defaultChecked={preSelectedRole === 'candidate'} 
                disabled={preSelectedRole === 'employer'}
                required 
              /> 
              Candidate (Job Seeker)
            </label>
            <label>
              <input 
                type="radio" 
                name="role" 
                value="employer" 
                defaultChecked={preSelectedRole === 'employer'}
                disabled={preSelectedRole === 'employer'}
                required 
              /> 
              Employer
            </label>
          </div>
        </div>
        
        {/* Conditional fields based on role */}
        {preSelectedRole === 'employer' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="companyName" style={{ display: 'block', marginBottom: '5px' }}>Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Your Title</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="e.g. HR Manager, Recruiter"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}
        
        {preSelectedRole !== 'employer' && (
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="headline" style={{ display: 'block', marginBottom: '5px' }}>Professional Headline</label>
            <input
              type="text"
              id="headline"
              name="headline"
              placeholder="e.g. Senior Software Engineer, Marketing Specialist"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}

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
