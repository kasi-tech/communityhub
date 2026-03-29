"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function MembersToolbar() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1">
        <Input placeholder="Search by name or email..." aria-label="Search members" />
      </div>
      <select
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        aria-label="Filter by status"
        defaultValue=""
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="expired">Expired</option>
        <option value="suspended">Suspended</option>
        <option value="pending">Pending</option>
      </select>
      <select
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        aria-label="Filter by tier"
        defaultValue=""
      >
        <option value="">All Tiers</option>
        <option value="individual-annual">Individual Annual</option>
        <option value="family-annual">Family Annual</option>
        <option value="individual-lifetime">Individual Lifetime</option>
        <option value="family-lifetime">Family Lifetime</option>
      </select>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({
            title: "Export started",
            message: "CSV export will be available shortly",
            variant: "info",
          })
        }
        aria-label="Export members to CSV"
      >
        Export CSV
      </Button>
    </div>
  );
}
