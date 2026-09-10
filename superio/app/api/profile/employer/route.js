// app/api/profile/employer/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "../../../../lib/supabase-server";

export async function POST(request) {
  try {
    const { userId, getToken } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, phone, company_name } = await request.json();
    const supabase = await createServerSupabaseClient();
    
    // Get organization ID from Clerk JWT
    const token = await getToken();
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const orgId = tokenData?.org_id;

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found. Please create or join an organization first." },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("employer_profile")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 409 }
      );
    }

    // Check if company exists for this org_id
    let { data: existingCompany } = await supabase
      .from("company")
      .select("*")
      .eq("org_id", orgId)
      .single();

    // If company doesn't exist, create it
    if (!existingCompany) {
      const { data: newCompany, error: companyError } = await supabase
        .from("company")
        .insert([
          {
            name: company_name,
            org_id: orgId,
          },
        ])
        .select()
        .single();

      if (companyError) {
        console.error("Error creating company:", companyError);
        return NextResponse.json(
          { error: "Failed to create company" },
          { status: 500 }
        );
      }

      existingCompany = newCompany;
    }

    // Create employer profile
    const { data, error } = await supabase
      .from("employer_profile")
      .insert([
        {
          clerk_user_id: userId,
          company_id: existingCompany.id,
          title,
          phone,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating employer profile:", error);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      profile: data,
      company: existingCompany
    }, { status: 201 });
  } catch (error) {
    console.error("Error in employer profile creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
