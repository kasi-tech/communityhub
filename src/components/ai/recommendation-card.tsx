"use client";

import type { Event } from "@/types";

interface RecommendationCardProps {
  event: Event;
  reason: string;
  onRegister: (eventId: string) => void;
}

export function RecommendationCard({ event, reason, onRegister }: RecommendationCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Event image */}
      {event.coverImageUrl ? (
        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          {/* AI badge */}
          <span className="absolute left-2 top-2 rounded-full bg-indigo-500/90 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            AI Recommended
          </span>
        </div>
      ) : (
        <div className="relative flex h-40 w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
          <svg className="h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="absolute left-2 top-2 rounded-full bg-indigo-500/90 px-2 py-0.5 text-xs font-medium text-white">
            AI Recommended
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
          {event.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </span>
          {event.priceAdult > 0 && (
            <span className="font-medium text-gray-700">${event.priceAdult}</span>
          )}
          {event.priceAdult === 0 && (
            <span className="font-medium text-green-600">Free</span>
          )}
        </div>

        {/* AI reason */}
        <p className="mt-2 text-sm italic text-indigo-600 line-clamp-2">
          {reason}
        </p>

        {/* Register button */}
        <button
          type="button"
          onClick={() => onRegister(event.id)}
          className="mt-3 w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          Register
        </button>
      </div>
    </div>
  );
}
