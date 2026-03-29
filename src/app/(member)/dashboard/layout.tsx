import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar, type SidebarItem } from "@/components/layout/sidebar";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Member Dashboard Layout — Server Component
// Auth-gated: redirects to /login if not authenticated
// ---------------------------------------------------------------------------

const DASHBOARD_NAV: SidebarItem[] = [
  { label: "Overview", href: "/dashboard", icon: "\u{1F4CA}" },
  { label: "My Events", href: "/dashboard/events", icon: "\uD83D\uDCC5" },
  { label: "Profile", href: "/dashboard/profile", icon: "\uD83D\uDC64" },
  { label: "Membership", href: "/dashboard/membership", icon: "\uD83D\uDCB3" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "\uD83D\uDD14" },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  // Fetch unread notification count (pseudo: recent registrations in last 7 days
  // + membership expiring within 30 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: recentRegCount } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("member_id", user.memberId)
    .gte("created_at", sevenDaysAgo.toISOString());

  const unreadCount = recentRegCount ?? 0;

  const navItems = DASHBOARD_NAV.map((item) => {
    if (item.label === "Notifications" && unreadCount > 0) {
      return { ...item, badge: String(unreadCount) };
    }
    return item;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar items={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
