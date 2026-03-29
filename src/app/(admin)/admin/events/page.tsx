import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventsCreateDialog } from "./events-create-dialog";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "gray"> = {
  published: "success",
  draft: "warning",
  cancelled: "danger",
  completed: "gray",
};

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, capacity, status, price_adult, created_at, cover_image_url, category")
    .order("date", { ascending: false });

  // Fetch registration counts per event
  const eventIds = (events ?? []).map((e) => e.id);
  const { data: regCounts } = eventIds.length > 0
    ? await supabase
        .from("registrations")
        .select("event_id")
        .in("event_id", eventIds)
        .eq("status", "confirmed")
    : { data: [] };

  const countMap = new Map<string, number>();
  for (const r of regCounts ?? []) {
    countMap.set(r.event_id, (countMap.get(r.event_id) ?? 0) + 1);
  }

  // Revenue per event
  const { data: payments } = eventIds.length > 0
    ? await supabase
        .from("payments")
        .select("amount, registration_id")
        .eq("status", "completed")
        .not("registration_id", "is", null)
    : { data: [] };

  // Map registration to event
  const { data: regs } = eventIds.length > 0
    ? await supabase
        .from("registrations")
        .select("id, event_id")
        .in("event_id", eventIds)
    : { data: [] };

  const regToEvent = new Map<string, string>();
  for (const r of regs ?? []) {
    regToEvent.set(r.id, r.event_id);
  }

  const revenueMap = new Map<string, number>();
  for (const p of payments ?? []) {
    if (p.registration_id) {
      const eid = regToEvent.get(p.registration_id);
      if (eid) {
        revenueMap.set(eid, (revenueMap.get(eid) ?? 0) + p.amount);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-sm text-gray-500">Manage community events</p>
        </div>
        <EventsCreateDialog />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Events table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Registered / Capacity</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!events || events.length === 0) ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No events found. Create your first event.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.category}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-gray-700">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {countMap.get(event.id) ?? 0} / {event.capacity}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      ${(revenueMap.get(event.id) ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={STATUS_VARIANT[event.status] ?? "gray"}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/admin/events/${event.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          aria-label={`Edit ${event.title}`}
                        >
                          Edit
                        </a>
                        <a
                          href={`/events/${event.id}`}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                          aria-label={`View ${event.title}`}
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
