import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types";
import { EventsPageClient } from "./events-page-client";

interface EventsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = {
  title: "Events | CommunityHub",
  description: "Browse and register for upcoming community events.",
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("date", { ascending: true });

  const category = typeof params.category === "string" ? params.category : undefined;
  const priceType = typeof params.priceType === "string" ? params.priceType : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  if (priceType === "Free") {
    query = query.eq("price_adult", 0);
  } else if (priceType === "Paid") {
    query = query.gt("price_adult", 0);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;

  // Map snake_case DB columns to camelCase types
  const events: Event[] = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    tenantId: (row.tenant_id ?? row.tenantId ?? "") as string,
    title: (row.title ?? "") as string,
    description: (row.description ?? "") as string,
    category: (row.category ?? "") as string,
    date: (row.date ?? "") as string,
    startTime: (row.start_time ?? row.startTime ?? "") as string,
    endTime: (row.end_time ?? row.endTime ?? "") as string,
    venueName: (row.venue_name ?? row.venueName ?? "") as string,
    venueAddress: (row.venue_address ?? row.venueAddress ?? "") as string,
    venueLat: (row.venue_lat ?? row.venueLat ?? 0) as number,
    venueLng: (row.venue_lng ?? row.venueLng ?? 0) as number,
    capacity: (row.capacity ?? 0) as number,
    priceAdult: (row.price_adult ?? row.priceAdult ?? 0) as number,
    priceChild: (row.price_child ?? row.priceChild ?? 0) as number,
    status: (row.status ?? "published") as Event["status"],
    images: (row.images ?? []) as Event["images"],
    coverImageUrl: (row.cover_image_url ?? row.coverImageUrl ?? "") as string,
    schedule: (row.schedule ?? "") as string,
    speakers: (row.speakers ?? []) as string[],
    createdBy: (row.created_by ?? row.createdBy ?? "") as string,
    createdAt: (row.created_at ?? row.createdAt ?? "") as string,
  }));

  const initialFilters = {
    search: search ?? "",
    category: category ?? "All",
    priceType: priceType ?? "All",
    view: (typeof params.view === "string" ? params.view : "cards") as "cards" | "calendar",
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="mt-2 text-gray-500">
          Discover and register for upcoming community events, festivals, and
          gatherings.
        </p>
      </div>

      {error && (
        <div
          className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          Failed to load events. Please try again later.
        </div>
      )}

      <EventsPageClient events={events} initialFilters={initialFilters} />
    </section>
  );
}
