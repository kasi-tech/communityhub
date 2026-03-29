import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/v1/onboarding/[id]/details
 * Save personal details for the application.
 * Body: { name, dob, gender, nationality, postalCode, residentialStatus, interests, familyMembers? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      dob,
      gender,
      nationality,
      postalCode,
      residentialStatus,
      interests,
      familyMembers,
    } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!dob) missing.push("dob");
    if (!gender) missing.push("gender");
    if (!nationality) missing.push("nationality");
    if (!postalCode) missing.push("postalCode");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          message: `Missing required fields: ${missing.join(", ")}`,
          code: "MISSING_FIELDS",
        },
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

    // Merge personal details into step_data
    const existingStepData =
      (application.step_data as Record<string, unknown>) ?? {};
    const updatedStepData = {
      ...existingStepData,
      personalDetails: {
        name,
        dob,
        gender,
        nationality,
        postalCode,
        residentialStatus: residentialStatus ?? "",
        interests: interests ?? [],
        familyMembers: familyMembers ?? [],
      },
    };

    const nextStep = Math.max(application.current_step, 4);
    const { data: updated, error: updateError } = await supabase
      .from("applications")
      .update({
        step_data: updatedStepData,
        current_step: nextStep,
      })
      .eq("id", id)
      .select("id, current_step, step_data, status")
      .single();

    if (updateError) {
      console.error("Failed to update application details:", updateError);
      return NextResponse.json(
        { message: "Failed to update application", code: "DB_ERROR" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: updated.id,
      currentStep: updated.current_step,
      stepData: updated.step_data,
      status: updated.status,
    });
  } catch (err) {
    console.error("Details update error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
