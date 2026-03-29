"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "\uD83C\uDFE0" },
  { href: "/events", label: "Events", icon: "\uD83D\uDCC5" },
  { href: "/dashboard", label: "Dashboard", icon: "\uD83D\uDCCA" },
  { href: "/more", label: "More", icon: "\u2026" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden"
      aria-label="Mobile tab navigation"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-lg" aria-hidden="true">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
