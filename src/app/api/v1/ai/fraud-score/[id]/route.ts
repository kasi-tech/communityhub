import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/ai/fraud-score/[id] — Admin: get fraud score for an application
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: { message: "Application ID is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    const { data: application, error } = await supabase
      .from("applications")
      .select("id, fraud_score, fraud_factors")
      .eq("id", id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: { message: "Application not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        score: application.fraud_score ?? 0,
        factors: application.fraud_factors ?? [],
      },
    });
  } catch (err) {
    console.error("GET /api/v1/ai/fraud-score/[id] error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
