import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/members/:id/payments — Member's payment history
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
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1),
      100,
    );

    // Fetch payments with related event/tier names for description
    let query = supabase
      .from("payments")
      .select(
        `
        id,
        amount,
        currency,
        provider,
        provider_ref,
        status,
        refund_amount,
        created_at,
        registration_id,
        application_id,
        registrations (
          events (title)
        )
      `,
        { count: "exact" },
      )
      .eq("member_id", id)
      .order("created_at", { ascending: false });

    if (cursor) {
      const { data: cursorRow } = await supabase
        .from("payments")
        .select("created_at, id")
        .eq("id", cursor)
        .single();

      if (cursorRow) {
        query = query.or(
          `created_at.lt.${cursorRow.created_at},and(created_at.eq.${cursorRow.created_at},id.gt.${cursorRow.id})`,
        );
      }
    }

    query = query.limit(limit + 1);

    const { data: payments, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    const hasMore = (payments?.length ?? 0) > limit;
    const items = (payments ?? []).slice(0, limit).map((p) => {
      // Derive description from related data
      const registration = p.registrations as unknown as {
        events: { title: string } | null;
      } | null;
      let description = "Payment";
      if (registration?.events?.title) {
        description = `Event: ${registration.events.title}`;
      } else if (p.application_id) {
        description = "Membership Application Fee";
      }

      return {
        id: p.id,
        date: p.created_at,
        description,
        amount: p.amount,
        currency: p.currency ?? "SGD",
        provider: p.provider,
        providerRef: p.provider_ref,
        status: p.status,
        refundAmount: p.refund_amount ?? 0,
      };
    });

    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    return NextResponse.json({
      data: items,
      cursor: nextCursor,
      hasMore,
      total: count ?? 0,
    });
  } catch (err) {
    console.error("GET /api/v1/members/[id]/payments error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
