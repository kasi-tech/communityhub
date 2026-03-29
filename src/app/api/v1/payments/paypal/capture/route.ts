import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payments";
import { sendPaymentReceipt } from "@/lib/email";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/payments/paypal/capture — Capture a PayPal payment
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } satisfies ApiError },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { orderId, paymentId } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: { message: "orderId is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        { error: { message: "paymentId is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Verify payment record exists and belongs to user
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("member_id", user.memberId)
      .eq("status", "pending")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: { message: "Payment record not found or already processed", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Capture via PayPal
    const provider = getPaymentProvider("paypal");
    const captureResult = await provider.capturePayment(orderId);

    if (!captureResult.success) {
      // Update payment as failed
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", paymentId);

      return NextResponse.json(
        { error: { message: "PayPal capture failed", code: "PAYMENT_FAILED" } satisfies ApiError },
        { status: 400 },
      );
    }

    // Update payment record as completed
    await supabase
      .from("payments")
      .update({
        status: "completed",
        provider_ref: captureResult.transactionId,
      })
      .eq("id", paymentId);

    // Update linked registration/application status if applicable
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

    // Fetch member record to get member_number for receipt
    const { data: member } = await supabase
      .from("members")
      .select("member_number, name, email")
      .eq("id", user.memberId)
      .single();

    // Send payment receipt email
    try {
      await sendPaymentReceipt({
        to: member?.email ?? user.email,
        memberName: member?.name ?? user.name,
        itemName: `Payment ${paymentId}`,
        amount: captureResult.amount || payment.amount,
        currency: payment.currency,
        paymentMethod: "PayPal",
        transactionRef: captureResult.transactionId,
        date: new Date().toISOString(),
        items: [
          {
            description: `Payment (Member ID: ${member?.member_number ?? "N/A"})`,
            amount: captureResult.amount || payment.amount,
          },
        ],
      });
    } catch (emailErr) {
      // Log but don't fail the payment capture for email issues
      console.error("Failed to send payment receipt email:", emailErr);
    }

    return NextResponse.json({
      data: {
        success: true,
        transactionId: captureResult.transactionId,
        amount: captureResult.amount || payment.amount,
      },
    });
  } catch (err) {
    console.error("POST /api/v1/payments/paypal/capture error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
