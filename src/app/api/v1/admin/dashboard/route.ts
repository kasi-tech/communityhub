import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    membersResult,
    pendingResult,
    eventsResult,
    revenueResult,
    activityResult,
  ] = await Promise.all([
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("date", now.toISOString()),
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "completed")
      .gte("created_at", monthStart),
    supabase
      .from("audit_logs")
      .select("id, actor_id, action, entity_type, entity_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const revenueMonthToDate = (revenueResult.data ?? []).reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0,
  );

  return NextResponse.json({
    totalMembers: membersResult.count ?? 0,
    pendingApplications: pendingResult.count ?? 0,
    upcomingEvents: eventsResult.count ?? 0,
    revenueMonthToDate,
    recentActivity: (activityResult.data ?? []).map((log) => ({
      id: log.id,
      actorId: log.actor_id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      details: log.details,
      createdAt: log.created_at,
    })),
  });
}
