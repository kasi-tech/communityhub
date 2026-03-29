import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Dashboard Overview — Server Component
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${accent}`}
        >
          <span className="text-xl" aria-hidden="true">
            {icon}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  // Fetch member data
  const { data: member } = await supabase
    .from("members")
    .select(
      "id, name, status, membership_expires, created_at, tier_id, membership_tiers(name)",
    )
    .eq("id", user.memberId)
    .single();

  const memberName = member?.name ?? user.name;
  const memberSinceYear = member?.created_at
    ? new Date(member.created_at).getFullYear()
    : new Date().getFullYear();
  const tierName =
    (member?.membership_tiers as unknown as { name: string } | null)?.name ??
    "Free";
  const isExpired = member?.status === "expired";
  const isActive = member?.status === "active";

  // Fetch upcoming registrations
  const today = new Date().toISOString().split("T")[0];
  const { data: upcomingRegs } = await supabase
    .from("registrations")
    .select("id, events(id, title, date, start_time, venue_name, category, cover_image_url)")
    .eq("member_id", user.memberId)
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false });

  const upcomingEvents = (upcomingRegs ?? []).filter((r) => {
    const event = r.events as unknown as { date: string } | null;
    return event && event.date >= today!;
  });

  // Count past events (attended)
  const { count: pastEventsCount } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("member_id", user.memberId)
    .not("status", "eq", "cancelled");

  const attendedCount = Math.max((pastEventsCount ?? 0) - upcomingEvents.length, 0);

  // Try to get recommended events (fallback to upcoming published events)
  let recommendedEvents: Array<{
    id: string;
    title: string;
    date: string;
    startTime: string;
    venueName: string;
    category: string;
    coverImageUrl: string | null;
  }> = [];

  try {
    const recResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/v1/ai/recommend`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: user.memberId, limit: 3 }),
        cache: "no-store",
      },
    );
    if (recResponse.ok) {
      const recData = await recResponse.json();
      recommendedEvents = recData.data ?? [];
    }
  } catch {
    // Fallback: fetch upcoming published events
  }

  if (recommendedEvents.length === 0) {
    const { data: fallbackEvents } = await supabase
      .from("events")
      .select("id, title, date, start_time, venue_name, category, cover_image_url")
      .eq("status", "published")
      .gte("date", today!)
      .order("date", { ascending: true })
      .limit(3);

    recommendedEvents = (fallbackEvents ?? []).map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      startTime: e.start_time,
      venueName: e.venue_name,
      category: e.category,
      coverImageUrl: e.cover_image_url,
    }));
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-SG", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {memberName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here is what is happening with your membership.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming Events"
          value={upcomingEvents.length}
          icon={"\uD83D\uDCC5"}
          accent="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Events Attended"
          value={attendedCount}
          icon={"\u2705"}
          accent="bg-green-100 text-green-600"
        />
        <StatCard
          label="Member Since"
          value={memberSinceYear}
          icon={"\u2B50"}
          accent="bg-amber-100 text-amber-600"
        />
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <span className="text-xl" aria-hidden="true">
                {"\uD83D\uDCB3"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Membership</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {tierName}
                </span>
                <Badge variant={isActive ? "success" : isExpired ? "danger" : "gray"}>
                  {isActive ? "Active" : isExpired ? "Expired" : (member?.status ?? "Pending")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended for You */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recommended for You
        </h2>
        {recommendedEvents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group">
                <Card className="transition-shadow hover:shadow-md">
                  {event.coverImageUrl ? (
                    <div className="h-36 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={event.coverImageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-t-lg bg-gradient-to-br from-indigo-400 to-purple-500">
                      <span className="text-4xl" aria-hidden="true">
                        {"\uD83C\uDFAD"}
                      </span>
                    </div>
                  )}
                  <CardContent>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {event.category}
                    </p>
                    <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate">{event.venueName}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-gray-500">
                No recommendations available right now. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/events">
            <Button variant="primary">Register for Event</Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="secondary">Update Profile</Button>
          </Link>
          <Link href="/dashboard/membership">
            <Button variant="secondary">View Membership</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
