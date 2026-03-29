import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { ApiError, PaginatedResponse } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/v1/events/[id]/registrations — Admin: list registrations for event
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id: eventId } = await context.params;
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1),
      100,
    );

    // Verify event exists
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: { message: "Event not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Build query — join registrations with members
    let query = supabase
      .from("registrations")
      .select(
        "*, member:members!registrations_member_id_fkey(name, email)",
        { count: "exact" },
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      // Search by member name or email through the joined table isn't directly
      // supported in PostgREST filters — we'll filter client-side for simplicity
      // or use an RPC. For now, filter on registration id or member fields via
      // a sub-select approach. A pragmatic approach: search on the registration table's
      // own fields or accept this limitation.
      // We'll use an approach that filters on the joined member name/email.
      query = query.or(
        `member.name.ilike.%${search}%,member.email.ilike.%${search}%`,
      );
    }

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    query = query.limit(limit + 1);

    const { data: registrations, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    const hasMore = (registrations?.length ?? 0) > limit;
    const items = (registrations ?? []).slice(0, limit);
    const nextCursor = hasMore
      ? items[items.length - 1]?.created_at ?? null
      : null;

    const response: PaginatedResponse<(typeof items)[number]> = {
      data: items,
      cursor: nextCursor,
      hasMore,
      total: count ?? 0,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/v1/events/[id]/registrations error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
