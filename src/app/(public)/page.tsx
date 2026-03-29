import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventGrid } from "@/components/events/event-grid";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TENANT } from "@/config/tenant";
import type { Event } from "@/types";

// ---------------------------------------------------------------------------
// Homepage — Server Component with real Supabase data
// ---------------------------------------------------------------------------

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(3);

    return (data ?? []) as Event[];
  } catch {
    return [];
  }
}

async function getStats(): Promise<{
  memberCount: number;
  eventCount: number;
}> {
  try {
    const supabase = await createClient();

    const [membersResult, eventsResult] = await Promise.all([
      supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

    return {
      memberCount: membersResult.count ?? 0,
      eventCount: eventsResult.count ?? 0,
    };
  } catch {
    return { memberCount: 0, eventCount: 0 };
  }
}

async function getTenantConfig() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .limit(1)
      .single();
    return data ?? DEFAULT_TENANT;
  } catch {
    return DEFAULT_TENANT;
  }
}

function formatStatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  }
  return n > 0 ? `${n}+` : "0";
}

export default async function HomePage() {
  const [events, stats, tenant] = await Promise.all([
    getUpcomingEvents(),
    getStats(),
    getTenantConfig(),
  ]);

  const orgName = tenant.name ?? DEFAULT_TENANT.name;
  const tagline =
    (tenant.branding?.tagline ?? tenant.tagline) ??
    DEFAULT_TENANT.branding.tagline;

  const statCards = [
    { label: "Active Members", value: formatStatNumber(stats.memberCount) },
    { label: "Events This Year", value: formatStatNumber(stats.eventCount) },
    { label: "Volunteer Hours", value: "15,000+" },
    { label: "Years Active", value: "12" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 px-4 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to {orgName}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100 sm:text-xl">
            {tagline}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/events">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
              >
                Explore Events
              </Button>
            </Link>
            <Link href="/join">
              <Button
                variant="ghost"
                size="lg"
                className="border border-white/30 text-white hover:bg-white/10"
              >
                Become a Member
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upcoming Events
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Don&apos;t miss out on what&apos;s happening next
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all &rarr;
          </Link>
        </div>
        <EventGrid events={events} />
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Our Community in Numbers
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="py-6">
                  <p className="text-3xl font-bold text-indigo-600">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold">Ready to Join?</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Become a member of {orgName} and connect with a vibrant community.
            Enjoy exclusive events, networking opportunities, and more.
          </p>
          <Link href="/join">
            <Button
              variant="secondary"
              size="lg"
              className="mt-6 bg-white text-indigo-600 hover:bg-gray-100"
            >
              Join Now
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
