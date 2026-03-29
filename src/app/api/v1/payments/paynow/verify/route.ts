import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { sendPaymentReceipt } from "@/lib/email";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/payments/paynow/verify — Admin verifies a PayNow payment
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth + admin check
    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } satisfies ApiError },
        { status: 401 },
      );
    }

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { paymentId, transactionRef } = body;

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        { error: { message: "paymentId is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!transactionRef || typeof transactionRef !== "string") {
      return NextResponse.json(
        { error: { message: "transactionRef is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Fetch payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("status", "pending")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: { message: "Pending payment record not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Update payment as completed
    await supabase
      .from("payments")
      .update({
        status: "completed",
        provider_ref: transactionRef,
      })
      .eq("id", paymentId);

    // Update linked registration/application status
    if (payment.registration_id) {
      await supabase
        .from("registrations")
        .update({ status: "confirmed" })
        .eq("id", payment.registration_id);
    }

    if (payment.application_id) {
      await supabase
        .from("applications")
        .update({ payment_id: paymentId })
        .eq("id", payment.application_id);
    }

    // Fetch member to get member_number and email for receipt
    const { data: member } = await supabase
      .from("members")
      .select("member_number, name, email")
      .eq("id", payment.member_id)
      .single();

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.memberId,
      action: "payment.paynow_verified",
      entity_type: "payment",
      entity_id: paymentId,
      details: { transactionRef, verifiedBy: user.memberId },
    });

    // Send payment receipt email
    try {
      if (member?.email) {
        await sendPaymentReceipt({
          to: member.email,
          memberName: member.name,
          itemName: `Payment ${paymentId}`,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: "PayNow",
          transactionRef,
          date: new Date().toISOString(),
          items: [
            {
              description: `Payment (Member ID: ${member.member_number ?? "N/A"})`,
              amount: payment.amount,
            },
          ],
        });
      }
    } catch (emailErr) {
      console.error("Failed to send payment receipt email:", emailErr);
    }

    return NextResponse.json({
      data: {
        success: true,
      },
    });
  } catch (err) {
    console.error("POST /api/v1/payments/paynow/verify error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
