import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") ?? "pending";
  const sortBy = searchParams.get("sort") ?? "created_at";
  const order = searchParams.get("order") === "asc" ? true : false;
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 25), 100);

  let query = supabase
    .from("applications")
    .select(
      "id, tenant_id, step_data, current_step, phone, phone_verified, email, email_verified, referrer_member_id, referrer_confirmed, fraud_score, fraud_factors, payment_id, status, rejection_reason, reviewed_by, created_at, reviewed_at",
      { count: "exact" },
    )
    .order(sortBy === "fraud_score" ? "fraud_score" : "created_at", {
      ascending: order,
    })
    .limit(limit);

  if (status === "pending") {
    query = query.in("status", ["submitted", "under_review"]);
  }

  if (cursor) {
    query = query.gt("created_at", cursor);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json(
      { message: "Failed to fetch applications", code: "FETCH_ERROR" },
      { status: 500 },
    );
  }

  const applications = (data ?? []).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    stepData: row.step_data,
    currentStep: row.current_step,
    phone: row.phone,
    phoneVerified: row.phone_verified,
    email: row.email,
    emailVerified: row.email_verified,
    referrerMemberId: row.referrer_member_id,
    referrerConfirmed: row.referrer_confirmed,
    fraudScore: row.fraud_score,
    fraudFactors: row.fraud_factors,
    paymentId: row.payment_id,
    status: row.status,
    rejectionReason: row.rejection_reason,
    reviewedBy: row.reviewed_by,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  }));

  const last = applications[applications.length - 1];

  return NextResponse.json({
    data: applications,
    cursor: last?.createdAt ?? null,
    hasMore: (count ?? 0) > (applications.length + (cursor ? 1 : 0)),
    total: count ?? 0,
  });
}
