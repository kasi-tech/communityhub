"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ReferrerInfo {
  name: string;
  memberNumber: string;
  memberSince: string;
}

interface ReferralLookupProps {
  applicationId: string;
  onFound: (referrer: ReferrerInfo) => void;
  onSkip?: () => void;
}

export function ReferralLookup({ applicationId, onFound, onSkip }: ReferralLookupProps) {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);

  const handleLookup = async () => {
    if (!identifier.trim()) {
      setError("Please enter a phone number or member ID");
      return;
    }

    setLoading(true);
    setError("");
    setReferrer(null);

    try {
      const res = await fetch(`/api/v1/onboarding/${applicationId}/referral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerIdentifier: identifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Referrer not found");
        return;
      }

      const found: ReferrerInfo = {
        name: data.referrer.name,
        memberNumber: data.referrer.memberNumber,
        memberSince: data.referrer.memberSince,
      };
      setReferrer(found);
      onFound(found);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-SG", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Referrer Phone Number or Member ID
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. +6591234567 or MEM-ABC123"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setError("");
            }}
            disabled={loading || !!referrer}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleLookup}
            loading={loading}
            disabled={!!referrer}
          >
            Look Up
          </Button>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Found referrer card */}
      {referrer && (
        <div className="flex items-center gap-4 rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{referrer.name}</p>
            <p className="text-xs text-gray-500">
              Member since {formatDate(referrer.memberSince)}
            </p>
          </div>
          <Badge variant="success">{referrer.memberNumber}</Badge>
        </div>
      )}

      {/* Skip option */}
      {onSkip && !referrer && (
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          I don&apos;t have a referrer — skip this step
        </button>
      )}
    </div>
  );
}
