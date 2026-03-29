"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types";

export interface RegistrationData {
  adults: number;
  children: number;
  dietaryPreference: string;
  specialRequirements: string;
  totalAmount: number;
}

interface EventRegistrationFormProps {
  event: Event;
  spotsRemaining: number;
  onRegister: (data: RegistrationData) => void;
  loading?: boolean;
}

const dietaryOptions = [
  "No Preference",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Other",
];

function generateCalendarUrl(event: Event): string {
  const startDate = new Date(`${event.date}T${event.startTime}`);
  const endDate = new Date(`${event.date}T${event.endTime}`);
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${fmt(startDate)}/${fmt(endDate)}&location=${encodeURIComponent(
    event.venueName
  )}&details=${encodeURIComponent(event.description.slice(0, 200))}`;
}

export function EventRegistrationForm({
  event,
  spotsRemaining,
  onRegister,
  loading = false,
}: EventRegistrationFormProps) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [dietary, setDietary] = useState("No Preference");
  const [specialReqs, setSpecialReqs] = useState("");

  const isFull = spotsRemaining <= 0;
  const isFree = event.priceAdult === 0 && event.priceChild === 0;

  const { adultTotal, childTotal, total } = useMemo(() => {
    const at = adults * event.priceAdult;
    const ct = children * event.priceChild;
    return { adultTotal: at, childTotal: ct, total: at + ct };
  }, [adults, children, event.priceAdult, event.priceChild]);

  const totalAttendees = adults + children;
  const exceedsCapacity = totalAttendees > spotsRemaining && !isFull;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({
      adults,
      children,
      dietaryPreference: dietary,
      specialRequirements: specialReqs,
      totalAmount: total,
    });
  };

  const calendarUrl = generateCalendarUrl(event);

  if (isFull) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-yellow-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm font-medium text-yellow-800">
              This event is fully booked
            </p>
          </div>
          <p className="mt-1 text-sm text-yellow-700">
            Join the waitlist to be notified if a spot opens up.
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() =>
            onRegister({
              adults: 1,
              children: 0,
              dietaryPreference: "No Preference",
              specialRequirements: "",
              totalAmount: 0,
            })
          }
          loading={loading}
        >
          Join Waitlist
        </Button>
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Add event to Google Calendar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Add to Calendar
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      aria-label="Event registration form"
    >
      <h3 className="text-lg font-semibold text-gray-900">Register</h3>
      <p className="mt-1 text-sm text-gray-500">
        {spotsRemaining} spot{spotsRemaining !== 1 ? "s" : ""} remaining
      </p>

      <div className="mt-5 space-y-4">
        {/* Adults */}
        <div>
          <label
            htmlFor="reg-adults"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Adults
          </label>
          <select
            id="reg-adults"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Children */}
        <div>
          <label
            htmlFor="reg-children"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Children
          </label>
          <select
            id="reg-children"
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Dietary */}
        <div>
          <label
            htmlFor="reg-dietary"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Dietary Preference
          </label>
          <select
            id="reg-dietary"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {dietaryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Special Requirements */}
        <div>
          <label
            htmlFor="reg-special"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Special Requirements
          </label>
          <textarea
            id="reg-special"
            value={specialReqs}
            onChange={(e) => setSpecialReqs(e.target.value)}
            rows={3}
            placeholder="Any accessibility needs, allergies, etc."
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Price Breakdown */}
        {!isFree && (
          <div className="rounded-md bg-gray-50 p-4">
            <h4 className="text-sm font-medium text-gray-900">Price Breakdown</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>
                  {adults} Adult{adults > 1 ? "s" : ""} x ${event.priceAdult.toFixed(2)}
                </span>
                <span className="font-medium">${adultTotal.toFixed(2)}</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between">
                  <span>
                    {children} Child{children > 1 ? "ren" : ""} x ${event.priceChild.toFixed(2)}
                  </span>
                  <span className="font-medium">${childTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {exceedsCapacity && (
          <p className="text-sm text-red-600" role="alert">
            Total attendees ({totalAttendees}) exceeds available spots ({spotsRemaining}).
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          disabled={exceedsCapacity}
        >
          {isFree ? "Register" : `Register & Pay $${total.toFixed(2)}`}
        </Button>

        {/* Add to Calendar */}
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Add event to Google Calendar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Add to Calendar
        </a>
      </div>
    </form>
  );
}
