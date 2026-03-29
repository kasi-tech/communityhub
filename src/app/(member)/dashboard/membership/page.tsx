import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Membership Details — Server Component
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-SG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "failed":
      return <Badge variant="danger">Failed</Badge>;
    case "refunded":
      return <Badge variant="info">Refunded</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
}

function getProviderBadge(provider: string) {
  switch (provider) {
    case "paypal":
      return <Badge variant="info">PayPal</Badge>;
    case "paynow":
      return <Badge variant="success">PayNow</Badge>;
    default:
      return <Badge variant="gray">{provider}</Badge>;
  }
}

export default async function MembershipPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  // Fetch member with tier info
  const { data: member } = await supabase
    .from("members")
    .select(
      `
      id, name, status, member_number, membership_expires, created_at, tier_id,
      membership_tiers (id, name, price, duration_months, is_family, benefits, is_lifetime)
    `,
    )
    .eq("id", user.memberId)
    .single();

  const tier = member?.membership_tiers as unknown as {
    id: string;
    name: string;
    price: number;
    duration_months: number;
    is_family: boolean;
    benefits: string[];
    is_lifetime: boolean;
  } | null;

  const isExpired = member?.status === "expired";
  const isActive = member?.status === "active";

  // Fetch payment history
  const { data: payments } = await supabase
    .from("payments")
    .select(
      `
      id, amount, currency, provider, status, created_at,
      registration_id, application_id,
      registrations (events (title))
    `,
    )
    .eq("member_id", user.memberId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Membership</h1>

      {/* Membership Card */}
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-indigo-200">
              CommunityHub Membership
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {tier?.name ?? "Free Tier"}
            </h2>
            <p className="mt-2 text-sm text-indigo-200">
              Member #{member?.member_number ?? "---"}
            </p>
            <p className="mt-1 text-sm text-indigo-200">{member?.name}</p>
          </div>
          <div className="text-left sm:text-right">
            <div>
              {isActive ? (
                <span className="inline-flex items-center rounded-full bg-green-400/20 px-3 py-1 text-sm font-medium text-green-100">
                  Active
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center rounded-full bg-red-400/20 px-3 py-1 text-sm font-medium text-red-100">
                  Expired
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-400/20 px-3 py-1 text-sm font-medium text-gray-100">
                  {member?.status ?? "Unknown"}
                </span>
              )}
            </div>
            {member?.membership_expires && (
              <p className="mt-2 text-sm text-indigo-200">
                {isExpired ? "Expired" : "Valid until"}{" "}
                {formatDate(member.membership_expires)}
              </p>
            )}
            {tier?.is_lifetime && (
              <p className="mt-1 text-sm font-medium text-indigo-100">
                Lifetime Membership
              </p>
            )}
          </div>
        </div>

        {/* Benefits */}
        {tier?.benefits && tier.benefits.length > 0 && (
          <div className="mt-6 border-t border-indigo-500/30 pt-4">
            <p className="mb-2 text-sm font-medium text-indigo-200">
              Benefits
            </p>
            <ul className="grid gap-1 text-sm text-indigo-100 sm:grid-cols-2">
              {tier.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 shrink-0 text-green-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
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
          </div>
        )}

        {/* Renew CTA */}
        {isExpired && (
          <div className="mt-6">
            <Link href="/join">
              <Button
                variant="secondary"
                className="bg-white text-indigo-700 hover:bg-indigo-50"
              >
                Renew Membership
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Payment History
          </h2>
        </CardHeader>
        {(!payments || payments.length === 0) ? (
          <CardContent className="py-8 text-center">
            <p className="text-sm text-gray-500">No payment history yet.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Description
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Method
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => {
                  const registration = p.registrations as unknown as {
                    events: { title: string } | null;
                  } | null;
                  let description = "Payment";
                  if (registration?.events?.title) {
                    description = `Event: ${registration.events.title}`;
                  } else if (p.application_id) {
                    description = "Membership Application Fee";
                  }

                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{description}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                        {p.currency ?? "SGD"} {(p.amount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {getProviderBadge(p.provider)}
                      </td>
                      <td className="px-4 py-3">
                        {getPaymentStatusBadge(p.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
