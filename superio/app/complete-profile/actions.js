'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(formData) {
  const supabase = createClient()

  // 1. Get current user session
  const { data: { user }, error: sessionError } = await supabase.auth.getUser()

  if (sessionError || !user) {
    console.error('Complete Profile Action: Error getting user session', sessionError)
    return redirect('/login?message=Could not get user session. Please log in again.')
  }

  // 2. Get form data
  const role = formData.get('role')
  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')

  // Basic validation
  if (!role || !firstName || !lastName) {
     // Re-render the form page with an error message? Or redirect?
     // For simplicity, redirecting back might be okay, but ideally, show error on form.
     // Let's try redirecting with a message for now.
     return redirect('/complete-profile?message=Missing required fields');
  }
  if (role !== 'employer' && role !== 'candidate') {
      return redirect('/complete-profile?message=Invalid role selected');
  }

  // 3. Update profile in DB
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: role,
      first_name: firstName,
      last_name: lastName,
      // Add any other fields needed here
    })
    .eq('id', user.id) // Match the logged-in user's ID

  if (updateError) {
    console.error('Complete Profile Action: Error updating profile', updateError)
    return redirect(`/complete-profile?message=Error updating profile: ${updateError.message}`)
  }

  console.log(`Complete Profile Action: Profile updated for user ${user.id} with role ${role}`)

  // 4. Redirect to the appropriate dashboard
  if (role === 'employer') {
    redirect('/employers-dashboard/dashboard')
  } else if (role === 'candidate') {
    redirect('/candidates-dashboard/dashboard')
  } else {
      // Should not happen due to validation, but as a fallback
      redirect('/')
  }
}
