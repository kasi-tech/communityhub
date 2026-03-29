import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/ai/newsletter — Admin: generate monthly community newsletter
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const body = await request.json();
    const now = new Date();
    const { month, year } = body as { month?: number; year?: number };

    const targetMonth = month ?? now.getMonth() + 1; // 1-indexed
    const targetYear = year ?? now.getFullYear();

    // Date ranges for the target month
    const monthStart = new Date(targetYear, targetMonth - 1, 1).toISOString();
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString();

    // Next month for upcoming events
    const nextMonthStart = new Date(targetYear, targetMonth, 1).toISOString();
    const nextMonthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).toISOString();

    // Fetch config for org name
    const { data: config } = await supabase
      .from("tenant_configs")
      .select("name")
      .limit(1)
      .single();

    const orgName = config?.name ?? "CommunityHub";

    // Fetch data in parallel
    const [
      pastEventsResult,
      upcomingEventsResult,
      newMembersResult,
      donationsResult,
    ] = await Promise.all([
      // Last month's events with attendance
      supabase
        .from("events")
        .select("id, title, date, venue_name, category")
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .eq("status", "completed")
        .order("date", { ascending: true }),

      // Upcoming events (next month)
      supabase
        .from("events")
        .select("id, title, date, start_time, venue_name, price_adult, category")
        .eq("status", "published")
        .gte("date", nextMonthStart)
        .lte("date", nextMonthEnd)
        .order("date", { ascending: true })
        .limit(10),

      // New members this month
      supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd),

      // Donation total this month
      supabase
        .from("donations")
        .select("amount")
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd),
    ]);

    // Get attendance counts for past events
    const pastEvents = pastEventsResult.data ?? [];
    const eventAttendance: Record<string, number> = {};

    if (pastEvents.length > 0) {
      const eventIds = pastEvents.map((e) => e.id);
      const { data: attendanceData } = await supabase
        .from("registrations")
        .select("event_id")
        .in("event_id", eventIds)
        .not("checked_in_at", "is", null);

      for (const reg of attendanceData ?? []) {
        eventAttendance[reg.event_id] = (eventAttendance[reg.event_id] ?? 0) + 1;
      }
    }

    const donationTotal = (donationsResult.data ?? []).reduce((sum, d) => sum + (d.amount ?? 0), 0);
    const newMemberCount = newMembersResult.count ?? 0;

    const monthName = new Date(targetYear, targetMonth - 1).toLocaleString("en-US", { month: "long", year: "numeric" });

    // Build prompt
    const systemPrompt = `You are a community newsletter writer for ${orgName}. Write a warm, engaging monthly newsletter.

Return ONLY valid JSON (no markdown fences) with:
- "subject": string (email subject line, catchy and specific to the month)
- "body": string (HTML-formatted newsletter body)

The newsletter should include:
1. A warm greeting and monthly highlights summary
2. Past event recaps (if any)
3. Upcoming event previews (if any)
4. Community stats (new members, donations)
5. A closing message encouraging participation

Use HTML formatting: <h2>, <p>, <ul>, <li>, <strong>, <em>. Keep the tone warm, inclusive, and celebratory.`;

    const userContent = `Newsletter for: ${monthName}

Past events this month:
${pastEvents.length > 0 ? pastEvents.map((e) => `- ${e.title} (${e.date}, ${e.venue_name}) — ${eventAttendance[e.id] ?? 0} attendees`).join("\n") : "No completed events this month."}

Upcoming events next month:
${(upcomingEventsResult.data ?? []).length > 0 ? (upcomingEventsResult.data ?? []).map((e) => `- ${e.title} on ${e.date} at ${e.venue_name} ($${e.price_adult})`).join("\n") : "No upcoming events scheduled yet."}

Community stats:
- New members this month: ${newMemberCount}
- Total donations this month: $${donationTotal.toFixed(2)}`;

    const reply = await chatWithAI(
      [{ role: "user", content: userContent }],
      systemPrompt,
    );

    let newsletter: { subject: string; body: string };
    try {
      newsletter = JSON.parse(reply);
    } catch {
      // Fallback if JSON parsing fails
      newsletter = {
        subject: `${orgName} — ${monthName} Newsletter`,
        body: reply,
      };
    }

    return NextResponse.json({
      data: { newsletter },
    });
  } catch (err) {
    console.error("POST /api/v1/ai/newsletter error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
