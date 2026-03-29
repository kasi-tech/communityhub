import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const period = searchParams.get("period") ?? "month";
  const customFrom = searchParams.get("from");
  const customTo = searchParams.get("to");

  const now = new Date();
  let from: string;
  let to: string = now.toISOString();

  if (customFrom && customTo) {
    from = new Date(customFrom).toISOString();
    to = new Date(customTo).toISOString();
  } else {
    switch (period) {
      case "quarter": {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        from = new Date(now.getFullYear(), qMonth, 1).toISOString();
        break;
      }
      case "year":
        from = new Date(now.getFullYear(), 0, 1).toISOString();
        break;
      default: // month
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
  }

  // Fetch all completed payments in the range
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, registration_id, application_id, created_at")
    .eq("status", "completed")
    .gte("created_at", from)
    .lte("created_at", to);

  const allPayments = payments ?? [];

  let eventRevenue = 0;
  let membershipRevenue = 0;
  let donationRevenue = 0;

  // Fetch donation payment IDs
  const { data: donations } = await supabase
    .from("donations")
    .select("payment_id")
    .gte("created_at", from)
    .lte("created_at", to);

  const donationPaymentIds = new Set((donations ?? []).map((d) => d.payment_id));

  for (const p of allPayments) {
    if (donationPaymentIds.has(p.id)) {
      donationRevenue += p.amount;
    } else if (p.registration_id) {
      eventRevenue += p.amount;
    } else if (p.application_id) {
      membershipRevenue += p.amount;
    } else {
      membershipRevenue += p.amount;
    }
  }

  const totalRevenue = eventRevenue + membershipRevenue + donationRevenue;

  // Build daily breakdown
  const breakdownMap = new Map<string, number>();
  for (const p of allPayments) {
    const day = p.created_at.slice(0, 10);
    breakdownMap.set(day, (breakdownMap.get(day) ?? 0) + p.amount);
  }

  const breakdown = Array.from(breakdownMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  return NextResponse.json({
    totalRevenue,
    eventRevenue,
    membershipRevenue,
    donationRevenue,
    breakdown,
  });
}
