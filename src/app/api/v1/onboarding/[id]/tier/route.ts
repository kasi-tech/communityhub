import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TIERS } from "@/config/tenant";

/**
 * PATCH /api/v1/onboarding/[id]/tier
 * Select a membership tier for the application.
 * Body: { tierId }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tierId } = body;

    if (!tierId) {
      return NextResponse.json(
        { message: "tierId is required", code: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    // Validate tier exists (check DB first, fall back to config defaults)
    const supabase = await createClient();

    const { data: dbTier } = await supabase
      .from("membership_tiers")
      .select("*")
      .eq("id", tierId)
      .maybeSingle();

    const configTier = DEFAULT_TIERS.find((t) => t.id === tierId);
    const tier = dbTier ?? configTier;

    if (!tier) {
      return NextResponse.json(
        { message: "Invalid tier ID", code: "INVALID_TIER" },
        { status: 400 },
      );
    }

    // Fetch application
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

    // Update step_data with tier selection and advance step
    const existingStepData =
      (application.step_data as Record<string, unknown>) ?? {};
    const updatedStepData = {
      ...existingStepData,
      selectedTier: {
        id: tier.id,
        name: tier.name,
        price: tier.price,
        durationMonths: tier.duration_months ?? (configTier?.durationMonths ?? 0),
        isFamily: tier.is_family ?? (configTier?.isFamily ?? false),
        isLifetime: tier.is_lifetime ?? (configTier?.isLifetime ?? false),
      },
    };

    const nextStep = Math.max(application.current_step, 5);
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        step_data: updatedStepData,
        current_step: nextStep,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update tier:", updateError);
      return NextResponse.json(
        { message: "Failed to update application", code: "DB_ERROR" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      tier: {
        id: tier.id,
        name: tier.name,
        price: tier.price,
      },
      currentStep: nextStep,
    });
  } catch (err) {
    console.error("Tier update error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
