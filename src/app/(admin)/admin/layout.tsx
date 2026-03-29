import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { Sidebar, type SidebarItem } from "@/components/layout/sidebar";
import type { ReactNode } from "react";

const ADMIN_NAV: SidebarItem[] = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Events", href: "/admin/events", icon: "📅" },
  { label: "Members", href: "/admin/members", icon: "👥" },
  { label: "Applications", href: "/admin/applications", icon: "📋" },
  { label: "Reports", href: "/admin/reports", icon: "📈" },
  { label: "Communications", href: "/admin/communications", icon: "✉️" },
  { label: "Configuration", href: "/admin/config", icon: "⚙️" },
  { label: "AI Chatbot", href: "/admin/chatbot", icon: "🤖" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  if (!(await isAdmin(supabase))) {
    redirect("/login");
  }

  // Fetch pending application count for badge
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .in("status", ["submitted", "under_review"]);

  const navItems = ADMIN_NAV.map((item) => {
    if (item.label === "Applications" && count && count > 0) {
      return { ...item, badge: String(count) };
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
