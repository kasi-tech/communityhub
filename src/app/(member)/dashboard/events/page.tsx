"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { QrCode } from "@/components/shared/qr-code";

// ---------------------------------------------------------------------------
// My Events — Client Component
// ---------------------------------------------------------------------------

interface EventRegistration {
  registrationId: string;
  status: string;
  totalAmount: number;
  checkedInAt: string | null;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    venueName: string;
    venueAddress: string;
    category: string;
    coverImageUrl: string | null;
  } | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-SG", {
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
  return `${h % 12 || 12}:${minutes} ${ampm}`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return <Badge variant="success">Confirmed</Badge>;
    case "waitlisted":
      return <Badge variant="warning">Waitlisted</Badge>;
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
}

function getRefundPolicy(eventDate: string): {
  percentage: number;
  label: string;
  variant: "success" | "warning" | "danger";
} {
  const eventDay = new Date(eventDate + "T00:00:00");
  const now = new Date();
  const diffDays = Math.ceil(
    (eventDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 7) {
    return { percentage: 100, label: "Full refund (more than 7 days before event)", variant: "success" };
  } else if (diffDays >= 3) {
    return { percentage: 50, label: "50% refund (3-7 days before event)", variant: "warning" };
  } else {
    return { percentage: 0, label: "No refund (less than 3 days before event)", variant: "danger" };
  }
}

const CANCEL_REASONS = [
  "Schedule conflict",
  "Personal reasons",
  "Financial reasons",
  "Found a better alternative",
  "Health issues",
  "Other",
];

export default function MyEventsPage() {
  const { toast } = useToast();

  const [upcoming, setUpcoming] = useState<EventRegistration[]>([]);
  const [past, setPast] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrRegistration, setQrRegistration] = useState<EventRegistration | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelRegistration, setCancelRegistration] = useState<EventRegistration | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackRegistration, setFeedbackRegistration] = useState<EventRegistration | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackEnjoy, setFeedbackEnjoy] = useState("");
  const [feedbackImprove, setFeedbackImprove] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the current member ID from session
      const memberRes = await fetch("/api/v1/members/me");
      let memberId: string;
      if (memberRes.ok) {
        const memberData = await memberRes.json();
        memberId = memberData.data?.id;
      } else {
        // Fallback: get memberId from the upcoming endpoint which uses auth
        // We need the member ID for the API calls
        // Try fetching without explicit ID — use a special route or parse from session
        throw new Error("Could not determine member ID");
      }

      const [upRes, pastRes] = await Promise.all([
        fetch(`/api/v1/members/${memberId}/events?status=upcoming`),
        fetch(`/api/v1/members/${memberId}/events?status=past`),
      ]);

      if (!upRes.ok || !pastRes.ok) {
        throw new Error("Failed to fetch events");
      }

      const upData = await upRes.json();
      const pastData = await pastRes.json();

      setUpcoming(upData.data ?? []);
      setPast(pastData.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleCancel() {
    if (!cancelRegistration) return;
    setCancelling(true);
    try {
      const res = await fetch(
        `/api/v1/registrations/${cancelRegistration.registrationId}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: cancelReason }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message ?? "Failed to cancel registration");
      }

      toast({
        title: "Registration cancelled",
        message: "Your cancellation has been processed.",
        variant: "success",
      });

      setCancelDialogOpen(false);
      setCancelRegistration(null);
      setCancelReason("");
      fetchEvents();
    } catch (err) {
      toast({
        title: "Cancellation failed",
        message: err instanceof Error ? err.message : "Please try again later.",
        variant: "error",
      });
    } finally {
      setCancelling(false);
    }
  }

  async function handleFeedbackSubmit() {
    if (!feedbackRegistration || feedbackRating === 0) return;
    setSubmittingFeedback(true);
    try {
      // For now, just show a success toast (endpoint can be added later)
      toast({
        title: "Thank you for your feedback!",
        message: `You rated this event ${feedbackRating}/5 stars.`,
        variant: "success",
      });

      setFeedbackDialogOpen(false);
      setFeedbackRegistration(null);
      setFeedbackRating(0);
      setFeedbackEnjoy("");
      setFeedbackImprove("");
    } catch {
      toast({
        title: "Failed to submit feedback",
        message: "Please try again later.",
        variant: "error",
      });
    } finally {
      setSubmittingFeedback(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={fetchEvents}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Events</h1>

      {/* Upcoming Events */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Upcoming Events ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-gray-500">
                You have no upcoming events. Browse events to register.
              </p>
              <a href="/events">
                <Button variant="primary" size="sm" className="mt-4">
                  Browse Events
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-medium text-gray-600">Event</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {upcoming.map((reg) => (
                    <tr key={reg.registrationId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <a
                          href={`/events/${reg.event?.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {reg.event?.title ?? "Unknown Event"}
                        </a>
                        <p className="text-xs text-gray-500">{reg.event?.venueName}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {reg.event?.date ? formatDate(reg.event.date) : "---"}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(reg.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {reg.status === "confirmed" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setQrRegistration(reg);
                                setQrDialogOpen(true);
                              }}
                            >
                              QR Code
                            </Button>
                          )}
                          {reg.status !== "cancelled" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setCancelRegistration(reg);
                                setCancelReason("");
                                setCancelDialogOpen(true);
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Past Events */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Past Events ({past.length})
        </h2>
        {past.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-gray-500">No past events yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-medium text-gray-600">Event</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {past.map((reg) => (
                    <tr key={reg.registrationId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {reg.event?.title ?? "Unknown Event"}
                        </span>
                        <p className="text-xs text-gray-500">{reg.event?.venueName}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {reg.event?.date ? formatDate(reg.event.date) : "---"}
                      </td>
                      <td className="px-4 py-3">
                        {reg.checkedInAt ? (
                          <Badge variant="gray">Attended</Badge>
                        ) : (
                          getStatusBadge(reg.status)
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setFeedbackRegistration(reg);
                              setFeedbackRating(0);
                              setFeedbackEnjoy("");
                              setFeedbackImprove("");
                              setFeedbackDialogOpen(true);
                            }}
                          >
                            Give Feedback
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            View Photos
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        title="Check-in QR Code"
      >
        <div className="flex flex-col items-center py-4">
          <p className="mb-4 text-sm text-gray-500">
            Show this QR code at the event entrance for{" "}
            <strong>{qrRegistration?.event?.title}</strong>.
          </p>
          {qrRegistration && (
            <QrCode
              data={qrRegistration.registrationId}
              size={220}
              label={`Registration #${qrRegistration.registrationId.slice(0, 8).toUpperCase()}`}
            />
          )}
        </div>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        title="Cancel Registration"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Registration
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={cancelling}
              disabled={!cancelReason}
              onClick={handleCancel}
            >
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel your registration for{" "}
            <strong>{cancelRegistration?.event?.title}</strong>?
          </p>

          {/* Refund Policy */}
          {cancelRegistration?.event?.date && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-700">Refund Policy</p>
              {(() => {
                const policy = getRefundPolicy(cancelRegistration.event.date);
                return (
                  <Badge variant={policy.variant} className="mt-1">
                    {policy.label}
                  </Badge>
                );
              })()}
            </div>
          )}

          {/* Reason */}
          <div>
            <label
              htmlFor="cancel-reason"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Reason for cancellation
            </label>
            <select
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Select a reason</option>
              {CANCEL_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        title="Event Feedback"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFeedbackDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={submittingFeedback}
              disabled={feedbackRating === 0}
              onClick={handleFeedbackSubmit}
            >
              Submit Feedback
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            How was <strong>{feedbackRegistration?.event?.title}</strong>?
          </p>

          {/* Star Rating */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Your Rating
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className={`rounded p-1 text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                    star <= feedbackRating
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  {"\u2605"}
                </button>
              ))}
            </div>
          </div>

          {/* What did you enjoy? */}
          <div>
            <label
              htmlFor="feedback-enjoy"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              What did you enjoy?
            </label>
            <textarea
              id="feedback-enjoy"
              rows={2}
              value={feedbackEnjoy}
              onChange={(e) => setFeedbackEnjoy(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Tell us what you liked..."
            />
          </div>

          {/* What to improve? */}
          <div>
            <label
              htmlFor="feedback-improve"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              What could be improved?
            </label>
            <textarea
              id="feedback-improve"
              rows={2}
              value={feedbackImprove}
              onChange={(e) => setFeedbackImprove(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Suggestions for improvement..."
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
