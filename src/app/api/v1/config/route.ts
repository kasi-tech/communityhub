import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TENANT, DEFAULT_TIERS } from "@/config/tenant";

export async function GET() {
  const supabase = await createClient();

  // Try to load from database first
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", "sts")
    .single();

  if (tenant) {
    // Load tiers
    const { data: tiers } = await supabase
      .from("membership_tiers")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("price", { ascending: true });

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      branding: tenant.branding,
      features: tenant.features,
      onboardingSteps: tenant.onboarding_steps,
      tiers: (tiers ?? []).map((t) => ({
        id: t.id,
        tenantId: t.tenant_id,
        name: t.name,
        price: t.price,
        durationMonths: t.duration_months,
        isFamily: t.is_family,
        benefits: t.benefits,
        isLifetime: t.is_lifetime,
      })),
      createdAt: tenant.created_at,
    });
  }

  // Fallback to defaults
  return NextResponse.json({
    ...DEFAULT_TENANT,
    tiers: DEFAULT_TIERS,
  });
}
