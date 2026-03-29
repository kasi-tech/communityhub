"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
}

const categoryEmojis: Record<string, string> = {
  Cultural: "\uD83C\uDFAD",
  Sports: "\u26BD",
  Entertainment: "\uD83C\uDFB5",
  Religious: "\uD83D\uDE4F",
  Social: "\uD83C\uDF89",
  AGM: "\uD83D\uDCCB",
  Education: "\uD83D\uDCDA",
};

const categoryGradients: Record<string, string> = {
  Cultural: "from-purple-400 to-pink-500",
  Sports: "from-green-400 to-emerald-500",
  Entertainment: "from-orange-400 to-red-500",
  Religious: "from-amber-400 to-yellow-500",
  Social: "from-indigo-400 to-blue-500",
  AGM: "from-gray-400 to-slate-500",
  Education: "from-teal-400 to-cyan-500",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours ?? "0", 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function EventCard({ event }: EventCardProps) {
  const spotsRemaining = event.capacity;
  const isFree = event.priceAdult === 0;
  const emoji = categoryEmojis[event.category] ?? "\uD83D\uDCC5";
  const gradient = categoryGradients[event.category] ?? "from-indigo-400 to-purple-500";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
      aria-label={`View details for ${event.title}`}
    >
      {/* Image area */}
      <div className="relative">
        {event.coverImageUrl ? (
          <div className="h-48 w-full overflow-hidden">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className={`flex h-48 items-center justify-center bg-gradient-to-br ${gradient}`}
          >
            <span className="text-5xl" aria-hidden="true">
              {emoji}
            </span>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute right-3 top-3">
          <Badge variant={isFree ? "success" : "info"} className="text-sm font-semibold">
            {isFree ? "Free" : `$${event.priceAdult.toFixed(2)}`}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {event.category}
        </p>

        {/* Title */}
        <h3 className="mt-1 text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          {/* Date + Time */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="h-4 w-4 flex-shrink-0 text-gray-400"
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
            <span>
              {formatDate(event.date)} &middot; {formatTime(event.startTime)}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="h-4 w-4 flex-shrink-0 text-gray-400"
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
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span
          className={`text-sm font-medium ${
            spotsRemaining < 20 ? "text-red-600" : "text-green-600"
          }`}
        >
          {spotsRemaining === 0
            ? "Sold out"
            : `${spotsRemaining} spots left`}
        </span>
        <Button variant="primary" size="sm" tabIndex={-1} aria-hidden="true">
          Register
        </Button>
      </div>
    </Link>
  );
}
