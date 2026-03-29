import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalMembers: number;
  pendingApplications: number;
  upcomingEvents: number;
  revenueMonthToDate: number;
  recentActivity: {
    id: string;
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: Record<string, unknown>;
    createdAt: string;
  }[];
}

const ACTION_BADGE_MAP: Record<string, { variant: "info" | "warning" | "success" | "danger"; label: string }> = {
  "member.registered": { variant: "info", label: "Registration" },
  "application.submitted": { variant: "warning", label: "Application" },
  "application.approved": { variant: "success", label: "Application" },
  "application.rejected": { variant: "danger", label: "Application" },
  "payment.completed": { variant: "success", label: "Payment" },
  "payment.failed": { variant: "danger", label: "Payment" },
  "event.created": { variant: "info", label: "Event" },
  "communication.sent": { variant: "info", label: "Communication" },
  "config.branding.updated": { variant: "info", label: "Config" },
  "config.features.updated": { variant: "info", label: "Config" },
};

function getActionBadge(action: string) {
  const mapped = ACTION_BADGE_MAP[action];
  if (mapped) return mapped;
  if (action.includes("alert")) return { variant: "danger" as const, label: "Alert" };
  if (action.includes("payment")) return { variant: "success" as const, label: "Payment" };
  if (action.includes("application")) return { variant: "warning" as const, label: "Application" };
  return { variant: "info" as const, label: "Activity" };
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch stats in parallel
  const [membersRes, pendingRes, eventsRes, revenueRes, activityRes, prevMonthRevenueRes] =
    await Promise.all([
      supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("applications").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published").gte("date", now.toISOString()),
      supabase.from("payments").select("amount").eq("status", "completed").gte("created_at", monthStart),
      supabase.from("audit_logs").select("id, actor_id, action, entity_type, entity_id, details, created_at").order("created_at", { ascending: false }).limit(20),
      // Previous month revenue for % change
      supabase.from("payments").select("amount").eq("status", "completed")
        .gte("created_at", new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString())
        .lt("created_at", monthStart),
    ]);

  const stats: DashboardStats = {
    totalMembers: membersRes.count ?? 0,
    pendingApplications: pendingRes.count ?? 0,
    upcomingEvents: eventsRes.count ?? 0,
    revenueMonthToDate: (revenueRes.data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0),
    recentActivity: (activityRes.data ?? []).map((log) => ({
      id: log.id,
      actorId: log.actor_id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      details: log.details as Record<string, unknown>,
      createdAt: log.created_at,
    })),
  };

  const prevRevenue = (prevMonthRevenueRes.data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const revenueChange = prevRevenue > 0
    ? Math.round(((stats.revenueMonthToDate - prevRevenue) / prevRevenue) * 100)
    : 0;

  const statCards = [
    { title: "Total Members", value: stats.totalMembers.toLocaleString(), icon: "👥", change: null },
    { title: "Pending Applications", value: stats.pendingApplications.toLocaleString(), icon: "📋", change: null },
    { title: "Upcoming Events", value: stats.upcomingEvents.toLocaleString(), icon: "📅", change: null },
    {
      title: "Revenue MTD",
      value: `$${stats.revenueMonthToDate.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: "💰",
      change: revenueChange,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your community</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4">
              <span className="text-3xl" aria-hidden="true">{card.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                {card.change !== null && (
                  <p className={`text-xs font-medium ${card.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {card.change >= 0 ? "+" : ""}{card.change}% vs last month
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Recent activity">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No recent activity
                  </td>
                </tr>
              ) : (
                stats.recentActivity.map((activity) => {
                  const badge = getActionBadge(activity.action);
                  return (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-3 text-gray-500">
                        {formatRelativeTime(activity.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-6 py-3 text-gray-700">
                        {activity.actorId === "system" ? "System" : activity.actorId.slice(0, 8)}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {activity.action.replace(/\./g, " ")}
                        {activity.entityId ? ` — ${activity.entityId.slice(0, 8)}` : ""}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
