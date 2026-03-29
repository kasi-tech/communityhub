"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { ShareButtons } from "@/components/shared/share-buttons";
import { PaymentMethods } from "@/components/shared/payment-methods";
import {
  EventRegistrationForm,
  type RegistrationData,
} from "@/components/events/event-registration-form";
import { EventGrid } from "@/components/events/event-grid";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/types";

interface EventDetailClientProps {
  event: Event;
  spotsRemaining: number;
  relatedEvents: Event[];
}

type TabId = "description" | "schedule" | "performers";

const categoryGradients: Record<string, string> = {
  Cultural: "from-purple-600 to-pink-600",
  Sports: "from-green-600 to-emerald-600",
  Entertainment: "from-orange-600 to-red-600",
  Religious: "from-amber-600 to-yellow-600",
  Social: "from-indigo-600 to-blue-600",
  AGM: "from-gray-600 to-slate-600",
  Education: "from-teal-600 to-cyan-600",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours ?? "0", 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

function parseSchedule(raw: string): ScheduleItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ScheduleItem[];
  } catch {
    // If not JSON, split by newlines
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d{1,2}:\d{2})\s*[-:]\s*(.+)$/);
        if (match) {
          return { time: match[1]!, title: match[2]! };
        }
        return { time: "", title: line };
      });
  }
  return [];
}

interface SpeakerInfo {
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
}

function parseSpeakers(raw: string[]): SpeakerInfo[] {
  return raw.map((s) => {
    try {
      const parsed = JSON.parse(s);
      return parsed as SpeakerInfo;
    } catch {
      return { name: s };
    }
  });
}

function EventDetailInner({
  event,
  spotsRemaining,
  relatedEvents,
}: EventDetailClientProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "paynow" | undefined>(
    undefined
  );
  const [pendingRegistration, setPendingRegistration] = useState<RegistrationData | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const gradient = categoryGradients[event.category] ?? "from-indigo-600 to-purple-600";
  const isFree = event.priceAdult === 0 && event.priceChild === 0;
  const isFull = spotsRemaining <= 0;
  const scheduleItems = parseSchedule(event.schedule);
  const speakers = parseSpeakers(event.speakers);

  const tabs: { id: TabId; label: string }[] = [
    { id: "description", label: "Description" },
    { id: "schedule", label: "Schedule" },
    { id: "performers", label: "Performers" },
  ];

  const handleRegister = (data: RegistrationData) => {
    setPendingRegistration(data);
    if (isFull) {
      // Waitlist flow
      submitRegistration(data, true);
      return;
    }
    if (isFree) {
      submitRegistration(data, false);
      return;
    }
    // Paid event - show payment dialog
    setShowPaymentDialog(true);
  };

  const submitRegistration = async (
    data: RegistrationData,
    isWaitlist: boolean
  ) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Please sign in",
          message: "You need to be signed in to register for events.",
          variant: "error",
        });
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/v1/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          memberId: user.id,
          attendeeAdults: data.adults,
          attendeeChildren: data.children,
          dietaryPreference: data.dietaryPreference,
          specialRequirements: data.specialRequirements,
          totalAmount: data.totalAmount,
          paymentMethod: paymentMethod,
          waitlist: isWaitlist,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Registration failed" }));
        throw new Error((err as { message?: string }).message ?? "Registration failed");
      }

      setShowPaymentDialog(false);

      if (isWaitlist) {
        toast({
          title: "Added to waitlist",
          message:
            "You have been added to the waitlist. We will notify you if a spot opens up.",
          variant: "info",
        });
      } else {
        toast({
          title: "Registration confirmed!",
          message: `You are registered for ${event.title}. Check your email for confirmation details.`,
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Registration failed",
        message:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentConfirm = () => {
    if (!pendingRegistration) return;
    submitRegistration(pendingRegistration, false);
  };

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      {/* Hero Banner */}
      <div className="relative">
        {event.coverImageUrl ? (
          <div className="h-64 w-full overflow-hidden sm:h-80 lg:h-96">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ) : (
          <div
            className={`flex h-64 items-center justify-center bg-gradient-to-br ${gradient} sm:h-80 lg:h-96`}
          />
        )}

        {/* Overlay content */}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <Badge
              variant="info"
              className="mb-2 bg-white/20 text-white backdrop-blur-sm"
            >
              {event.category}
            </Badge>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
              {/* Date */}
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4"
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
                {formatDate(event.date)}
              </span>
              {/* Time */}
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
              {/* Venue */}
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4"
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
                {event.venueName}
              </span>
              {/* Spots */}
              <span
                className={`flex items-center gap-1.5 font-medium ${
                  spotsRemaining < 20 ? "text-red-300" : "text-green-300"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {spotsRemaining === 0
                  ? "Sold out"
                  : `${spotsRemaining} spots left`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Main content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div
              className="border-b border-gray-200"
              role="tablist"
              aria-label="Event details"
            >
              <nav className="-mb-px flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab panels */}
            <div className="mt-6">
              {/* Description */}
              <div
                role="tabpanel"
                id="tabpanel-description"
                aria-labelledby="tab-description"
                hidden={activeTab !== "description"}
              >
                {activeTab === "description" && (
                  <div className="prose prose-gray max-w-none">
                    {event.description.split("\n").map((paragraph, i) => (
                      <p key={i} className="text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                    {!event.description && (
                      <p className="text-gray-500 italic">
                        No description available for this event.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div
                role="tabpanel"
                id="tabpanel-schedule"
                aria-labelledby="tab-schedule"
                hidden={activeTab !== "schedule"}
              >
                {activeTab === "schedule" && (
                  <>
                    {scheduleItems.length > 0 ? (
                      <div className="space-y-4">
                        {scheduleItems.map((item, i) => (
                          <div
                            key={i}
                            className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
                          >
                            {item.time && (
                              <div className="flex-shrink-0">
                                <span className="inline-block rounded-md bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                                  {item.time}
                                </span>
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.title}
                              </h4>
                              {item.description && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Schedule details will be announced soon.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Performers */}
              <div
                role="tabpanel"
                id="tabpanel-performers"
                aria-labelledby="tab-performers"
                hidden={activeTab !== "performers"}
              >
                {activeTab === "performers" && (
                  <>
                    {speakers.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {speakers.map((speaker, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
                          >
                            {speaker.imageUrl ? (
                              <img
                                src={speaker.imageUrl}
                                alt={speaker.name}
                                className="h-14 w-14 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                                {speaker.name
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {speaker.name}
                              </h4>
                              {speaker.role && (
                                <p className="text-sm text-indigo-600">
                                  {speaker.role}
                                </p>
                              )}
                              {speaker.bio && (
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                  {speaker.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Performer details will be announced soon.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Share this event
              </h3>
              <ShareButtons title={event.title} url={pageUrl} />
            </div>
          </div>

          {/* Right column - Registration sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <EventRegistrationForm
                event={event}
                spotsRemaining={spotsRemaining}
                onRegister={handleRegister}
                loading={submitting}
              />
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Related Events</h2>
              <Link
                href="/events"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all &rarr;
              </Link>
            </div>
            <EventGrid events={relatedEvents} />
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        title="Complete Registration"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowPaymentDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePaymentConfirm}
              loading={submitting}
              disabled={!paymentMethod}
            >
              Pay ${pendingRegistration?.totalAmount.toFixed(2) ?? "0.00"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-md bg-gray-50 p-4">
            <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
            <p className="mt-1 text-sm text-gray-500">{formatDate(event.date)}</p>
            {pendingRegistration && (
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Adults: {pendingRegistration.adults}</span>
                  <span>Children: {pendingRegistration.children}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${pendingRegistration.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Select Payment Method
            </h4>
            <PaymentMethods selected={paymentMethod} onSelect={setPaymentMethod} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

export function EventDetailClient(props: EventDetailClientProps) {
  return (
    <ToastProvider>
      <EventDetailInner {...props} />
    </ToastProvider>
  );
}
