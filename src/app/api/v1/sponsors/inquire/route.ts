import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import type { ApiError } from "@/types";
import { createElement } from "react";

const VALID_PACKAGES = ["bronze", "silver", "gold", "custom"] as const;

// ---------------------------------------------------------------------------
// POST /api/v1/sponsors/inquire — Public: submit sponsorship inquiry
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { companyName, contactPerson, email, phone, package: pkg, message } = body;

    // Validation
    if (!companyName || typeof companyName !== "string" || companyName.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Company name is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!contactPerson || typeof contactPerson !== "string" || contactPerson.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Contact person is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: { message: "A valid email is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Phone number is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!pkg || !VALID_PACKAGES.includes(pkg)) {
      return NextResponse.json(
        { error: { message: "Invalid package. Choose bronze, silver, gold, or custom.", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Store as audit_log entry (no sponsors table)
    const { error: auditError } = await supabase.from("audit_logs").insert({
      actor_id: email.trim().toLowerCase(),
      action: "sponsor_inquiry.submitted",
      entity_type: "sponsor_inquiry",
      entity_id: crypto.randomUUID(),
      details: {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        package: pkg,
        message: message?.trim() ?? "",
      },
    });

    if (auditError) {
      console.error("Failed to store sponsor inquiry audit log:", auditError);
      return NextResponse.json(
        { error: { message: "Failed to submit inquiry", code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? "admin@communityhub.app";
    try {
      await sendEmail({
        to: adminEmail,
        subject: `New Sponsorship Inquiry from ${companyName.trim()}`,
        react: createElement("div", null,
          createElement("h2", { style: { color: "#6366F1" } }, "New Sponsorship Inquiry"),
          createElement("table", { style: { borderCollapse: "collapse" as const, width: "100%" } },
            createElement("tbody", null,
              createElement("tr", null,
                createElement("td", { style: { padding: "8px 0", color: "#6b7280" } }, "Company"),
                createElement("td", { style: { padding: "8px 0" } }, companyName.trim()),
              ),
              createElement("tr", null,
                createElement("td", { style: { padding: "8px 0", color: "#6b7280" } }, "Contact"),
                createElement("td", { style: { padding: "8px 0" } }, contactPerson.trim()),
              ),
              createElement("tr", null,
                createElement("td", { style: { padding: "8px 0", color: "#6b7280" } }, "Email"),
                createElement("td", { style: { padding: "8px 0" } }, email.trim()),
              ),
              createElement("tr", null,
                createElement("td", { style: { padding: "8px 0", color: "#6b7280" } }, "Phone"),
                createElement("td", { style: { padding: "8px 0" } }, phone.trim()),
              ),
              createElement("tr", null,
                createElement("td", { style: { padding: "8px 0", color: "#6b7280" } }, "Package"),
                createElement("td", { style: { padding: "8px 0", textTransform: "capitalize" as const } }, pkg),
              ),
              message
                ? createElement("tr", null,
                    createElement("td", { style: { padding: "8px 0", color: "#6b7280" } }, "Message"),
                    createElement("td", { style: { padding: "8px 0" } }, message.trim()),
                  )
                : null,
            ),
          ),
        ),
      });
    } catch (emailErr) {
      console.error("Failed to send sponsor inquiry notification:", emailErr);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/sponsors/inquire error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
