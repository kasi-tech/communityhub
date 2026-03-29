import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/v1/registrations/[id] — Auth: registration detail
// Members can view their own; admins can view any.
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
      .select("*, event:events!registrations_event_id_fkey(*), member:members!registrations_member_id_fkey(name, email)")
      .eq("id", id)
      .single();

    if (error || !registration) {
      return NextResponse.json(
        { error: { message: "Registration not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Ownership check — member can only see own registrations
    const admin = await isAdmin(supabase);
    if (!admin && registration.member_id !== user.memberId) {
      return NextResponse.json(
        { error: { message: "Access denied", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    return NextResponse.json({ data: registration });
  } catch (err) {
    console.error("GET /api/v1/registrations/[id] error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
