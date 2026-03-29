import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/v1/onboarding/[id]/referral
 * Look up a referrer by phone number or member number.
 * Body: { referrerIdentifier }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { referrerIdentifier } = body;

    if (!referrerIdentifier) {
      return NextResponse.json(
        { message: "referrerIdentifier is required", code: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch the application to confirm it exists and is in progress
    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select("id, current_step, step_data, status")
      .eq("id", id)
      .eq("status", "in_progress")
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { message: "Application not found or not in progress", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Look up referrer: try by member_number first, then by phone
    const identifier = referrerIdentifier.trim();

    let referrer = null;

    // Try member_number match
    const { data: byNumber } = await supabase
      .from("members")
      .select("id, name, member_number, status, created_at")
      .eq("member_number", identifier)
      .eq("status", "active")
      .maybeSingle();

    if (byNumber) {
      referrer = byNumber;
    } else {
      // Try phone match (search with and without country code)
      const { data: byPhone } = await supabase
        .from("members")
        .select("id, name, member_number, status, created_at")
        .eq("phone", identifier)
        .eq("status", "active")
        .maybeSingle();

      referrer = byPhone;
    }

    if (!referrer) {
      return NextResponse.json(
        { message: "Referrer not found. Please check the phone number or member ID.", code: "REFERRER_NOT_FOUND" },
        { status: 404 },
      );
    }

    // Update application with referrer info and advance step
    const existingStepData =
      (application.step_data as Record<string, unknown>) ?? {};
    const updatedStepData = {
      ...existingStepData,
      referrer: {
        memberId: referrer.id,
        name: referrer.name,
        memberNumber: referrer.member_number,
      },
    };

    const nextStep = Math.max(application.current_step, 6);
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        referrer_member_id: referrer.id,
        step_data: updatedStepData,
        current_step: nextStep,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update referral:", updateError);
      return NextResponse.json(
        { message: "Failed to update application", code: "DB_ERROR" },
        { status: 500 },
      );
    }

    // In production: send notification to referrer for confirmation
    // await sendEmail({ to: referrer.email, subject: "Referral Confirmation", ... })

    return NextResponse.json({
      referrer: {
        name: referrer.name,
        memberNumber: referrer.member_number,
        memberSince: referrer.created_at,
      },
      currentStep: nextStep,
    });
  } catch (err) {
    console.error("Referral lookup error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
