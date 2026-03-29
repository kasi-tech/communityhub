import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TENANT } from "@/config/tenant";

/**
 * POST /api/v1/onboarding/start
 * Public endpoint — creates a new membership application.
 * Body: { phone, countryCode }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, countryCode } = body;

    if (!phone || !countryCode) {
      return NextResponse.json(
        { message: "phone and countryCode are required", code: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    // Normalize phone: strip spaces and leading zeros
    const normalizedPhone = `${countryCode}${phone.replace(/\s+/g, "").replace(/^0+/, "")}`;

    const supabase = await createClient();

    // Check for an existing in-progress application with this phone
    const { data: existing } = await supabase
      .from("applications")
      .select("id, current_step, status")
      .eq("phone", normalizedPhone)
      .eq("status", "in_progress")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        applicationId: existing.id,
        currentStep: existing.current_step,
        resumed: true,
      });
    }

    // Create a new application
    const { data: application, error } = await supabase
      .from("applications")
      .insert({
        tenant_id: DEFAULT_TENANT.id,
        phone: normalizedPhone,
        phone_verified: false,
        email: "",
        email_verified: false,
        current_step: 1,
        step_data: {},
        fraud_score: 0,
        fraud_factors: [],
        status: "in_progress",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create application:", error);
      return NextResponse.json(
        { message: "Failed to create application", code: "DB_ERROR" },
        { status: 500 },
      );
    }

    return NextResponse.json({ applicationId: application.id }, { status: 201 });
  } catch (err) {
    console.error("Onboarding start error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
