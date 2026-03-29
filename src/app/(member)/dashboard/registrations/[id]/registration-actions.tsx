"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RegistrationActionsProps {
  registrationId: string;
}

export function RegistrationActions({
  registrationId,
}: RegistrationActionsProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setCancelling(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/v1/registrations/${registrationId}/cancel`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message ?? "Failed to cancel registration");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel registration",
      );
    } finally {
      setCancelling(false);
      setShowConfirm(false);
    }
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="ghost" size="sm" onClick={() => setError(null)}>
          Dismiss
        </Button>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Are you sure you want to cancel this registration? This action cannot
          be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={cancelling}
          >
            Keep Registration
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="border-red-300 bg-red-600 text-white hover:bg-red-700"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Yes, Cancel Registration"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700"
      onClick={() => setShowConfirm(true)}
    >
      Cancel Registration
    </Button>
  );
}
