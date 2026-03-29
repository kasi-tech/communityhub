import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/v1/onboarding/[id]/verify-otp
 * Verify the phone OTP code for an application.
 * Body: { code }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { message: "code is required", code: "MISSING_FIELDS" },
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

    // Prototype: accept '123456' as valid OTP
    // Production: verify via Twilio Verify API
    const isValid = code === "123456";

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid OTP code", code: "INVALID_OTP", verified: false },
        { status: 400 },
      );
    }

    // Update application: mark phone as verified and advance step
    const nextStep = Math.max(application.current_step, 2);
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        phone_verified: true,
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
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
