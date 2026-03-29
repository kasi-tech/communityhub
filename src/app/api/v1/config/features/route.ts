import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "Unauthorized — super admin only" }, { status: 403 });
  }

  const body = await request.json();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, features")
    .eq("slug", "sts")
    .single();

  if (!tenant) {
    return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
  }

  const updatedFeatures = { ...(tenant.features as Record<string, unknown>), ...body };

  const { data, error } = await supabase
    .from("tenants")
    .update({ features: updatedFeatures })
    .eq("id", tenant.id)
    .select("features")
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Failed to update features", code: "UPDATE_ERROR" },
      { status: 500 },
    );
  }

  await supabase.from("audit_logs").insert({
    tenant_id: tenant.id,
    actor_id: user.id,
    action: "config.features.updated",
    entity_type: "tenant",
    entity_id: tenant.id,
    details: body,
  });

  return NextResponse.json({ features: data?.features });
}
