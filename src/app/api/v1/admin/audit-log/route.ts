import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");
  const entityType = searchParams.get("entity_type");
  const actorId = searchParams.get("actor_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  let query = supabase
    .from("audit_logs")
    .select(
      "id, tenant_id, actor_id, action, entity_type, entity_id, details, ip_address, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (action) {
    query = query.eq("action", action);
  }
  if (entityType) {
    query = query.eq("entity_type", entityType);
  }
  if (actorId) {
    query = query.eq("actor_id", actorId);
  }
  if (from) {
    query = query.gte("created_at", new Date(from).toISOString());
  }
  if (to) {
    query = query.lte("created_at", new Date(to).toISOString());
  }
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json(
      { message: "Failed to fetch audit logs", code: "FETCH_ERROR" },
      { status: 500 },
    );
  }

  const logs = (data ?? []).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    actorId: row.actor_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details,
    ipAddress: row.ip_address,
    createdAt: row.created_at,
  }));

  const last = logs[logs.length - 1];

  return NextResponse.json({
    data: logs,
    cursor: last?.createdAt ?? null,
    hasMore: logs.length === limit,
    total: count ?? 0,
  });
}
