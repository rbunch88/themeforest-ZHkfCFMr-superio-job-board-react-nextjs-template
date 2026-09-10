'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function updateProfile(formData) {
  // 1. Get current user from Clerk
  const { userId } = auth()
  
  if (!userId) {
    console.error('Complete Profile Action: No authenticated user')
    return redirect('/?message=Authentication required')
  }
  
  const supabase = await createServerSupabaseClient()

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

  // 3. Create appropriate profile in DB based on role
  if (role === 'candidate') {
    // Create candidate profile
    const { error: candidateError } = await supabase
      .from('candidate_profile')
      .insert({
        clerk_user_id: userId,
        first_name: firstName,
        last_name: lastName,
        headline: formData.get('headline') || `${firstName} ${lastName}`,
      })

    if (candidateError) {
      console.error('Complete Profile Action: Error creating candidate profile', candidateError)
      return redirect(`/complete-profile?message=Error creating profile: ${candidateError.message}`)
    }
    
    console.log(`Complete Profile Action: Candidate profile created for user ${userId}`)
  } else if (role === 'employer') {
    // For employers, we need to create or get the company first
    const companyName = formData.get('companyName')
    const title = formData.get('title') || 'Recruiter'
    
    if (!companyName) {
      return redirect('/complete-profile?message=Company name is required for employers')
    }
    
    // Check if user is part of an organization in Clerk
    const { getToken } = auth()
    const token = await getToken()
    const tokenData = token ? JSON.parse(atob(token.split('.')[1])) : {}
    const orgId = tokenData?.org_id
    
    if (!orgId) {
      console.error('Complete Profile Action: No organization found for employer')
      return redirect('/complete-profile?message=Please create an organization first')
    }
    
    // Check if company exists for this org_id
    let { data: existingCompany } = await supabase
      .from('company')
      .select('id')
      .eq('org_id', orgId)
      .single()
    
    // If company doesn't exist, create it
    if (!existingCompany) {
      const { data: newCompany, error: companyError } = await supabase
        .from('company')
        .insert({
          name: companyName,
          org_id: orgId,
        })
        .select('id')
        .single()
      
      if (companyError) {
        console.error('Complete Profile Action: Error creating company', companyError)
        return redirect(`/complete-profile?message=Error creating company: ${companyError.message}`)
      }
      
      existingCompany = newCompany
    }
    
    // Create employer profile
    const { error: employerError } = await supabase
      .from('employer_profile')
      .insert({
        clerk_user_id: userId,
        company_id: existingCompany.id,
        first_name: firstName,
        last_name: lastName,
        title: title,
      })
    
    if (employerError) {
      console.error('Complete Profile Action: Error creating employer profile', employerError)
      return redirect(`/complete-profile?message=Error creating profile: ${employerError.message}`)
    }
    
    console.log(`Complete Profile Action: Employer profile created for user ${userId}`)
  }

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
