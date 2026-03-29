import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/v1/events/[id] — Public: single event with registration count
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !event) {
      return NextResponse.json(
        { error: { message: "Event not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Count confirmed registrations
    const { count } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id)
      .eq("status", "confirmed");

    return NextResponse.json({
      data: { ...event, registrationCount: count ?? 0 },
    });
  } catch (err) {
    console.error("GET /api/v1/events/[id] error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/events/[id] — Admin: partial update
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
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

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Map camelCase body keys to snake_case DB columns
    const fieldMap: Record<string, string> = {
      title: "title",
      description: "description",
      category: "category",
      date: "date",
      startTime: "start_time",
      endTime: "end_time",
      venueName: "venue_name",
      venueAddress: "venue_address",
      venueLat: "venue_lat",
      venueLng: "venue_lng",
      capacity: "capacity",
      priceAdult: "price_adult",
      priceChild: "price_child",
      status: "status",
      schedule: "schedule",
      speakers: "speakers",
    };

    const updateData: Record<string, unknown> = {};
    for (const [key, col] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        updateData[col] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: { message: "No fields to update", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 400 },
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !event) {
      return NextResponse.json(
        { error: { message: "Event not found or update failed", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.memberId,
      action: "event.updated",
      entity_type: "event",
      entity_id: id,
      details: { updatedFields: Object.keys(updateData) },
    });

    return NextResponse.json({ data: event });
  } catch (err) {
    console.error("PATCH /api/v1/events/[id] error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/events/[id] — Admin: soft-delete (set status → cancelled)
// ---------------------------------------------------------------------------

export async function DELETE(
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

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !event) {
      return NextResponse.json(
        { error: { message: "Event not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.memberId,
      action: "event.cancelled",
      entity_type: "event",
      entity_id: id,
      details: { previousStatus: "published" },
    });

    return NextResponse.json({ data: event });
  } catch (err) {
    console.error("DELETE /api/v1/events/[id] error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
