import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/v1/registrations/[id]/qr — Auth: QR code data for a registration
// Owner or admin. Returns JSON payload for client-side QR generation.
// ---------------------------------------------------------------------------

export async function GET(
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

    const { data: registration, error } = await supabase
      .from("registrations")
      .select(
        "id, member_id, attendee_adults, attendee_children, status, event:events!registrations_event_id_fkey(title, date), member:members!registrations_member_id_fkey(id, name)",
      )
      .eq("id", id)
      .single();

    if (error || !registration) {
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
        { error: { message: "Registration is cancelled", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 400 },
      );
    }

    const event = registration.event as unknown as Record<string, unknown> | null;
    const member = registration.member as unknown as Record<string, unknown> | null;

    return NextResponse.json({
      data: {
        registrationId: registration.id,
        memberName: member?.name ?? null,
        memberId: member?.id ?? null,
        eventName: event?.title ?? null,
        eventDate: event?.date ?? null,
        attendees: {
          adults: registration.attendee_adults,
          children: registration.attendee_children,
        },
      },
    });
  } catch (err) {
    console.error("GET /api/v1/registrations/[id]/qr error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
