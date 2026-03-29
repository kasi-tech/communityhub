"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

// ---------------------------------------------------------------------------
// Profile Management — Client Component
// ---------------------------------------------------------------------------

const INTEREST_OPTIONS = [
  "Cultural Events",
  "Sports",
  "Music",
  "Dance",
  "Movies",
  "Volunteering",
  "Religious",
  "Travel",
];

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const RESIDENTIAL_STATUS_OPTIONS = [
  "Citizen",
  "Permanent Resident",
  "Employment Pass",
  "S Pass",
  "Work Permit",
  "Dependent Pass",
  "Student Pass",
  "Long Term Visit Pass",
  "Other",
];

interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  nationality: string;
  postalCode: string;
  residentialStatus?: string;
  interests: string[];
}

export default function ProfilePage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [memberId, setMemberId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [residentialStatus, setResidentialStatus] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  // Notification preferences (local state for now)
  const [emailReminders, setEmailReminders] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [whatsappMessages, setWhatsappMessages] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const meRes = await fetch("/api/v1/members/me");
        if (!meRes.ok) throw new Error("Not authenticated");
        const meData = await meRes.json();
        const id = meData.data?.id;
        if (!id) throw new Error("Member not found");

        const res = await fetch(`/api/v1/members/${id}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        const m = data.data;

        setMemberId(m.id);
        setName(m.name ?? "");
        setEmail(m.email ?? "");
        setPhone(m.phone ?? "");
        setDob(m.dob ?? "");
        setGender(m.gender ?? "");
        setNationality(m.nationality ?? "");
        setPostalCode(m.postalCode ?? "");
        setResidentialStatus(m.residentialStatus ?? "");
        setInterests(m.interests ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          dob,
          gender,
          nationality,
          postalCode,
          residentialStatus,
          interests,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message ?? "Failed to save changes");
      }

      toast({
        title: "Profile updated",
        message: "Your changes have been saved successfully.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        message: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <Button variant="primary" loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
            <Input
              label="Email"
              value={email}
              disabled
              hint="Email cannot be changed"
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+65 XXXX XXXX"
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <div>
              <label
                htmlFor="gender"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g. Singaporean"
            />
            <Input
              label="Postal Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 123456"
            />
            <div>
              <label
                htmlFor="residential-status"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Residential Status
              </label>
              <select
                id="residential-status"
                value={residentialStatus}
                onChange={(e) => setResidentialStatus(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select status</option>
                {RESIDENTIAL_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Interests</h2>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-500">
            Select topics you are interested in to get personalized recommendations.
          </p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                    selected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-pressed={selected}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Notification Preferences
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="Email reminders"
            description="Receive event reminders and updates via email"
            checked={emailReminders}
            onChange={setEmailReminders}
          />
          <ToggleRow
            label="Push notifications"
            description="Get browser push notifications for important updates"
            checked={pushNotifications}
            onChange={setPushNotifications}
          />
          <ToggleRow
            label="WhatsApp messages"
            description="Receive event reminders via WhatsApp"
            checked={whatsappMessages}
            onChange={setWhatsappMessages}
          />
        </CardContent>
      </Card>

      {/* Mobile Save */}
      <div className="flex justify-end pb-8 sm:hidden">
        <Button variant="primary" loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle Row sub-component
// ---------------------------------------------------------------------------

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 ${
          checked ? "bg-indigo-500" : "bg-gray-200"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
