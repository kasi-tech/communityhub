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

  // Fetch current tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, branding")
    .eq("slug", "sts")
    .single();

  if (!tenant) {
    return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
  }

  const updatedBranding = { ...(tenant.branding as Record<string, unknown>), ...body };

  const { data, error } = await supabase
    .from("tenants")
    .update({ branding: updatedBranding })
    .eq("id", tenant.id)
    .select("branding")
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Failed to update branding", code: "UPDATE_ERROR" },
      { status: 500 },
    );
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    tenant_id: tenant.id,
    actor_id: user.id,
    action: "config.branding.updated",
    entity_type: "tenant",
    entity_id: tenant.id,
    details: body,
  });

  return NextResponse.json({ branding: data?.branding });
}
