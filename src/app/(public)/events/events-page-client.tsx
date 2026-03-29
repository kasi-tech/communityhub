"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventFiltersBar, type EventFilters } from "@/components/events/event-filters";
import { EventGrid } from "@/components/events/event-grid";
import { EventCalendar } from "@/components/events/event-calendar";
import type { Event } from "@/types";

interface EventsPageClientProps {
  events: Event[];
  initialFilters: EventFilters;
}

export function EventsPageClient({ events, initialFilters }: EventsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<EventFilters>(initialFilters);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return now.getMonth();
  });
  const [calYear, setCalYear] = useState(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const handleFilterChange = useCallback(
    (newFilters: EventFilters) => {
      setFilters(newFilters);

      // Update URL search params for bookmarkability
      const params = new URLSearchParams();
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.category !== "All") params.set("category", newFilters.category);
      if (newFilters.priceType !== "All") params.set("priceType", newFilters.priceType);
      if (newFilters.view !== "cards") params.set("view", newFilters.view);

      const qs = params.toString();
      router.replace(`/events${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Client-side filtering (events already server-filtered, but support instant search)
  const filteredEvents = useMemo(() => {
    let result = events;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    if (filters.category !== "All") {
      result = result.filter((e) => e.category === filters.category);
    }

    if (filters.priceType === "Free") {
      result = result.filter((e) => e.priceAdult === 0);
    } else if (filters.priceType === "Paid") {
      result = result.filter((e) => e.priceAdult > 0);
    }

    return result;
  }, [events, filters]);

  const handleMonthChange = (delta: number) => {
    let newMonth = calMonth + delta;
    let newYear = calYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCalMonth(newMonth);
    setCalYear(newYear);
  };

  return (
    <>
      <div className="mb-6">
        <EventFiltersBar initialFilters={initialFilters} onFilterChange={handleFilterChange} />
      </div>

      {filters.view === "cards" ? (
        <EventGrid events={filteredEvents} />
      ) : (
        <EventCalendar
          events={filteredEvents}
          month={calMonth}
          year={calYear}
          onMonthChange={handleMonthChange}
        />
      )}
    </>
  );
}
