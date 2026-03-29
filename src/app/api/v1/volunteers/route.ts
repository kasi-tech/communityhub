import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import type { ApiError, PaginatedResponse, Volunteer } from "@/types";
import { createElement } from "react";

// ---------------------------------------------------------------------------
// GET /api/v1/volunteers — Admin: list volunteers (paginated, searchable)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1),
      100,
    );

    let query = supabase
      .from("volunteers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    if (cursor) {
      const { data: cursorRow } = await supabase
        .from("volunteers")
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

    const { data: volunteers, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: { message: error.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    const hasMore = (volunteers?.length ?? 0) > limit;
    const items = (volunteers ?? []).slice(0, limit) as Volunteer[];
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    const response: PaginatedResponse<Volunteer> = {
      data: items,
      cursor: nextCursor,
      hasMore,
      total: count ?? 0,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/v1/volunteers error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/v1/volunteers — Public: register as volunteer
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { name, email, phone, skills, availability, notes } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Name is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: { message: "A valid email is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Phone number is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: { message: "At least one skill is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!Array.isArray(availability) || availability.length === 0) {
      return NextResponse.json(
        { error: { message: "At least one availability slot is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Create volunteer record
    const { data: volunteer, error: volunteerError } = await supabase
      .from("volunteers")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        skills,
        availability: availability.join(", "),
        notes: notes?.trim() ?? "",
      })
      .select("id")
      .single();

    if (volunteerError || !volunteer) {
      return NextResponse.json(
        { error: { message: volunteerError?.message ?? "Failed to register volunteer", code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: email.trim().toLowerCase(),
        subject: "Thank you for volunteering!",
        react: createElement("div", null,
          createElement("h2", { style: { color: "#6366F1" } }, "Thank You for Volunteering!"),
          createElement("p", null, `Dear ${name.trim()},`),
          createElement("p", null, "Thank you for registering as a volunteer with our community. We truly appreciate your willingness to help!"),
          createElement("p", null, "Our team will be in touch when volunteer opportunities arise that match your skills and availability."),
          createElement("p", { style: { color: "#9ca3af", fontSize: "12px", marginTop: "24px" } }, "This is an automated message from CommunityHub."),
        ),
      });
    } catch (emailErr) {
      console.error("Failed to send volunteer confirmation email:", emailErr);
    }

    return NextResponse.json({ volunteerId: volunteer.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/volunteers error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
