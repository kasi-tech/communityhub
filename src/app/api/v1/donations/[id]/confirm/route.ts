import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";
import { sendPaymentReceipt } from "@/lib/email";
import type { ApiError, PaymentProvider as PaymentProviderType } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/donations/[id]/confirm — Confirm donation payment
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: donationId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { paymentId, orderId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: { message: "paymentId is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Fetch the donation
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .select("*")
      .eq("id", donationId)
      .single();

    if (donationError || !donation) {
      return NextResponse.json(
        { error: { message: "Donation not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Fetch the payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: { message: "Payment not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    if (payment.status === "completed") {
      return NextResponse.json(
        { error: { message: "Payment already confirmed", code: "CONFLICT" } satisfies ApiError },
        { status: 409 },
      );
    }

    // Capture payment via provider
    const provider = getPaymentProvider(payment.provider as PaymentProviderType);
    const captureRef = orderId ?? payment.provider_ref;
    const result = await provider.capturePayment(captureRef);

    if (!result.success) {
      // Update payment status to failed
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", paymentId);

      return NextResponse.json(
        { error: { message: "Payment capture failed", code: "PAYMENT_FAILED" } satisfies ApiError },
        { status: 402 },
      );
    }

    // Update payment status to completed
    await supabase
      .from("payments")
      .update({
        status: "completed",
        provider_ref: result.transactionId,
      })
      .eq("id", paymentId);

    // Send thank-you receipt email
    try {
      await sendPaymentReceipt({
        to: donation.donor_email,
        memberName: donation.donor_name,
        itemName: "Community Donation",
        amount: donation.amount,
        currency: "SGD",
        paymentMethod: payment.provider,
        transactionRef: result.transactionId,
        date: new Date().toISOString(),
        items: [
          { description: "Donation", amount: donation.amount },
        ],
      });
    } catch (emailErr) {
      // Log but do not fail the confirmation
      console.error("Failed to send donation receipt email:", emailErr);
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      actor_id: donation.donor_email,
      action: "donation.confirmed",
      entity_type: "donation",
      entity_id: donationId,
      details: {
        amount: donation.amount,
        provider: payment.provider,
        transactionId: result.transactionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/v1/donations/[id]/confirm error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
