"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Notifications — Client Component
// Builds pseudo-notifications from recent activity
// ---------------------------------------------------------------------------

type NotificationType =
  | "event_reminder"
  | "registration"
  | "membership"
  | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const TYPE_STYLES: Record<
  NotificationType,
  { border: string; icon: string; bg: string }
> = {
  event_reminder: {
    border: "border-l-indigo-500",
    bg: "bg-indigo-50",
    icon: "\uD83D\uDCC5",
  },
  registration: {
    border: "border-l-green-500",
    bg: "bg-green-50",
    icon: "\u2705",
  },
  membership: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50",
    icon: "\uD83D\uDCB3",
  },
  system: {
    border: "border-l-gray-500",
    bg: "bg-gray-50",
    icon: "\u2139\uFE0F",
  },
};

function relativeTime(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return then.toLocaleDateString("en-SG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current member info
      const meRes = await fetch("/api/v1/members/me");
      if (!meRes.ok) throw new Error("Not authenticated");
      const meData = await meRes.json();
      const member = meData.data;
      if (!member) throw new Error("Member not found");

      const memberId = member.id;
      const items: Notification[] = [];

      // Fetch recent registrations for notification generation
      const eventsRes = await fetch(
        `/api/v1/members/${memberId}/events?status=upcoming`,
      );
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const upcomingRegs = eventsData.data ?? [];

        for (const reg of upcomingRegs) {
          if (!reg.event) continue;

          // Registration confirmation notification
          items.push({
            id: `reg-${reg.registrationId}`,
            type: "registration",
            title: "Registration Confirmed",
            message: `You are registered for "${reg.event.title}" on ${formatDateShort(reg.event.date)}.`,
            timestamp: reg.registeredAt,
            read: false,
          });

          // Event reminder if event is within 3 days
          const eventDate = new Date(reg.event.date + "T00:00:00");
          const now = new Date();
          const diffDays = Math.ceil(
            (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (diffDays >= 0 && diffDays <= 3) {
            items.push({
              id: `reminder-${reg.registrationId}`,
              type: "event_reminder",
              title: "Event Reminder",
              message: `"${reg.event.title}" is ${diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : `in ${diffDays} days`}! Don't forget to attend.`,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }
      }

      // Membership status notification
      if (member.status === "expired") {
        items.push({
          id: "membership-expired",
          type: "membership",
          title: "Membership Expired",
          message:
            "Your membership has expired. Renew now to continue enjoying member benefits.",
          timestamp: member.membershipExpires ?? new Date().toISOString(),
          read: false,
        });
      } else if (member.membershipExpires) {
        const expDate = new Date(member.membershipExpires);
        const now = new Date();
        const diffDays = Math.ceil(
          (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 0 && diffDays <= 30) {
          items.push({
            id: "membership-expiring",
            type: "membership",
            title: "Membership Expiring Soon",
            message: `Your membership expires in ${diffDays} day${diffDays > 1 ? "s" : ""}. Renew early to avoid any interruption.`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }

      // Welcome notification for new members (joined within 7 days)
      if (member.createdAt) {
        const joinDate = new Date(member.createdAt);
        const now = new Date();
        const daysSinceJoin = Math.floor(
          (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceJoin <= 7) {
          items.push({
            id: "welcome",
            type: "system",
            title: "Welcome to CommunityHub!",
            message:
              "Thank you for joining. Explore events, update your profile, and connect with the community.",
            timestamp: member.createdAt,
            read: false,
          });
        }
      }

      // Sort by timestamp descending
      items.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setNotifications(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark all as read on view
  useEffect(() => {
    if (!loading && notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true })),
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, notifications.length]);

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={fetchNotifications}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true })),
              )
            }
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <span className="text-xl text-gray-400" aria-hidden="true">
                {"\uD83D\uDD14"}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              All caught up!
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You have no notifications right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const style = TYPE_STYLES[notification.type];
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => markAsRead(notification.id)}
                className={`w-full rounded-lg border-l-4 ${style.border} ${
                  notification.read ? "bg-white" : style.bg
                } p-4 text-left shadow-sm transition-colors hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg" aria-hidden="true">
                    {style.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm ${
                          notification.read
                            ? "font-medium text-gray-700"
                            : "font-bold text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="shrink-0 text-xs text-gray-400">
                        {relativeTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-SG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
