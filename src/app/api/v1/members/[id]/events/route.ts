import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/members/:id/events — Member's registrations with event details
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
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

    const admin = await isAdmin(supabase);
    if (user.memberId !== id && !admin) {
      return NextResponse.json(
        { error: { message: "Access denied", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const { searchParams } = request.nextUrl;
    const filter = searchParams.get("status"); // "upcoming" | "past"
    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("registrations")
      .select(
        `
        id,
        status,
        total_amount,
        checked_in_at,
        created_at,
        events (
          id,
          title,
          date,
          start_time,
          end_time,
          venue_name,
          venue_address,
          category,
          cover_image_url
        )
      `,
      )
      .eq("member_id", id);

    if (filter === "upcoming") {
      query = query.not("status", "eq", "cancelled");
      // We filter on events.date >= today after fetching since Supabase
      // does not support filtering on joined columns in .select()
    }

    query = query.order("created_at", { ascending: false });

    const { data: registrations, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // Shape and filter results
    const items = (registrations ?? [])
      .map((r) => {
        const event = r.events as unknown as {
          id: string;
          title: string;
          date: string;
          start_time: string;
          end_time: string;
          venue_name: string;
          venue_address: string;
          category: string;
          cover_image_url: string | null;
        } | null;

        return {
          registrationId: r.id,
          status: r.status,
          totalAmount: r.total_amount,
          checkedInAt: r.checked_in_at,
          registeredAt: r.created_at,
          event: event
            ? {
                id: event.id,
                title: event.title,
                date: event.date,
                startTime: event.start_time,
                endTime: event.end_time,
                venueName: event.venue_name,
                venueAddress: event.venue_address,
                category: event.category,
                coverImageUrl: event.cover_image_url,
              }
            : null,
        };
      })
      .filter((item) => {
        if (!item.event) return false;
        if (filter === "upcoming") return item.event.date >= today!;
        if (filter === "past") return item.event.date < today!;
        return true;
      })
      .sort((a, b) => {
        const dateA = a.event?.date ?? "";
        const dateB = b.event?.date ?? "";
        if (filter === "upcoming") return dateA.localeCompare(dateB);
        return dateB.localeCompare(dateA);
      });

    return NextResponse.json({ data: items });
  } catch (err) {
    console.error("GET /api/v1/members/[id]/events error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
