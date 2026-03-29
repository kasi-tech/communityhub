import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { generateRecap } from "@/lib/ai";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/ai/recap — Admin: generate post-event recap
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { eventId } = body as { eventId?: string };

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: { message: "eventId is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: { message: "Event not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Fetch registration and attendance counts
    const [registrationResult, attendanceResult, photoResult] = await Promise.all([
      supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("status", "confirmed"),
      supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .not("checked_in_at", "is", null),
      supabase
        .from("event_images")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId),
    ]);

    const eventData = {
      title: event.title,
      description: event.description,
      date: event.date,
      venue: event.venue_name,
      category: event.category,
      registrationCount: registrationResult.count ?? 0,
      attendanceCount: attendanceResult.count ?? 0,
      speakers: event.speakers ?? [],
    };

    const photoCount = photoResult.count ?? 0;

    const recap = await generateRecap(eventData, photoCount);

    return NextResponse.json({
      data: { recap },
    });
  } catch (err) {
    console.error("POST /api/v1/ai/recap error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
