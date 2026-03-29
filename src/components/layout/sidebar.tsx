"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function Sidebar({ items, className = "" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white ${className}`}
      aria-label="Dashboard sidebar"
    >
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-l-2 border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-base" aria-hidden="true">
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="info">{item.badge}</Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
