"use client";

import Link from "next/link";
import type { Event } from "@/types";
import { Button } from "@/components/ui/button";

interface EventCalendarProps {
  events: Event[];
  month: number; // 0-11
  year: number;
  onMonthChange: (delta: number) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function EventCalendar({ events, month, year, onMonthChange }: EventCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  // Group events by day
  const eventsByDay = new Map<number, Event[]>();
  events.forEach((event) => {
    const d = new Date(event.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      const existing = eventsByDay.get(day) ?? [];
      existing.push(event);
      eventsByDay.set(day, existing);
    }
  });

  // Build calendar cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(-1)}
          aria-label="Previous month"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h2 className="text-lg font-semibold text-gray-900">
          {MONTH_NAMES[month]} {year}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(1)}
          aria-label="Next month"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-semibold uppercase text-gray-500"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7" role="grid" aria-label={`${MONTH_NAMES[month]} ${year} calendar`}>
        {cells.map((day, idx) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const dayEvents = day ? eventsByDay.get(day) ?? [] : [];

          return (
            <div
              key={idx}
              className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 sm:min-h-[100px] sm:p-2 ${
                day ? "bg-white" : "bg-gray-50"
              }`}
              role="gridcell"
              aria-label={day ? `${MONTH_NAMES[month]} ${day}` : undefined}
            >
              {day && (
                <>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isToday
                        ? "bg-indigo-500 text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/events/${ev.id}`}
                        className="block truncate rounded bg-indigo-50 px-1 py-0.5 text-xs text-indigo-700 hover:bg-indigo-100 transition-colors"
                        title={ev.title}
                      >
                        {ev.title}
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="block text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
