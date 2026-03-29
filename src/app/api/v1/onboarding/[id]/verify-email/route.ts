import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/v1/onboarding/[id]/verify-email
 * Verify the email verification code for an application.
 * Body: { email, code }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { message: "email and code are required", code: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format", code: "INVALID_EMAIL" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch the application
    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .eq("status", "in_progress")
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { message: "Application not found or not in progress", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Prototype: accept '123456' as valid code
    // Production: verify via email verification service
    const isValid = code === "123456";

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid verification code", code: "INVALID_CODE", verified: false },
        { status: 400 },
      );
    }

    // Update application: set email, mark verified, advance step
    const nextStep = Math.max(application.current_step, 3);
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        email,
        email_verified: true,
        current_step: nextStep,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update application:", updateError);
      return NextResponse.json(
        { message: "Failed to update application", code: "DB_ERROR" },
        { status: 500 },
      );
    }

    return NextResponse.json({ verified: true, currentStep: nextStep });
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
