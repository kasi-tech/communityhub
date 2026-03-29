"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ApplicationQueueRow } from "@/components/admin/application-queue";
import type { Application } from "@/types";

const REJECTION_REASONS = [
  "Incomplete application",
  "Failed verification",
  "Duplicate application",
  "Suspected fraud",
  "Does not meet eligibility criteria",
  "Other",
];

export default function AdminApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]!);
  const [rejectNotes, setRejectNotes] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/applications?status=pending&sort=created_at");
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      setApplications(json.data ?? []);
    } catch {
      toast({ title: "Error", message: "Failed to load applications", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/admin/applications/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Approve failed");
      toast({ title: "Approved", message: "Application has been approved", variant: "success" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast({ title: "Error", message: "Failed to approve application", variant: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget);
    try {
      const res = await fetch(`/api/v1/admin/applications/${rejectTarget}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason, notes: rejectNotes }),
      });
      if (!res.ok) throw new Error("Reject failed");
      toast({ title: "Rejected", message: "Application has been rejected", variant: "success" });
      setApplications((prev) => prev.filter((a) => a.id !== rejectTarget));
    } catch {
      toast({ title: "Error", message: "Failed to reject application", variant: "error" });
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
      setRejectReason(REJECTION_REASONS[0]!);
      setRejectNotes("");
    }
  };

  const handleBulkApprove = async () => {
    const lowRisk = applications.filter((a) => a.fraudScore < 30);
    if (lowRisk.length === 0) {
      toast({ title: "No eligible applications", message: "No applications with fraud score below 30", variant: "info" });
      return;
    }

    setBulkLoading(true);
    let approved = 0;
    for (const app of lowRisk) {
      try {
        const res = await fetch(`/api/v1/admin/applications/${app.id}/approve`, { method: "POST" });
        if (res.ok) approved++;
      } catch {
        // Continue with next
      }
    }

    toast({
      title: "Bulk approve complete",
      message: `${approved} of ${lowRisk.length} applications approved`,
      variant: "success",
    });
    await fetchApplications();
    setBulkLoading(false);
  };

  const lowRiskCount = applications.filter((a) => a.fraudScore < 30).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and process membership applications
          </p>
        </div>
        <Button
          variant="success"
          loading={bulkLoading}
          onClick={handleBulkApprove}
          disabled={lowRiskCount === 0}
          aria-label={`Bulk approve ${lowRiskCount} low-risk applications`}
        >
          Bulk Approve Low-Risk ({lowRiskCount})
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Applications queue">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Fraud Score</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No pending applications
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <ApplicationQueueRow
                    key={app.id}
                    application={app}
                    onApprove={handleApprove}
                    onReject={(id) => setRejectTarget(id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Dialog */}
      <Dialog
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        title="Reject Application"
        actions={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={actionLoading === rejectTarget}
              onClick={handleRejectConfirm}
            >
              Reject
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="reject-reason" className="mb-1 block text-sm font-medium text-gray-700">
              Rejection Reason
            </label>
            <select
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="reject-notes" className="mb-1 block text-sm font-medium text-gray-700">
              Additional Notes (optional)
            </label>
            <textarea
              id="reject-notes"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              rows={3}
              placeholder="Any additional context for the rejection..."
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
