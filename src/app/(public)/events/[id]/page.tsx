import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types";
import { notFound } from "next/navigation";
import { EventDetailClient } from "./event-detail-client";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("title, description").eq("id", id).single();

  if (!data) {
    return { title: "Event Not Found | CommunityHub" };
  }

  return {
    title: `${data.title} | CommunityHub`,
    description: (data.description as string)?.slice(0, 160) ?? "",
  };
}

function mapRowToEvent(row: Record<string, unknown>): Event {
  return {
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
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: eventRow, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !eventRow) {
    notFound();
  }

  const event = mapRowToEvent(eventRow as Record<string, unknown>);

  // Get registration count for spots remaining
  const { count: registrationCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id)
    .eq("status", "confirmed");

  const spotsRemaining = Math.max(0, event.capacity - (registrationCount ?? 0));

  // Fetch related events (same category, excluding current)
  const { data: relatedRows } = await supabase
    .from("events")
    .select("*")
    .eq("category", event.category)
    .eq("status", "published")
    .neq("id", id)
    .order("date", { ascending: true })
    .limit(3);

  const relatedEvents: Event[] = (relatedRows ?? []).map((row: Record<string, unknown>) =>
    mapRowToEvent(row)
  );

  return (
    <EventDetailClient
      event={event}
      spotsRemaining={spotsRemaining}
      relatedEvents={relatedEvents}
    />
  );
}
