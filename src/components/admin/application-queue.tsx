"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FraudScoreBar } from "@/components/admin/fraud-score-bar";
import type { Application } from "@/types";

interface ApplicationQueueRowProps {
  application: Application;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function getReferrerBadge(confirmed: boolean, memberId: string | null) {
  if (!memberId) return { variant: "gray" as const, label: "None" };
  if (confirmed) return { variant: "success" as const, label: "Confirmed" };
  return { variant: "warning" as const, label: "Pending" };
}

export function ApplicationQueueRow({
  application,
  onApprove,
  onReject,
}: ApplicationQueueRowProps) {
  const stepData = application.stepData as Record<string, unknown>;
  const name = (stepData.name as string) ?? application.email;
  const referrerBadge = getReferrerBadge(
    application.referrerConfirmed,
    application.referrerMemberId,
  );
  const tierName = (stepData.tier_name as string) ?? (stepData.tier_id as string) ?? "—";
  const isPending = application.status === "submitted" || application.status === "under_review";

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{application.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{application.phone || "—"}</td>
      <td className="px-4 py-3">
        <Badge variant={referrerBadge.variant}>{referrerBadge.label}</Badge>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{tierName}</td>
      <td className="px-4 py-3">
        <FraudScoreBar score={application.fraudScore} />
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
        {new Date(application.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        {isPending ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="success"
              onClick={() => onApprove(application.id)}
              aria-label={`Approve application from ${name}`}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onReject(application.id)}
              aria-label={`Reject application from ${name}`}
            >
              Reject
            </Button>
          </div>
        ) : (
          <Badge variant={application.status === "approved" ? "success" : "danger"}>
            {application.status}
          </Badge>
        )}
      </td>
    </tr>
  );
}
