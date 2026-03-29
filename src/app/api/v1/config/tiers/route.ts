import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { DEFAULT_TIERS } from "@/config/tenant";

export async function GET() {
  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { data: tiers } = await supabase
    .from("membership_tiers")
    .select("*")
    .order("price", { ascending: true });

  if (!tiers || tiers.length === 0) {
    return NextResponse.json({ tiers: DEFAULT_TIERS });
  }

  return NextResponse.json({
    tiers: tiers.map((t) => ({
      id: t.id,
      tenantId: t.tenant_id,
      name: t.name,
      price: t.price,
      durationMonths: t.duration_months,
      isFamily: t.is_family,
      benefits: t.benefits,
      isLifetime: t.is_lifetime,
    })),
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "Unauthorized — super admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { id, name, price, benefits } = body as {
    id: string;
    name?: string;
    price?: number;
    benefits?: string[];
  };

  if (!id) {
    return NextResponse.json(
      { message: "Tier ID is required", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = price;
  if (benefits !== undefined) updates.benefits = benefits;

  const { data, error } = await supabase
    .from("membership_tiers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Failed to update tier", code: "UPDATE_ERROR" },
      { status: 500 },
    );
  }

  await supabase.from("audit_logs").insert({
    tenant_id: data.tenant_id,
    actor_id: user.id,
    action: "config.tier.updated",
    entity_type: "membership_tier",
    entity_id: id,
    details: updates,
  });

  return NextResponse.json({
    tier: {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      price: data.price,
      durationMonths: data.duration_months,
      isFamily: data.is_family,
      benefits: data.benefits,
      isLifetime: data.is_lifetime,
    },
  });
}
