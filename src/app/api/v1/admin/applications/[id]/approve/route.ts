import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createElement } from "react";
import { sendEmail } from "@/lib/email";

function WelcomeEmail({ name, memberNumber }: { name: string; memberNumber: string }) {
  return createElement(
    "div",
    { style: { fontFamily: "Inter,sans-serif", maxWidth: 600, margin: "0 auto", padding: 24 } },
    createElement("h2", { style: { color: "#6366F1" } }, "Welcome to the Community!"),
    createElement("p", null, `Dear ${name},`),
    createElement("p", null, "Your membership application has been approved. Welcome aboard!"),
    createElement("p", null, `Your member number is: `, createElement("strong", null, memberNumber)),
    createElement("p", { style: { color: "#6b7280", fontSize: 12, marginTop: 24 } }, "If you have questions, please contact your community administrator."),
  );
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const user = await getCurrentUser(supabase);
  const { id } = await params;

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

  if (application.status === "approved") {
    return NextResponse.json(
      { message: "Application already approved", code: "ALREADY_APPROVED" },
      { status: 400 },
    );
  }

  // Generate sequential member number
  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true });

  const seq = (count ?? 0) + 1;
  const memberNumber = `MEM-${String(seq).padStart(5, "0")}`;

  const stepData = application.step_data as Record<string, unknown>;
  const name = (stepData.name as string) ?? application.email;

  // Create member record
  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({
      tenant_id: application.tenant_id,
      user_id: (stepData.user_id as string) ?? null,
      tier_id: (stepData.tier_id as string) ?? null,
      name,
      email: application.email,
      phone: application.phone,
      dob: (stepData.dob as string) ?? null,
      gender: (stepData.gender as string) ?? null,
      nationality: (stepData.nationality as string) ?? null,
      postal_code: (stepData.postal_code as string) ?? null,
      interests: (stepData.interests as string[]) ?? [],
      status: "active",
      fraud_score: application.fraud_score,
      member_number: memberNumber,
      role: "member",
    })
    .select()
    .single();

  if (memberErr) {
    return NextResponse.json(
      { message: "Failed to create member", code: "CREATE_ERROR", details: { error: memberErr.message } },
      { status: 500 },
    );
  }

  // Update application status
  await supabase
    .from("applications")
    .update({
      status: "approved",
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  // Send welcome email
  try {
    await sendEmail({
      to: application.email,
      subject: "Your Membership Has Been Approved!",
      react: createElement(WelcomeEmail, { name, memberNumber }),
    });
  } catch {
    // Email failure should not block approval
  }

  // Create audit log
  await supabase.from("audit_logs").insert({
    tenant_id: application.tenant_id,
    actor_id: user?.id ?? "system",
    action: "application.approved",
    entity_type: "application",
    entity_id: id,
    details: { memberNumber, memberId: member.id },
  });

  return NextResponse.json({ member });
}
