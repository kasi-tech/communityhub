import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RegistrationActions } from "./registration-actions";

// ---------------------------------------------------------------------------
// Registration Confirmation / Detail Page — Server Component
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-SG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const parts = timeStr.split(":");
  const h = parts[0] ?? "0";
  const m = parts[1] ?? "00";
  const hour = parseInt(h, 10);
  const amPm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${amPm}`;
}

function getStatusVariant(
  status: string,
): "success" | "warning" | "danger" | "info" | "gray" {
  switch (status) {
    case "confirmed":
      return "success";
    case "waitlisted":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "gray";
  }
}

function buildGoogleCalendarUrl(event: {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_address: string;
}): string {
  // Format: YYYYMMDDTHHMMSS
  const startDt =
    event.date.replace(/-/g, "") +
    "T" +
    event.start_time.replace(/:/g, "").slice(0, 6);
  const endDt =
    event.date.replace(/-/g, "") +
    "T" +
    event.end_time.replace(/:/g, "").slice(0, 6);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDt}/${endDt}`,
    location: `${event.venue_name}, ${event.venue_address}`,
    ctz: "Asia/Singapore",
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

function buildIcsContent(event: {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_address: string;
}): string {
  const startDt =
    event.date.replace(/-/g, "") +
    "T" +
    event.start_time.replace(/:/g, "").padEnd(6, "0");
  const endDt =
    event.date.replace(/-/g, "") +
    "T" +
    event.end_time.replace(/:/g, "").padEnd(6, "0");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CommunityHub//EN",
    "BEGIN:VEVENT",
    `DTSTART;TZID=Asia/Singapore:${startDt}`,
    `DTEND;TZID=Asia/Singapore:${endDt}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.venue_name}, ${event.venue_address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default async function RegistrationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const user = await getCurrentUser(supabase);
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch registration with event details
  const { data: registration, error } = await supabase
    .from("registrations")
    .select(
      `
      id,
      event_id,
      member_id,
      status,
      attendee_adults,
      attendee_children,
      dietary_preference,
      special_requirements,
      total_amount,
      waitlist_position,
      checked_in_at,
      created_at,
      events (
        id,
        title,
        date,
        start_time,
        end_time,
        venue_name,
        venue_address,
        category,
        cover_image_url
      )
    `,
    )
    .eq("id", id)
    .eq("member_id", user.memberId)
    .single();

  if (error || !registration) {
    notFound();
  }

  const event = registration.events as unknown as {
    id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    venue_name: string;
    venue_address: string;
    category: string;
    cover_image_url: string | null;
  };

  if (!event) {
    notFound();
  }

  // Fetch payment info
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, currency, status, provider")
    .eq("registration_id", id)
    .eq("status", "completed");

  const totalPaid =
    payments?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;
  const paymentCurrency = payments?.[0]?.currency ?? "SGD";

  const totalAttendees =
    (registration.attendee_adults ?? 0) +
    (registration.attendee_children ?? 0);

  const googleCalUrl = buildGoogleCalendarUrl(event);
  const icsContent = buildIcsContent(event);
  const icsDataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${event.id}`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/events/${event.id}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/dashboard/registrations"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <svg
          className="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Registrations
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Registration #{registration.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Badge variant={getStatusVariant(registration.status)}>
            {registration.status.charAt(0).toUpperCase() +
              registration.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Event Details Card */}
      <Card className="mb-6">
        <CardContent className="space-y-4 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-gray-900">{formatDate(event.date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time</p>
              <p className="text-gray-900">
                {formatTime(event.start_time)} &ndash;{" "}
                {formatTime(event.end_time)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Venue</p>
              <p className="text-gray-900">{event.venue_name}</p>
              <p className="text-sm text-gray-500">{event.venue_address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Attendees</p>
              <p className="text-gray-900">
                {totalAttendees} ({registration.attendee_adults ?? 0} adult
                {(registration.attendee_adults ?? 0) !== 1 ? "s" : ""}
                {(registration.attendee_children ?? 0) > 0
                  ? `, ${registration.attendee_children} child${(registration.attendee_children ?? 0) !== 1 ? "ren" : ""}`
                  : ""}
                )
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Paid</p>
              <p className="text-gray-900">
                {paymentCurrency} {totalPaid.toFixed(2)}
              </p>
            </div>
            {registration.waitlist_position && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Waitlist Position
                </p>
                <p className="text-gray-900">
                  #{registration.waitlist_position}
                </p>
              </div>
            )}
          </div>

          {registration.dietary_preference && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Dietary Preference
              </p>
              <p className="text-gray-900">
                {registration.dietary_preference}
              </p>
            </div>
          )}

          {registration.special_requirements && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Special Requirements
              </p>
              <p className="text-gray-900">
                {registration.special_requirements}
              </p>
            </div>
          )}

          {registration.checked_in_at && (
            <div>
              <p className="text-sm font-medium text-gray-500">Checked In</p>
              <p className="text-gray-900">
                {new Date(registration.checked_in_at).toLocaleString("en-SG")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code for Check-in */}
      {registration.status === "confirmed" && (
        <Card className="mb-6">
          <CardContent className="py-6 text-center">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Check-in QR Code
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Show this QR code at the event entrance
            </p>
            {/* QR code rendered via a public QR API — the data encodes the registration ID */}
            <div className="mx-auto w-fit rounded-lg bg-white p-4 shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registration.id)}`}
                alt="Registration QR Code"
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              ID: {registration.id.slice(0, 8).toUpperCase()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Add to Calendar */}
        <a href={googleCalUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Google Calendar
          </Button>
        </a>

        <a href={icsDataUri} download={`${event.title}.ics`}>
          <Button variant="secondary" size="sm">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download .ics
          </Button>
        </a>

        {/* Share buttons */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Check out ${event.title}: ${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary" size="sm">
            Share on WhatsApp
          </Button>
        </a>

        <a
          href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`I'm attending ${event.title} on ${formatDate(event.date)}. Details: ${shareUrl}`)}`}
        >
          <Button variant="secondary" size="sm">
            Share via Email
          </Button>
        </a>
      </div>

      {/* Cancel Registration (client component) */}
      {registration.status === "confirmed" && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <RegistrationActions registrationId={registration.id} />
        </div>
      )}
    </div>
  );
}
