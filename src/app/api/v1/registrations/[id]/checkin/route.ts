import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// POST /api/v1/registrations/[id]/checkin — Admin: check in a registration
// ---------------------------------------------------------------------------

export async function POST(
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

    // Verify registration exists
    const { data: registration } = await supabase
      .from("registrations")
      .select("id, status, checked_in_at")
      .eq("id", id)
      .single();

    if (!registration) {
      return NextResponse.json(
        { error: { message: "Registration not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    if (registration.status !== "confirmed") {
      return NextResponse.json(
        {
          error: {
            message: `Cannot check in a ${registration.status} registration`,
            code: "VALIDATION_ERROR",
          } satisfies ApiError,
        },
        { status: 400 },
      );
    }

    if (registration.checked_in_at) {
      return NextResponse.json(
        { error: { message: "Already checked in", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 400 },
      );
    }

    const { data: updated, error } = await supabase
      .from("registrations")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("POST /api/v1/registrations/[id]/checkin error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
