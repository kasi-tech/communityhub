import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { Event, PaginatedResponse, ApiError } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/events — Public: list events with filtering, search & cursor
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = request.nextUrl;

    const category = searchParams.get("category");
    const status = searchParams.get("status") ?? "published";
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const priceType = searchParams.get("priceType"); // 'free' | 'paid'
    const sort = searchParams.get("sort") ?? "-date";
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1),
      100,
    );

    // Build query
    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .eq("status", status);

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    if (dateFrom) {
      query = query.gte("date", dateFrom);
    }

    if (dateTo) {
      query = query.lte("date", dateTo);
    }

    if (priceType === "free") {
      query = query.eq("price_adult", 0).eq("price_child", 0);
    } else if (priceType === "paid") {
      query = query.gt("price_adult", 0);
    }

    // Sorting
    const descending = sort.startsWith("-");
    const sortField = descending ? sort.slice(1) : sort;
    const columnMap: Record<string, string> = {
      date: "date",
      title: "title",
      createdAt: "created_at",
      capacity: "capacity",
    };
    const column = columnMap[sortField] ?? "date";
    query = query.order(column, { ascending: !descending });

    // Cursor-based pagination
    if (cursor) {
      // cursor is the `id` of the last item from the previous page
      // We use range-based pagination as a simple approach
      const { data: cursorRow } = await supabase
        .from("events")
        .select("date, id")
        .eq("id", cursor)
        .single();

      if (cursorRow) {
        if (descending) {
          query = query.or(
            `date.lt.${cursorRow.date},and(date.eq.${cursorRow.date},id.gt.${cursorRow.id})`,
          );
        } else {
          query = query.or(
            `date.gt.${cursorRow.date},and(date.eq.${cursorRow.date},id.gt.${cursorRow.id})`,
          );
        }
      }
    }

    query = query.limit(limit + 1); // fetch one extra to determine hasMore

    const { data: events, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    const hasMore = (events?.length ?? 0) > limit;
    const items = (events ?? []).slice(0, limit) as Event[];
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    const response: PaginatedResponse<Event> = {
      data: items,
      cursor: nextCursor,
      hasMore,
      total: count ?? 0,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/v1/events error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/v1/events — Admin: create a new event
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth & admin check
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

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "category",
      "date",
      "startTime",
      "endTime",
      "venueName",
      "venueAddress",
      "capacity",
    ];
    const missing = requiredFields.filter(
      (f) => body[f] === undefined || body[f] === null || body[f] === "",
    );
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: {
            message: `Missing required fields: ${missing.join(", ")}`,
            code: "VALIDATION_ERROR",
          } satisfies ApiError,
        },
        { status: 422 },
      );
    }

    if (typeof body.capacity !== "number" || body.capacity < 1) {
      return NextResponse.json(
        { error: { message: "Capacity must be a positive number", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    const eventData = {
      title: body.title,
      description: body.description,
      category: body.category,
      date: body.date,
      start_time: body.startTime,
      end_time: body.endTime,
      venue_name: body.venueName,
      venue_address: body.venueAddress,
      venue_lat: body.venueLat ?? null,
      venue_lng: body.venueLng ?? null,
      capacity: body.capacity,
      price_adult: body.priceAdult ?? 0,
      price_child: body.priceChild ?? 0,
      status: body.status === "draft" ? "draft" : "published",
      schedule: body.schedule ?? null,
      speakers: body.speakers ?? [],
      created_by: user.memberId,
    };

    const { data: event, error } = await supabase
      .from("events")
      .insert(eventData)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.memberId,
      action: "event.created",
      entity_type: "event",
      entity_id: event.id,
      details: { title: event.title },
    });

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/events error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
