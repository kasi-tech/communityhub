import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/donations — Public: donor wall (show_on_wall = true)
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: donations, error } = await supabase
      .from("donations")
      .select("id, donor_name, amount, message, created_at")
      .eq("show_on_wall", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // Also fetch total donated this year
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const { data: totalData } = await supabase
      .from("donations")
      .select("amount")
      .gte("created_at", yearStart)
      .not("payment_id", "is", null);

    const totalThisYear = (totalData ?? []).reduce(
      (sum, d) => sum + (d.amount ?? 0),
      0,
    );

    return NextResponse.json({
      data: donations ?? [],
      totalThisYear,
    });
  } catch (err) {
    console.error("GET /api/v1/donations error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/v1/donations — Public: create a donation + initiate payment
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { donorName, donorEmail, amount, message, showOnWall, paymentMethod } = body;

    // Validation
    if (!donorName || typeof donorName !== "string" || donorName.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Donor name is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!donorEmail || typeof donorEmail !== "string" || !donorEmail.includes("@")) {
      return NextResponse.json(
        { error: { message: "A valid email is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (typeof amount !== "number" || amount < 1) {
      return NextResponse.json(
        { error: { message: "Amount must be at least $1", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!paymentMethod || !["paypal", "paynow"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: { message: "Invalid payment method. Use 'paypal' or 'paynow'.", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Create donation record
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        donor_name: donorName.trim(),
        donor_email: donorEmail.trim().toLowerCase(),
        amount,
        message: message?.trim() ?? "",
        show_on_wall: showOnWall !== false,
      })
      .select("id")
      .single();

    if (donationError || !donation) {
      return NextResponse.json(
        { error: { message: donationError?.message ?? "Failed to create donation", code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // Create payment record (status: pending)
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        amount,
        currency: "SGD",
        provider: paymentMethod,
        provider_ref: "",
        status: "pending",
        donation_id: donation.id,
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: { message: paymentError?.message ?? "Failed to create payment", code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // Link payment to donation
    await supabase
      .from("donations")
      .update({ payment_id: payment.id })
      .eq("id", donation.id);

    // Initiate payment with provider
    const provider = getPaymentProvider(paymentMethod);
    const order = await provider.createOrder(
      amount,
      "SGD",
      `Donation from ${donorName.trim()}`,
      { donationId: donation.id, paymentId: payment.id },
    );

    // Store provider order reference
    await supabase
      .from("payments")
      .update({ provider_ref: order.orderId })
      .eq("id", payment.id);

    return NextResponse.json(
      {
        donationId: donation.id,
        paymentId: payment.id,
        approvalUrl: order.approvalUrl ?? null,
        qrCodeData: order.qrCodeData ?? null,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/v1/donations error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
