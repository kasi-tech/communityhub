import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { PaginatedResponse, ApiError } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/members — Admin only: list all members with filters
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const tierId = searchParams.get("tier_id");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1),
      100,
    );

    let query = supabase
      .from("members")
      .select(
        "id, name, email, status, member_number, created_at, tier_id, membership_tiers(name)",
        { count: "exact" },
      );

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (tierId) {
      query = query.eq("tier_id", tierId);
    }

    query = query.order("created_at", { ascending: false });

    // Cursor-based pagination
    if (cursor) {
      const { data: cursorRow } = await supabase
        .from("members")
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

    const { data: members, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    const hasMore = (members?.length ?? 0) > limit;
    const items = (members ?? []).slice(0, limit).map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      tierName: (m.membership_tiers as unknown as { name: string } | null)?.name ?? null,
      status: m.status,
      memberNumber: m.member_number,
      createdAt: m.created_at,
    }));
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    const response: PaginatedResponse<(typeof items)[number]> = {
      data: items,
      cursor: nextCursor,
      hasMore,
      total: count ?? 0,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/v1/members error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
