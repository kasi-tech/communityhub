"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ToastProvider, useToast } from "@/components/ui/toast";

const SKILLS = [
  "Event Setup",
  "Photography",
  "Cooking/Catering",
  "MC/Hosting",
  "Sound/AV",
  "Transport",
  "Design/Creative",
  "Teaching/Tutoring",
];

const AVAILABILITY = [
  "Weekday Evenings",
  "Saturdays",
  "Sundays",
  "Public Holidays",
];

function VolunteerPageContent() {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    [],
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "error" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "error" });
      return;
    }
    if (!phone.trim()) {
      toast({ title: "Please enter your phone number", variant: "error" });
      return;
    }
    if (selectedSkills.length === 0) {
      toast({ title: "Please select at least one skill", variant: "error" });
      return;
    }
    if (selectedAvailability.length === 0) {
      toast({
        title: "Please select at least one availability option",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          skills: selectedSkills,
          availability: selectedAvailability,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Registration failed",
          message: data.error?.message ?? "Something went wrong",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Registration successful!",
        message:
          "Thank you for volunteering. We will be in touch with opportunities.",
        variant: "success",
      });

      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setSelectedSkills([]);
      setSelectedAvailability([]);
      setNotes("");
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Volunteer With Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/90">
          Join our team of dedicated volunteers and help make our community
          events memorable. Every contribution counts!
        </p>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="space-y-6 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Volunteer Registration
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+65 9123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Skills */}
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-700">
                  Skills
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SKILLS.map((skill) => (
                    <label
                      key={skill}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-colors ${
                        selectedSkills.includes(skill)
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() =>
                          toggleItem(selectedSkills, setSelectedSkills, skill)
                        }
                        className="sr-only"
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Availability */}
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-700">
                  Availability
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY.map((slot) => (
                    <label
                      key={slot}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-colors ${
                        selectedAvailability.includes(slot)
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(slot)}
                        onChange={() =>
                          toggleItem(
                            selectedAvailability,
                            setSelectedAvailability,
                            slot,
                          )
                        }
                        className="sr-only"
                      />
                      {slot}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Notes */}
              <div>
                <label
                  htmlFor="volunteer-notes"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Additional Notes (optional)
                </label>
                <textarea
                  id="volunteer-notes"
                  rows={3}
                  placeholder="Any additional information you'd like to share..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus-visible:ring-purple-300"
              >
                Register as Volunteer
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function VolunteerPage() {
  return (
    <ToastProvider>
      <VolunteerPageContent />
    </ToastProvider>
  );
}
