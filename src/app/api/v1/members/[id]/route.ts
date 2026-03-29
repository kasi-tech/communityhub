import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/members/:id — Return member with tier details (owner or admin)
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
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

    // Owner or admin only
    const admin = await isAdmin(supabase);
    if (user.memberId !== id && !admin) {
      return NextResponse.json(
        { error: { message: "Access denied", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const { data: member, error } = await supabase
      .from("members")
      .select(
        `
        id, user_id, name, email, phone, dob, gender, nationality,
        postal_code, interests, status, member_number,
        membership_expires, created_at, tier_id,
        membership_tiers (id, name, price, duration_months, is_family, benefits, is_lifetime)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { error: { message: "Member not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    const tier = member.membership_tiers as unknown as {
      id: string;
      name: string;
      price: number;
      duration_months: number;
      is_family: boolean;
      benefits: string[];
      is_lifetime: boolean;
    } | null;

    return NextResponse.json({
      data: {
        id: member.id,
        userId: member.user_id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        dob: member.dob,
        gender: member.gender,
        nationality: member.nationality,
        postalCode: member.postal_code,
        interests: member.interests ?? [],
        status: member.status,
        memberNumber: member.member_number,
        membershipExpires: member.membership_expires,
        createdAt: member.created_at,
        tierId: member.tier_id,
        tier: tier
          ? {
              id: tier.id,
              name: tier.name,
              price: tier.price,
              durationMonths: tier.duration_months,
              isFamily: tier.is_family,
              benefits: tier.benefits ?? [],
              isLifetime: tier.is_lifetime,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("GET /api/v1/members/[id] error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/members/:id — Update member profile (owner only)
// ---------------------------------------------------------------------------

const FIELD_MAP: Record<string, string> = {
  name: "name",
  phone: "phone",
  dob: "dob",
  gender: "gender",
  nationality: "nationality",
  postalCode: "postal_code",
  residentialStatus: "residential_status",
  interests: "interests",
};

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    // Owner only for profile updates
    if (user.memberId !== id) {
      return NextResponse.json(
        { error: { message: "You can only update your own profile", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Map camelCase request fields to snake_case DB columns
    const updates: Record<string, unknown> = {};
    for (const [camelKey, snakeKey] of Object.entries(FIELD_MAP)) {
      if (body[camelKey] !== undefined) {
        updates[snakeKey] = body[camelKey];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: { message: "No valid fields to update", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Validate specific fields
    if (updates.name !== undefined && typeof updates.name !== "string") {
      return NextResponse.json(
        { error: { message: "Name must be a string", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (updates.phone !== undefined && typeof updates.phone !== "string") {
      return NextResponse.json(
        { error: { message: "Phone must be a string", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (updates.interests !== undefined && !Array.isArray(updates.interests)) {
      return NextResponse.json(
        { error: { message: "Interests must be an array", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("members")
      .update(updates)
      .eq("id", id)
      .select(
        "id, name, email, phone, dob, gender, nationality, postal_code, interests, status, member_number, membership_expires, created_at",
      )
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
      action: "member.profile_updated",
      entity_type: "member",
      entity_id: id,
      details: { fields: Object.keys(updates).filter((k) => k !== "updated_at") },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        dob: updated.dob,
        gender: updated.gender,
        nationality: updated.nationality,
        postalCode: updated.postal_code,
        interests: updated.interests ?? [],
        status: updated.status,
        memberNumber: updated.member_number,
        membershipExpires: updated.membership_expires,
        createdAt: updated.created_at,
      },
    });
  } catch (err) {
    console.error("PATCH /api/v1/members/[id] error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
