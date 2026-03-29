"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

// ---------------------------------------------------------------------------
// Admin Check-in Page
// ---------------------------------------------------------------------------

interface CheckInLogEntry {
  id: string;
  time: string;
  memberName: string;
  method: "qr" | "manual";
  guests: number;
}

interface AttendeeResult {
  id: string;
  memberId: string;
  memberName: string;
  adults: number;
  children: number;
  checkedInAt: string | null;
}

// Placeholder events for the selector
const PLACEHOLDER_EVENTS = [
  { id: "evt-1", title: "Annual Gala 2025 - Today" },
  { id: "evt-2", title: "Music Night - Tomorrow" },
  { id: "evt-3", title: "Food Festival - This Weekend" },
];

export default function CheckinPage() {
  const { toast } = useToast();

  const [selectedEvent, setSelectedEvent] = useState(PLACEHOLDER_EVENTS[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [totalRegistered] = useState(42);
  const [checkInLog, setCheckInLog] = useState<CheckInLogEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Simulated attendee search results
  const [searchResults, setSearchResults] = useState<AttendeeResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const addToLog = useCallback(
    (memberName: string, method: "qr" | "manual", guests: number) => {
      const entry: CheckInLogEntry = {
        id: crypto.randomUUID(),
        time: new Date().toLocaleTimeString(),
        memberName,
        method,
        guests,
      };
      setCheckInLog((prev) => [entry, ...prev]);
      setCheckedInCount((prev) => prev + 1);
    },
    [],
  );

  const handleSimulateScan = useCallback(() => {
    setIsScanning(true);
    // Simulate a QR scan with a short delay
    setTimeout(() => {
      const simulatedName = "Rajesh Kumar";
      addToLog(simulatedName, "qr", 2);
      toast({
        title: "Check-in Successful",
        message: `${simulatedName} checked in via QR scan`,
        variant: "success",
      });
      setIsScanning(false);
    }, 800);
  }, [addToLog, toast]);

  const handleManualCheckin = useCallback(
    async (registration: AttendeeResult) => {
      if (registration.checkedInAt) {
        toast({
          title: "Already Checked In",
          message: `${registration.memberName} was already checked in`,
          variant: "info",
        });
        return;
      }

      try {
        // In production: POST /api/v1/registrations/{id}/checkin
        addToLog(
          registration.memberName,
          "manual",
          registration.adults + registration.children - 1,
        );
        toast({
          title: "Check-in Successful",
          message: `${registration.memberName} checked in manually`,
          variant: "success",
        });

        // Mark as checked in locally
        setSearchResults((prev) =>
          prev.map((r) =>
            r.id === registration.id
              ? { ...r, checkedInAt: new Date().toISOString() }
              : r,
          ),
        );
      } catch {
        toast({
          title: "Check-in Failed",
          message: "An error occurred. Please try again.",
          variant: "error",
        });
      }
    },
    [addToLog, toast],
  );

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);

    // Simulate search results
    setTimeout(() => {
      setSearchResults([
        {
          id: "reg-1",
          memberId: "m-1",
          memberName: "Priya Sharma",
          adults: 2,
          children: 1,
          checkedInAt: null,
        },
        {
          id: "reg-2",
          memberId: "m-2",
          memberName: "Srinivas Reddy",
          adults: 1,
          children: 0,
          checkedInAt: null,
        },
        {
          id: "reg-3",
          memberId: "m-3",
          memberName: "Padma Lakshmi",
          adults: 2,
          children: 2,
          checkedInAt: "2025-03-29T10:00:00Z",
        },
      ]);
      setSearchLoading(false);
    }, 500);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Check-in</h1>
        <p className="mt-1 text-sm text-gray-500">
          Scan QR codes or manually check in attendees
        </p>
      </div>

      {/* Event Selector */}
      <div className="w-full max-w-sm">
        <label
          htmlFor="event-select"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Select Event
        </label>
        <select
          id="event-select"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {PLACEHOLDER_EVENTS.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {checkedInCount}{" "}
                  <span className="text-lg font-normal text-gray-500">
                    / {totalRegistered}
                  </span>
                </p>
                <p className="text-sm text-gray-500">Checked In</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-lg font-semibold text-gray-700">
                {totalRegistered - checkedInCount}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
              style={{
                width: `${totalRegistered > 0 ? (checkedInCount / totalRegistered) * 100 : 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Two-column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: QR Scan Area */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              QR Code Scanner
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Camera placeholder */}
              <div className="flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    Scan QR
                  </p>
                  <p className="text-xs text-gray-400">
                    Point camera at attendee&apos;s QR code
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="mt-4 w-full"
                onClick={handleSimulateScan}
                loading={isScanning}
              >
                {isScanning ? "Scanning..." : "Simulate Scan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Manual Check-in */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Manual Check-in
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or member ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleSearch}
                loading={searchLoading}
              >
                Search
              </Button>
            </div>

            {/* Search Results */}
            <div className="mt-4 space-y-2">
              {searchResults.length === 0 && searchQuery && !searchLoading && (
                <p className="py-4 text-center text-sm text-gray-400">
                  No results found
                </p>
              )}
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {result.memberName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {result.adults} adults, {result.children} children
                    </p>
                  </div>
                  {result.checkedInAt ? (
                    <Badge variant="success">Checked In</Badge>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleManualCheckin(result)}
                    >
                      Check In
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-in Log */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Check-in Log
          </h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Check-in log">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Guests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {checkInLog.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No check-ins yet. Start scanning or searching to check in
                    attendees.
                  </td>
                </tr>
              ) : (
                checkInLog.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 text-gray-700">
                      {entry.time}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {entry.memberName}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          entry.method === "qr" ? "info" : "gray"
                        }
                      >
                        {entry.method === "qr" ? "QR Scan" : "Manual"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {entry.guests}
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
