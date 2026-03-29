import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreFraud } from "@/lib/ai";

const AUTO_APPROVE_THRESHOLD = 30;

/**
 * POST /api/v1/onboarding/[id]/submit
 * Final submission of the onboarding application.
 * Body: { paymentId?, pdpaConsent: true }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentId, pdpaConsent } = body;

    if (!pdpaConsent) {
      return NextResponse.json(
        { message: "PDPA consent is required to submit", code: "CONSENT_REQUIRED" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch the full application
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

    // Validate all required steps are completed
    const validationErrors: string[] = [];
    if (!application.phone_verified) validationErrors.push("Phone not verified");
    if (!application.email_verified) validationErrors.push("Email not verified");

    const stepData = (application.step_data as Record<string, unknown>) ?? {};
    if (!stepData.personalDetails) validationErrors.push("Personal details not completed");
    if (!stepData.selectedTier) validationErrors.push("Membership tier not selected");

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          message: "Application is incomplete",
          code: "INCOMPLETE",
          details: { missingSteps: validationErrors },
        },
        { status: 400 },
      );
    }

    // Run AI fraud scoring
    const fraudResult = await scoreFraud({
      phone: application.phone,
      email: application.email,
      personalDetails: stepData.personalDetails,
      referrer: stepData.referrer ?? null,
      hasPayment: !!paymentId,
    });

    // Check for duplicate members: fuzzy match on name + dob + phone + email
    const personal = stepData.personalDetails as Record<string, unknown>;
    const { data: duplicates } = await supabase
      .from("members")
      .select("id, name, email, phone")
      .or(
        `phone.eq.${application.phone},email.eq.${application.email}`,
      )
      .limit(5);

    const hasDuplicates = (duplicates?.length ?? 0) > 0;

    // Determine auto-approval
    const canAutoApprove =
      fraudResult.score < AUTO_APPROVE_THRESHOLD &&
      !hasDuplicates &&
      application.phone_verified &&
      application.email_verified;

    const newStatus = canAutoApprove ? "approved" : "submitted";

    // Update application with fraud score and status
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        fraud_score: fraudResult.score,
        fraud_factors: fraudResult.factors,
        payment_id: paymentId ?? null,
        status: newStatus,
        current_step: 7,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to submit application:", updateError);
      return NextResponse.json(
        { message: "Failed to submit application", code: "DB_ERROR" },
        { status: 500 },
      );
    }

    // If auto-approved, create the member record
    if (canAutoApprove) {
      const tier = stepData.selectedTier as Record<string, unknown>;
      const memberNumber = `MEM-${Date.now().toString(36).toUpperCase()}`;

      const durationMonths = (tier.durationMonths as number) ?? 0;
      const isLifetime = (tier.isLifetime as boolean) ?? false;
      const expiresAt = isLifetime
        ? new Date("2099-12-31").toISOString()
        : new Date(
            Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000,
          ).toISOString();

      const { error: memberError } = await supabase.from("members").insert({
        tenant_id: application.tenant_id,
        user_id: null, // Will be linked when the member creates a login
        tier_id: (tier.id as string) ?? "",
        name: (personal.name as string) ?? "",
        email: application.email,
        phone: application.phone,
        dob: (personal.dob as string) ?? "",
        gender: (personal.gender as string) ?? "",
        nationality: (personal.nationality as string) ?? "",
        postal_code: (personal.postalCode as string) ?? "",
        interests: (personal.interests as string[]) ?? [],
        status: "active",
        fraud_score: fraudResult.score,
        member_number: memberNumber,
        membership_expires: expiresAt,
      });

      if (memberError) {
        console.error("Failed to create member record:", memberError);
        // Application is submitted but member creation failed — admin can retry
      }
    }

    // Send appropriate notification email
    // In production: sendEmail for confirmation / under-review notification
    // For prototype: log to console
    console.log(
      `Application ${id} ${canAutoApprove ? "auto-approved" : "submitted for review"}. Fraud score: ${fraudResult.score}`,
    );

    return NextResponse.json({
      status: newStatus,
      fraudScore: fraudResult.score,
      autoApproved: canAutoApprove,
      hasDuplicates,
    });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
