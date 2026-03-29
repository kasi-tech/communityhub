import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payments";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/payments/paynow/create — Generate PayNow QR code
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
    const { amount, currency, description, registrationId, applicationId, donationId } = body;

    // Validation
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: { message: "Amount must be a positive number", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!currency || typeof currency !== "string") {
      return NextResponse.json(
        { error: { message: "Currency is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: { message: "Description is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Generate PayNow QR via provider
    const provider = getPaymentProvider("paynow");
    const result = await provider.createOrder(amount, currency, description, {
      registrationId: registrationId ?? "",
      applicationId: applicationId ?? "",
      donationId: donationId ?? "",
    });

    // Create payment record in DB
    const { data: payment, error: dbError } = await supabase
      .from("payments")
      .insert({
        member_id: user.memberId,
        registration_id: registrationId ?? null,
        application_id: applicationId ?? null,
        donation_id: donationId ?? null,
        amount,
        currency,
        provider: "paynow",
        provider_ref: result.orderId,
        status: "pending",
        refund_amount: 0,
      })
      .select("id")
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: { message: dbError.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        qrCodeData: result.qrCodeData,
        paymentId: payment.id,
      },
    });
  } catch (err) {
    console.error("POST /api/v1/payments/paynow/create error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
