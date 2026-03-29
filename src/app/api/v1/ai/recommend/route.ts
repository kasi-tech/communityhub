import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/ai/recommend — Auth required: AI event recommendations
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } satisfies ApiError },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { memberId } = body as { memberId?: string };

    const targetMemberId = memberId ?? user.memberId;

    // Fetch member profile with interests
    const { data: member } = await supabase
      .from("members")
      .select("id, name, interests, gender, dob, postal_code")
      .eq("id", targetMemberId)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: { message: "Member not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // Fetch past event registrations
    const { data: registrations } = await supabase
      .from("registrations")
      .select("event_id, events(title, category, date)")
      .eq("member_id", targetMemberId)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(20);

    // Fetch family profile if exists
    const { data: familyMembers } = await supabase
      .from("family_members")
      .select("name, relationship, dob")
      .eq("member_id", targetMemberId);

    // Fetch upcoming published events
    const { data: upcomingEvents } = await supabase
      .from("events")
      .select("id, title, description, category, date, start_time, venue_name, price_adult, price_child, capacity")
      .eq("status", "published")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(20);

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return NextResponse.json({
        data: { recommendations: [] },
      });
    }

    // Build prompt
    const pastCategories = (registrations ?? [])
      .map((r) => (r.events as unknown as { title: string; category: string } | null)?.category)
      .filter(Boolean);

    const hasChildren = (familyMembers ?? []).some((f) => f.relationship === "child");

    const systemPrompt = `You are an event recommendation engine. Given a member profile and upcoming events, rank the events by relevance.

Return ONLY a valid JSON array (no markdown fences). Each element: {"eventId": "uuid", "reason": "short explanation", "score": 0.0-1.0}
Sort by score descending. Include at most 5 recommendations. Only recommend events the member would genuinely enjoy based on their profile.`;

    const userContent = `Member profile:
- Name: ${member.name}
- Interests: ${(member.interests ?? []).join(", ") || "not specified"}
- Past event categories attended: ${[...new Set(pastCategories)].join(", ") || "none"}
- Past events attended: ${(registrations ?? []).map((r) => (r.events as unknown as { title: string } | null)?.title).filter(Boolean).join(", ") || "none"}
- Has children: ${hasChildren ? "yes" : "no"}
- Family members: ${(familyMembers ?? []).map((f) => `${f.name} (${f.relationship})`).join(", ") || "none"}

Upcoming events:
${upcomingEvents.map((e) => `- ID: ${e.id} | ${e.title} | Category: ${e.category} | Date: ${e.date} | Venue: ${e.venue_name} | Adult: $${e.price_adult} | Child: $${e.price_child}`).join("\n")}`;

    const reply = await chatWithAI(
      [{ role: "user", content: userContent }],
      systemPrompt,
    );

    // Parse AI response
    let recommendations: { eventId: string; reason: string; score: number }[] = [];
    try {
      recommendations = JSON.parse(reply);
      if (!Array.isArray(recommendations)) {
        recommendations = [];
      }
    } catch {
      // If parsing fails, return empty recommendations
      recommendations = [];
    }

    // Validate event IDs exist in our upcoming events
    const validEventIds = new Set(upcomingEvents.map((e) => e.id));
    recommendations = recommendations.filter((r) => validEventIds.has(r.eventId));

    return NextResponse.json({
      data: { recommendations },
    });
  } catch (err) {
    console.error("POST /api/v1/ai/recommend error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
