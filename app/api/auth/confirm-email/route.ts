import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();

    if (getUserError || !users) {
      return NextResponse.json(
        { error: "Failed to list users" },
        { status: 500 }
      );
    }

    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user to mark email as confirmed
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to confirm email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Email confirmed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error confirming email:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
