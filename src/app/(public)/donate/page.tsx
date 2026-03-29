"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentMethods } from "@/components/shared/payment-methods";
import { ToastProvider, useToast } from "@/components/ui/toast";

interface DonorWallEntry {
  id: string;
  donor_name: string;
  amount: number;
  message: string;
  created_at: string;
}

const SUGGESTED_AMOUNTS = [10, 25, 50, 100];

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function DonatePageContent() {
  const { toast } = useToast();

  // Form state
  const [amount, setAmount] = useState<number | "">("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showOnWall, setShowOnWall] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "paynow">();
  const [submitting, setSubmitting] = useState(false);

  // Donor wall state
  const [donations, setDonations] = useState<DonorWallEntry[]>([]);
  const [totalThisYear, setTotalThisYear] = useState(0);
  const [loadingWall, setLoadingWall] = useState(true);

  const fetchDonorWall = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/donations");
      if (res.ok) {
        const json = await res.json();
        setDonations(json.data ?? []);
        setTotalThisYear(json.totalThisYear ?? 0);
      }
    } catch {
      // Silently fail — wall is non-critical
    } finally {
      setLoadingWall(false);
    }
  }, []);

  useEffect(() => {
    fetchDonorWall();
  }, [fetchDonorWall]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!amount || amount < 1) {
      toast({ title: "Please enter a valid amount", variant: "error" });
      return;
    }
    if (!donorName.trim()) {
      toast({ title: "Please enter your name", variant: "error" });
      return;
    }
    if (!donorEmail.trim() || !donorEmail.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "error" });
      return;
    }
    if (!paymentMethod) {
      toast({ title: "Please select a payment method", variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          amount,
          message: message.trim() || undefined,
          showOnWall,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Donation failed",
          message: data.error?.message ?? "Something went wrong",
          variant: "error",
        });
        return;
      }

      // Handle payment flow
      if (data.approvalUrl) {
        // PayPal — redirect to approval URL
        window.location.href = data.approvalUrl;
        return;
      }

      if (data.qrCodeData) {
        // PayNow — show info message (QR would be displayed in a real flow)
        toast({
          title: "QR Code Generated",
          message: "Please complete payment using the PayNow QR code.",
          variant: "info",
        });
      }

      // Confirm payment (for demo / simple flow)
      const confirmRes = await fetch(`/api/v1/donations/${data.donationId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: data.paymentId }),
      });

      if (confirmRes.ok) {
        toast({
          title: "Thank you for your donation!",
          message: `Your $${amount} donation has been received.`,
          variant: "success",
        });

        // Reset form
        setAmount("");
        setDonorName("");
        setDonorEmail("");
        setMessage("");
        setShowOnWall(true);
        setPaymentMethod(undefined);

        // Refresh donor wall
        fetchDonorWall();
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Support Our Community</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/90">
          Your generous donations help us organize events, support community
          programs, and make a lasting impact.
        </p>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left — Donation Form (3 cols) */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="space-y-6 p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Make a Donation
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Suggested amounts */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Select Amount
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_AMOUNTS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAmount(a)}
                          className={`rounded-lg border-2 px-5 py-2 text-sm font-medium transition-colors ${
                            amount === a
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          ${a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom amount */}
                  <Input
                    label="Custom Amount ($)"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="Enter amount"
                    value={amount === "" ? "" : amount}
                    onChange={(e) =>
                      setAmount(e.target.value ? Number(e.target.value) : "")
                    }
                  />

                  <Input
                    label="Your Name"
                    placeholder="John Doe"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    required
                  />

                  {/* Show on wall checkbox */}
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={showOnWall}
                      onChange={(e) => setShowOnWall(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                    />
                    Show my name on the Donor Wall
                  </label>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="donation-message"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Message (optional)
                    </label>
                    <textarea
                      id="donation-message"
                      rows={3}
                      placeholder="Leave a message of support..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Payment Method
                    </label>
                    <PaymentMethods
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    loading={submitting}
                    className="w-full"
                  >
                    Donate{amount ? ` $${amount}` : ""}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right — Donor Wall (2 cols) */}
          <div className="lg:col-span-2">
            {/* Total donated stat */}
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-green-700">
                  Total Donated This Year
                </p>
                <p className="mt-1 text-3xl font-bold text-green-800">
                  ${totalThisYear.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Donor Wall */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Donor Wall
              </h3>

              {loadingWall ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-lg bg-gray-100"
                    />
                  ))}
                </div>
              ) : donations.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Be the first to donate and appear on our wall!
                </p>
              ) : (
                <div className="space-y-3">
                  {donations.map((d) => (
                    <Card key={d.id}>
                      <CardContent className="flex items-center gap-3 p-4">
                        {/* Avatar circle */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                          {d.donor_name
                            ? d.donor_name.charAt(0).toUpperCase()
                            : "A"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {d.donor_name || "Anonymous"}
                            </p>
                            <p className="shrink-0 text-sm font-semibold text-green-600">
                              ${d.amount}
                            </p>
                          </div>
                          {d.message && (
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {d.message}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-gray-400">
                            {relativeTime(d.created_at)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DonatePage() {
  return (
    <ToastProvider>
      <DonatePageContent />
    </ToastProvider>
  );
}
