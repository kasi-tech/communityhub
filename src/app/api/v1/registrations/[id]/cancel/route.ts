import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import type { ApiError } from "@/types";
import { createElement } from "react";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// PATCH /api/v1/registrations/[id]/cancel — Cancel a registration
// Owner or admin. Promotes waitlisted member if applicable.
// ---------------------------------------------------------------------------

export async function PATCH(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } satisfies ApiError },
        { status: 401 },
      );
    }

    // Fetch registration
    const { data: registration, error: fetchErr } = await supabase
      .from("registrations")
      .select("*, event:events!registrations_event_id_fkey(*)")
      .eq("id", id)
      .single();

    if (fetchErr || !registration) {
      return NextResponse.json(
        { error: { message: "Registration not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Ownership or admin check
    const admin = await isAdmin(supabase);
    if (!admin && registration.member_id !== user.memberId) {
      return NextResponse.json(
        { error: { message: "Access denied", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    if (registration.status === "cancelled") {
      return NextResponse.json(
        { error: { message: "Registration is already cancelled", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 400 },
      );
    }

    // Calculate refund based on days until event
    let refundPercentage = 0;
    let refundAmount = 0;
    if (registration.total_amount > 0 && registration.event) {
      const eventDate = new Date(registration.event.date);
      const now = new Date();
      const daysUntilEvent = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilEvent > 7) {
        refundPercentage = 100;
      } else if (daysUntilEvent >= 3) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }

      refundAmount = (registration.total_amount * refundPercentage) / 100;
    }

    // Cancel the registration
    const { data: updated, error: updateErr } = await supabase
      .from("registrations")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: { message: updateErr.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // Promote first waitlisted registration if the cancelled one was confirmed
    let promotedRegistration = null;
    if (registration.status === "confirmed") {
      const { data: nextInLine } = await supabase
        .from("registrations")
        .select("*, member:members!registrations_member_id_fkey(name, email)")
        .eq("event_id", registration.event_id)
        .eq("status", "waitlisted")
        .order("waitlist_position", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextInLine) {
        const { data: promoted } = await supabase
          .from("registrations")
          .update({ status: "confirmed", waitlist_position: null })
          .eq("id", nextInLine.id)
          .select("*")
          .single();

        promotedRegistration = promoted;

        // Notify promoted member (fire-and-forget)
        try {
          const memberEmail = nextInLine.member?.email;
          const memberName = nextInLine.member?.name ?? "Member";
          if (memberEmail) {
            await sendEmail({
              to: memberEmail,
              subject: `Spot Available — ${registration.event?.title ?? "Event"}`,
              react: createElement(
                "div",
                null,
                `Hi ${memberName}, a spot has opened up for "${registration.event?.title ?? "the event"}". Your registration has been confirmed!`,
              ),
            });
          }
        } catch (emailErr) {
          console.error("Waitlist promotion email failed:", emailErr);
        }
      }
    }

    return NextResponse.json({
      data: {
        ...updated,
        refund: {
          percentage: refundPercentage,
          amount: refundAmount,
          eligible: refundAmount > 0,
        },
        promotedRegistration: promotedRegistration?.id ?? null,
      },
    });
  } catch (err) {
    console.error("PATCH /api/v1/registrations/[id]/cancel error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
