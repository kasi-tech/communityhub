import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { OnboardingStep } from "@/types";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "Unauthorized — super admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { steps } = body as { steps: OnboardingStep[] };

  if (!Array.isArray(steps)) {
    return NextResponse.json(
      { message: "Steps array is required", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", "sts")
    .single();

  if (!tenant) {
    return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("tenants")
    .update({ onboarding_steps: steps })
    .eq("id", tenant.id)
    .select("onboarding_steps")
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Failed to update onboarding", code: "UPDATE_ERROR" },
      { status: 500 },
    );
  }

  await supabase.from("audit_logs").insert({
    tenant_id: tenant.id,
    actor_id: user.id,
    action: "config.onboarding.updated",
    entity_type: "tenant",
    entity_id: tenant.id,
    details: { stepCount: steps.length },
  });

  return NextResponse.json({ onboardingSteps: data?.onboarding_steps });
}
