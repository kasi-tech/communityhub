import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createElement } from "react";
import { sendEmail } from "@/lib/email";

function BulkEmail({ body }: { body: string }) {
  return createElement(
    "div",
    { style: { fontFamily: "Inter,sans-serif", maxWidth: 600, margin: "0 auto", padding: 24 } },
    createElement("div", { dangerouslySetInnerHTML: { __html: body.replace(/\n/g, "<br/>") } }),
    createElement("hr", { style: { border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" } }),
    createElement("p", { style: { color: "#9ca3af", fontSize: 12 } }, "You received this email because you are a member of our community."),
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const user = await getCurrentUser(supabase);
  const body = await request.json();
  const { recipients, subject, body: emailBody, channels } = body as {
    recipients: string;
    subject: string;
    body: string;
    channels: string;
  };

  if (!subject || !emailBody || !recipients) {
    return NextResponse.json(
      { message: "Subject, body, and recipients are required", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  // Fetch member emails based on segment
  let query = supabase.from("members").select("id, name, email, status");

  switch (recipients) {
    case "active":
      query = query.eq("status", "active");
      break;
    case "expired":
      query = query.eq("status", "expired");
      break;
    case "all":
      break;
    default:
      if (recipients.startsWith("event:")) {
        const eventId = recipients.replace("event:", "");
        const { data: registrations } = await supabase
          .from("registrations")
          .select("member_id")
          .eq("event_id", eventId)
          .eq("status", "confirmed");

        const memberIds = (registrations ?? []).map((r) => r.member_id);
        if (memberIds.length === 0) {
          return NextResponse.json({ sent: 0 });
        }
        query = query.in("id", memberIds);
      }
  }

  const { data: members } = await query;
  const memberList = members ?? [];

  if (memberList.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Send emails if channel includes email
  let sentCount = 0;
  if (channels === "email" || channels === "all") {
    // Batch emails in groups of 50
    const batchSize = 50;
    for (let i = 0; i < memberList.length; i += batchSize) {
      const batch = memberList.slice(i, i + batchSize);
      const emails = batch.map((m) => m.email).filter(Boolean);

      try {
        await sendEmail({
          to: emails,
          subject,
          react: createElement(BulkEmail, { body: emailBody }),
        });
        sentCount += emails.length;
      } catch {
        // Continue with next batch on failure
      }
    }
  }

  // Create audit log
  await supabase.from("audit_logs").insert({
    tenant_id: memberList[0]?.id ? "sts-default" : "sts-default",
    actor_id: user?.id ?? "system",
    action: "communication.sent",
    entity_type: "communication",
    entity_id: `bulk-${Date.now()}`,
    details: {
      recipients,
      subject,
      channels,
      sentCount,
      totalRecipients: memberList.length,
    },
  });

  return NextResponse.json({ sent: sentCount });
}
