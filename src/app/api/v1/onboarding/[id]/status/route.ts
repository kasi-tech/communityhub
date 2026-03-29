import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/v1/onboarding/[id]/status
 * Return the current status and step of an application.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: application, error } = await supabase
      .from("applications")
      .select(
        "id, status, current_step, phone_verified, email_verified, step_data, created_at, reviewed_at",
      )
      .eq("id", id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { message: "Application not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: application.id,
      status: application.status,
      currentStep: application.current_step,
      phoneVerified: application.phone_verified,
      emailVerified: application.email_verified,
      stepData: application.step_data,
      createdAt: application.created_at,
      reviewedAt: application.reviewed_at,
    });
  } catch (err) {
    console.error("Status fetch error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
