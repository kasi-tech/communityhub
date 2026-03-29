import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createElement } from "react";
import { sendEmail } from "@/lib/email";

function RejectionEmail({ name, reason }: { name: string; reason: string }) {
  return createElement(
    "div",
    { style: { fontFamily: "Inter,sans-serif", maxWidth: 600, margin: "0 auto", padding: 24 } },
    createElement("h2", { style: { color: "#6366F1" } }, "Membership Application Update"),
    createElement("p", null, `Dear ${name},`),
    createElement("p", null, "After careful review, we are unable to approve your membership application at this time."),
    createElement("p", null, createElement("strong", null, "Reason: "), reason),
    createElement("p", null, "If you believe this was in error or have questions, please contact our community administrator."),
    createElement("p", { style: { color: "#6b7280", fontSize: 12, marginTop: 24 } }, "This is an automated message from CommunityHub."),
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const user = await getCurrentUser(supabase);
  const { id } = await params;

  const body = await request.json();
  const { reason, notes } = body as { reason: string; notes?: string };

  if (!reason) {
    return NextResponse.json(
      { message: "Rejection reason is required", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  // Fetch application
  const { data: application, error: fetchErr } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !application) {
    return NextResponse.json(
      { message: "Application not found", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  if (application.status === "rejected") {
    return NextResponse.json(
      { message: "Application already rejected", code: "ALREADY_REJECTED" },
      { status: 400 },
    );
  }

  // Update application
  const { data: updated, error: updateErr } = await supabase
    .from("applications")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json(
      { message: "Failed to reject application", code: "UPDATE_ERROR" },
      { status: 500 },
    );
  }

  const stepData = application.step_data as Record<string, unknown>;
  const name = (stepData.name as string) ?? application.email;

  // Send rejection email
  try {
    await sendEmail({
      to: application.email,
      subject: "Membership Application Update",
      react: createElement(RejectionEmail, { name, reason }),
    });
  } catch {
    // Email failure should not block rejection
  }

  // Create audit log
  await supabase.from("audit_logs").insert({
    tenant_id: application.tenant_id,
    actor_id: user?.id ?? "system",
    action: "application.rejected",
    entity_type: "application",
    entity_id: id,
    details: { reason, notes: notes ?? null },
  });

  return NextResponse.json({ application: updated });
}
