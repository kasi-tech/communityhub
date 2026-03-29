import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/v1/events/[id]/attendance — Admin: attendance summary + list
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    // Verify event exists
    const { data: event } = await supabase
      .from("events")
      .select("id, title")
      .eq("id", id)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: { message: "Event not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Fetch registrations with member info
    const { data: registrations, error } = await supabase
      .from("registrations")
      .select(
        "id, status, attendee_adults, attendee_children, checked_in_at, created_at, member_id",
      )
      .eq("event_id", id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    const regs = registrations ?? [];

    // Fetch member names for the registrations
    const memberIds = [...new Set(regs.map((r) => r.member_id))];
    const memberMap = new Map<string, string>();

    if (memberIds.length > 0) {
      const { data: members } = await supabase
        .from("members")
        .select("id, name")
        .in("id", memberIds);

      for (const m of members ?? []) {
        memberMap.set(m.id, m.name);
      }
    }

    const totalRegistered = regs.length;
    const checkedIn = regs.filter((r) => r.checked_in_at !== null).length;

    const registrationList = regs.map((r) => ({
      id: r.id,
      memberId: r.member_id,
      memberName: memberMap.get(r.member_id) ?? "Unknown",
      adults: r.attendee_adults,
      children: r.attendee_children,
      checkedInAt: r.checked_in_at,
      registeredAt: r.created_at,
    }));

    return NextResponse.json({
      data: {
        eventId: id,
        eventTitle: event.title,
        totalRegistered,
        checkedIn,
        registrations: registrationList,
      },
    });
  } catch (err) {
    console.error("GET /api/v1/events/[id]/attendance error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
