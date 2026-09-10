// app/api/profile/candidate/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "../../../../lib/supabase-server";

export async function POST(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { resume_url, headline } = await request.json();
    const supabase = await createServerSupabaseClient();

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("candidate_profile")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 409 }
      );
    }

    // Create new candidate profile
    const { data, error } = await supabase
      .from("candidate_profile")
      .insert([
        {
          clerk_user_id: userId,
          resume_url,
          headline,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating candidate profile:", error);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data }, { status: 201 });
  } catch (error) {
    console.error("Error in candidate profile creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
