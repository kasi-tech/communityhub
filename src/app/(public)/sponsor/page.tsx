"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToastProvider, useToast } from "@/components/ui/toast";

interface SponsorPackage {
  id: "bronze" | "silver" | "gold";
  name: string;
  price: number;
  highlight: boolean;
  benefits: string[];
}

const PACKAGES: SponsorPackage[] = [
  {
    id: "bronze",
    name: "Bronze",
    price: 500,
    highlight: false,
    benefits: [
      "Logo on community website",
      "Mention in 2 event programs",
      "Social media shoutout",
      "Certificate of appreciation",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: 1000,
    highlight: true,
    benefits: [
      "All Bronze benefits",
      "Logo on event banners",
      "Booth at 2 major events",
      "Monthly newsletter feature",
      "Priority event invitations",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 2500,
    highlight: false,
    benefits: [
      "All Silver benefits",
      "Premium logo placement",
      "Booth at all major events",
      "Speaking slot at annual gala",
      "Dedicated social media campaign",
      "VIP seating at all events",
    ],
  },
];

const PACKAGE_OPTIONS = [
  { value: "bronze", label: "Bronze ($500)" },
  { value: "silver", label: "Silver ($1,000)" },
  { value: "gold", label: "Gold ($2,500)" },
  { value: "custom", label: "Custom Package" },
];

function SponsorPageContent() {
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!companyName.trim()) {
      toast({ title: "Please enter your company name", variant: "error" });
      return;
    }
    if (!contactPerson.trim()) {
      toast({ title: "Please enter a contact person", variant: "error" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "error" });
      return;
    }
    if (!phone.trim()) {
      toast({ title: "Please enter a phone number", variant: "error" });
      return;
    }
    if (!selectedPackage) {
      toast({ title: "Please select a sponsorship package", variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/sponsors/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactPerson: contactPerson.trim(),
          email: email.trim(),
          phone: phone.trim(),
          package: selectedPackage,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Inquiry failed",
          message: data.error?.message ?? "Something went wrong",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Inquiry submitted!",
        message:
          "Thank you for your interest. Our team will contact you shortly.",
        variant: "success",
      });

      // Reset form
      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setSelectedPackage("");
      setMessage("");
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-500 to-red-500 px-4 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Become a Sponsor</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/90">
          Partner with our community of 1,200+ members. Gain visibility,
          build goodwill, and support meaningful cultural events.
        </p>
      </section>

      {/* Sponsorship Packages */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Sponsorship Packages
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${
                pkg.highlight
                  ? "border-2 border-amber-400 shadow-lg"
                  : ""
              }`}
            >
              {pkg.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="warning" className="px-3 py-1 text-xs">
                    Best Value
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {pkg.name}
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ${pkg.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">per year</p>

                <ul className="mt-6 space-y-3 text-left">
                  {pkg.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={pkg.highlight ? "primary" : "secondary"}
                  size="md"
                  className="mt-6 w-full"
                  onClick={() => {
                    setSelectedPackage(pkg.id);
                    document
                      .getElementById("inquiry-form")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Select {pkg.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Inquiry Form */}
      <section
        id="inquiry-form"
        className="bg-gray-50 px-4 py-12"
      >
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="space-y-6 p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Sponsorship Inquiry
              </h2>
              <p className="text-sm text-gray-500">
                Fill out the form below and our partnerships team will get back
                to you within 2 business days.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Company Name"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />

                <Input
                  label="Contact Person"
                  placeholder="Jane Smith"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="jane@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+65 9123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                {/* Package select */}
                <div>
                  <label
                    htmlFor="sponsor-package"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Interested Package
                  </label>
                  <select
                    id="sponsor-package"
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  >
                    <option value="">Select a package</option>
                    {PACKAGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="sponsor-message"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Message (optional)
                  </label>
                  <textarea
                    id="sponsor-message"
                    rows={4}
                    placeholder="Tell us about your sponsorship goals..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full"
                >
                  Submit Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Current Sponsors */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Our Sponsors
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex h-24 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
            >
              <span className="text-sm text-gray-400">Sponsor Logo</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          Your logo could be here. Get in touch to learn more about sponsorship
          opportunities.
        </p>
      </section>
    </div>
  );
}

export default function SponsorPage() {
  return (
    <ToastProvider>
      <SponsorPageContent />
    </ToastProvider>
  );
}
