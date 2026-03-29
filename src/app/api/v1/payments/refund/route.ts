import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payments";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/payments/refund — Admin processes a refund
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
    const { paymentId, amount, reason } = body;

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        { error: { message: "paymentId is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: { message: "Amount must be a positive number", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Fetch payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("status", "completed")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: { message: "Completed payment record not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Validate refund amount
    const remainingRefundable = payment.amount - (payment.refund_amount ?? 0);
    if (amount > remainingRefundable) {
      return NextResponse.json(
        {
          error: {
            message: `Refund amount exceeds refundable balance (${remainingRefundable.toFixed(2)})`,
            code: "VALIDATION_ERROR",
          } satisfies ApiError,
        },
        { status: 422 },
      );
    }

    // Process refund via the original provider
    const provider = getPaymentProvider(payment.provider);
    const refundResult = await provider.refund(payment.provider_ref, amount);

    if (!refundResult.success) {
      return NextResponse.json(
        { error: { message: "Refund processing failed", code: "REFUND_FAILED" } satisfies ApiError },
        { status: 400 },
      );
    }

    // Update payment record
    const newRefundAmount = (payment.refund_amount ?? 0) + amount;
    const newStatus = newRefundAmount >= payment.amount ? "refunded" : "completed";

    await supabase
      .from("payments")
      .update({
        refund_amount: newRefundAmount,
        status: newStatus,
      })
      .eq("id", paymentId);

    // Create audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.memberId,
      action: "payment.refunded",
      entity_type: "payment",
      entity_id: paymentId,
      details: {
        refundId: refundResult.refundId,
        amount,
        reason: reason ?? null,
        provider: payment.provider,
        processedBy: user.memberId,
      },
    });

    return NextResponse.json({
      data: {
        success: true,
        refundId: refundResult.refundId,
        amount: refundResult.amount,
      },
    });
  } catch (err) {
    console.error("POST /api/v1/payments/refund error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
