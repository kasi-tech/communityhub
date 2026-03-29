import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/members/me — Return current authenticated member's basic info
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } satisfies ApiError },
        { status: 401 },
      );
    }

    const { data: member, error } = await supabase
      .from("members")
      .select(
        "id, name, email, phone, status, member_number, membership_expires, created_at, tier_id",
      )
      .eq("id", user.memberId)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { error: { message: "Member not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        memberNumber: member.member_number,
        membershipExpires: member.membership_expires,
        createdAt: member.created_at,
        tierId: member.tier_id,
      },
    });
  } catch (err) {
    console.error("GET /api/v1/members/me error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
