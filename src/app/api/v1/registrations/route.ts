import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import type { ApiError } from "@/types";
import { createElement } from "react";

// ---------------------------------------------------------------------------
// POST /api/v1/registrations — Authenticated member: create a registration
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

    // Validate required fields
    if (!body.eventId) {
      return NextResponse.json(
        { error: { message: "eventId is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    const attendeeAdults = body.attendeeAdults ?? 1;
    const attendeeChildren = body.attendeeChildren ?? 0;

    if (
      typeof attendeeAdults !== "number" ||
      attendeeAdults < 1 ||
      typeof attendeeChildren !== "number" ||
      attendeeChildren < 0
    ) {
      return NextResponse.json(
        {
          error: {
            message: "attendeeAdults must be >= 1, attendeeChildren must be >= 0",
            code: "VALIDATION_ERROR",
          } satisfies ApiError,
        },
        { status: 422 },
      );
    }

    // (a) Verify event exists and is published
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", body.eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: { message: "Event not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    if (event.status !== "published") {
      return NextResponse.json(
        { error: { message: "Event is not open for registration", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 400 },
      );
    }

    // Check for duplicate registration
    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", body.eventId)
      .eq("member_id", user.memberId)
      .neq("status", "cancelled")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: { message: "You are already registered for this event", code: "DUPLICATE" } satisfies ApiError },
        { status: 400 },
      );
    }

    // (b) Check capacity
    const { count: confirmedCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", body.eventId)
      .eq("status", "confirmed");

    const totalAttendees = attendeeAdults + attendeeChildren;
    const spotsUsed = confirmedCount ?? 0;
    const spotsAvailable = event.capacity - spotsUsed;

    // (e) Calculate total amount
    const totalAmount =
      attendeeAdults * (event.price_adult ?? 0) +
      attendeeChildren * (event.price_child ?? 0);

    let registrationStatus: string;
    let waitlistPosition: number | null = null;

    if (spotsAvailable >= totalAttendees) {
      // (d) Spots available
      if (totalAmount > 0) {
        // (f) Paid event — pending payment
        registrationStatus = "confirmed"; // confirmed but payment is tracked separately
      } else {
        // (g) Free event — confirm immediately
        registrationStatus = "confirmed";
      }
    } else {
      // (c) Full — waitlist
      registrationStatus = "waitlisted";

      // Determine waitlist position
      const { count: waitlistCount } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", body.eventId)
        .eq("status", "waitlisted");

      waitlistPosition = (waitlistCount ?? 0) + 1;
    }

    // Insert registration
    const { data: registration, error: insertError } = await supabase
      .from("registrations")
      .insert({
        event_id: body.eventId,
        member_id: user.memberId,
        status: registrationStatus,
        attendee_adults: attendeeAdults,
        attendee_children: attendeeChildren,
        dietary_preference: body.dietaryPreference ?? null,
        special_requirements: body.specialRequirements ?? null,
        total_amount: totalAmount,
        waitlist_position: waitlistPosition,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: { message: insertError.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // (h) Send confirmation email (fire-and-forget, don't fail the request)
    try {
      const subject =
        registrationStatus === "confirmed"
          ? `Registration Confirmed — ${event.title}`
          : `You're on the Waitlist — ${event.title}`;

      const bodyText =
        registrationStatus === "confirmed"
          ? `Hi ${user.name}, your registration for "${event.title}" on ${event.date} has been confirmed. Attendees: ${attendeeAdults} adult(s), ${attendeeChildren} child(ren).${totalAmount > 0 ? ` Total: $${totalAmount.toFixed(2)}.` : ""}`
          : `Hi ${user.name}, the event "${event.title}" is currently full. You have been added to the waitlist at position #${waitlistPosition}. We will notify you if a spot opens up.`;

      await sendEmail({
        to: user.email,
        subject,
        react: createElement("div", null, bodyText),
      });
    } catch (emailErr) {
      console.error("Registration confirmation email failed:", emailErr);
    }

    const responseData: Record<string, unknown> = {
      ...registration,
      pendingPayment: totalAmount > 0 && registrationStatus === "confirmed",
    };

    return NextResponse.json({ data: responseData }, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/registrations error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
