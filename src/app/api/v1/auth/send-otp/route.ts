import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_OTP_REQUESTS_PER_DAY = 5;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

/**
 * POST /api/v1/auth/send-otp
 * Send a 6-digit OTP to the given phone number.
 * Body: { phone, countryCode }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, countryCode } = body;

    if (!phone || !countryCode) {
      return NextResponse.json(
        { message: "phone and countryCode are required", code: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    const normalizedPhone = `${countryCode}${phone.replace(/\s+/g, "").replace(/^0+/, "")}`;
    const supabase = await createClient();

    // Rate limit: check recent OTP requests for this phone (max 5/day)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from("otp_requests")
      .select("*", { count: "exact", head: true })
      .eq("phone", normalizedPhone)
      .gte("created_at", oneDayAgo);

    if ((count ?? 0) >= MAX_OTP_REQUESTS_PER_DAY) {
      return NextResponse.json(
        {
          message: "Too many OTP requests. Please try again tomorrow.",
          code: "RATE_LIMIT",
        },
        { status: 429 },
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_SECONDS * 1000,
    ).toISOString();

    // Store the OTP request (best-effort — table may not exist yet in prototype)
    await supabase.from("otp_requests").insert({
      phone: normalizedPhone,
      code,
      expires_at: expiresAt,
    }).then(({ error }) => {
      if (error) {
        // Table might not exist in prototype — log and continue
        console.warn("Could not store OTP request:", error.message);
      }
    });

    // For prototype: log code to console instead of sending via Twilio
    console.log(`[OTP] Code for ${normalizedPhone}: ${code} (expires: ${expiresAt})`);

    // Production: send via Twilio
    // await twilioClient.verify.v2.services(VERIFY_SID).verifications.create({
    //   to: normalizedPhone,
    //   channel: "sms",
    // });

    return NextResponse.json({
      sent: true,
      expiresIn: OTP_EXPIRY_SECONDS,
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
