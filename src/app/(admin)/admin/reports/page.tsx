"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface RevenueData {
  totalRevenue: number;
  eventRevenue: number;
  membershipRevenue: number;
  donationRevenue: number;
  breakdown: { date: string; amount: number }[];
}

type Period = "month" | "last_month" | "quarter" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  month: "This Month",
  last_month: "Last Month",
  quarter: "This Quarter",
  year: "This Year",
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/v1/admin/reports/revenue?period=";
      if (period === "last_month") {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const to = new Date(now.getFullYear(), now.getMonth(), 0);
        url = `/api/v1/admin/reports/revenue?from=${from.toISOString()}&to=${to.toISOString()}`;
      } else {
        url += period;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      setData(json);
    } catch {
      toast({ title: "Error", message: "Failed to load revenue data", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [period, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = data
    ? [
        { title: "Event Revenue", value: formatCurrency(data.eventRevenue), icon: "📅" },
        { title: "Membership Fees", value: formatCurrency(data.membershipRevenue), icon: "👥" },
        { title: "Donations", value: formatCurrency(data.donationRevenue), icon: "❤️" },
        { title: "Total Revenue", value: formatCurrency(data.totalRevenue), icon: "💰" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Revenue overview and breakdown</p>
        </div>
        <div className="flex gap-2">
          {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === key
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              aria-label={`Show ${label} report`}
              aria-pressed={period === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading reports...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.title}>
                <CardContent className="flex items-center gap-4">
                  <span className="text-3xl" aria-hidden="true">{card.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue by day breakdown */}
          <Card>
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Revenue breakdown by date">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(!data?.breakdown || data.breakdown.length === 0) ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                        No revenue data for this period
                      </td>
                    </tr>
                  ) : (
                    data.breakdown.map((row) => (
                      <tr key={row.date} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-700">{row.date}</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(row.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* AI Insights placeholder */}
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">🤖</span>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Insights</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Revenue trends analysis will appear here once enough data is collected.
                    The AI engine analyzes patterns in event attendance, membership renewals,
                    and donation frequency to provide actionable recommendations for
                    optimizing community engagement and revenue growth.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
