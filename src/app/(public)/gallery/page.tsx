"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Photo Gallery — Placeholder page with gradient cards
// Real photo storage/upload will be added when events have photos.
// ---------------------------------------------------------------------------

const PLACEHOLDER_PHOTOS = [
  {
    id: "1",
    gradient: "from-indigo-400 to-purple-500",
    emoji: "🎉",
    title: "Annual Gala 2025",
    count: 48,
  },
  {
    id: "2",
    gradient: "from-pink-400 to-rose-500",
    emoji: "🎵",
    title: "Music Night",
    count: 32,
  },
  {
    id: "3",
    gradient: "from-amber-400 to-orange-500",
    emoji: "🍛",
    title: "Food Festival",
    count: 56,
  },
  {
    id: "4",
    gradient: "from-emerald-400 to-teal-500",
    emoji: "🏃",
    title: "Sports Day",
    count: 24,
  },
  {
    id: "5",
    gradient: "from-blue-400 to-cyan-500",
    emoji: "🎨",
    title: "Art Workshop",
    count: 18,
  },
  {
    id: "6",
    gradient: "from-violet-400 to-fuchsia-500",
    emoji: "🎭",
    title: "Cultural Program",
    count: 40,
  },
];

const EVENT_FILTER_OPTIONS = [
  "All Events",
  "Annual Gala 2025",
  "Music Night",
  "Food Festival",
  "Sports Day",
  "Art Workshop",
  "Cultural Program",
];

export default function GalleryPage() {
  const [selectedEvent, setSelectedEvent] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhotos = PLACEHOLDER_PHOTOS.filter((photo) => {
    const matchesEvent =
      selectedEvent === "All Events" || photo.title === selectedEvent;
    const matchesSearch =
      !searchQuery ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 px-4 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Photo Gallery
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-indigo-100">
            Memories from our community events
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:w-64">
            <label
              htmlFor="event-filter"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Filter by Event
            </label>
            <select
              id="event-filter"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {EVENT_FILTER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-80">
            <Input
              label="Search Photos"
              placeholder="AI-powered search coming soon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {filteredPhotos.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {filteredPhotos.map((photo, index) => {
              // Vary heights for masonry effect
              const heights = [
                "h-56",
                "h-72",
                "h-64",
                "h-80",
                "h-60",
                "h-68",
              ];
              const heightClass = heights[index % heights.length];

              return (
                <Card
                  key={photo.id}
                  className="mb-4 break-inside-avoid overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    aria-label={`View ${photo.title} photos`}
                  >
                    <div
                      className={`${heightClass} flex flex-col items-center justify-center bg-gradient-to-br ${photo.gradient}`}
                    >
                      <span className="text-5xl" role="img" aria-hidden="true">
                        {photo.emoji}
                      </span>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {photo.title}
                      </p>
                      <p className="mt-1 text-sm text-white/80">
                        {photo.count} photos
                      </p>
                    </div>
                  </button>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No photos found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Photos will appear here after events are held.
            </p>
          </div>
        )}

        {/* Info banner */}
        <div className="mt-8 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-center">
          <p className="text-sm text-indigo-700">
            Photos will appear here after events are held. Event organizers can
            upload photos through the admin panel.
          </p>
        </div>
      </section>
    </>
  );
}
