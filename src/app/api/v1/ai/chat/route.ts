import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai";
import type { ApiError, ChatMessage } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/ai/chat — Public chatbot endpoint (session-based for anon)
// ---------------------------------------------------------------------------

const MAX_MESSAGES_PER_HOUR = 20;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { message, sessionId, memberId, language } = body as {
      message?: string;
      sessionId?: string;
      memberId?: string;
      language?: string;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Message is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: { message: "Message too long (max 2000 characters)", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // Resolve session ID — use provided or generate one
    const resolvedSessionId = sessionId || crypto.randomUUID();

    // Rate limiting: count messages in the last hour for this session
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("chat_conversations")
      .select("messages", { count: "exact", head: false })
      .eq("session_id", resolvedSessionId)
      .gte("created_at", oneHourAgo);

    // Each conversation row has messages array — count total messages across convos
    // Simple approach: count conversations as proxy (1 convo ≈ ongoing chat)
    // For stricter limiting, check messages array length
    const { data: recentConvos } = await supabase
      .from("chat_conversations")
      .select("messages")
      .eq("session_id", resolvedSessionId)
      .gte("created_at", oneHourAgo);

    const totalMessages = (recentConvos ?? []).reduce(
      (sum, c) => sum + ((c.messages as ChatMessage[]) ?? []).filter((m) => m.role === "user").length,
      0,
    );

    if (totalMessages >= MAX_MESSAGES_PER_HOUR) {
      return NextResponse.json(
        { error: { message: "Rate limit exceeded. Please try again later.", code: "RATE_LIMITED" } satisfies ApiError },
        { status: 429 },
      );
    }

    // Fetch or create conversation
    let conversationId: string;
    let existingMessages: ChatMessage[] = [];

    const { data: existingConvo } = await supabase
      .from("chat_conversations")
      .select("id, messages")
      .eq("session_id", resolvedSessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingConvo) {
      conversationId = existingConvo.id;
      existingMessages = (existingConvo.messages as ChatMessage[]) ?? [];
    } else {
      const { data: newConvo, error: insertErr } = await supabase
        .from("chat_conversations")
        .insert({
          session_id: resolvedSessionId,
          member_id: memberId ?? null,
          messages: [],
          resolved: false,
        })
        .select("id")
        .single();

      if (insertErr || !newConvo) {
        return NextResponse.json(
          { error: { message: "Failed to create conversation", code: "DB_ERROR" } satisfies ApiError },
          { status: 500 },
        );
      }
      conversationId = newConvo.id;
    }

    // If memberId provided, fetch member profile for personalization
    let memberContext = "";
    if (memberId) {
      const { data: member } = await supabase
        .from("members")
        .select("name, interests, status, tier_id")
        .eq("id", memberId)
        .single();

      if (member) {
        memberContext = `\n\nCurrent member context: Name: ${member.name}, Interests: ${(member.interests ?? []).join(", ")}, Status: ${member.status}`;
      }
    }

    // Fetch recent events and membership tiers for knowledge context
    const [eventsResult, tiersResult, configResult] = await Promise.all([
      supabase
        .from("events")
        .select("id, title, date, start_time, venue_name, price_adult, category")
        .eq("status", "published")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(10),
      supabase
        .from("membership_tiers")
        .select("name, price, duration_months, benefits, is_family, is_lifetime"),
      supabase
        .from("tenant_configs")
        .select("name")
        .limit(1)
        .single(),
    ]);

    const orgName = configResult.data?.name ?? "CommunityHub";
    const upcomingEvents = (eventsResult.data ?? [])
      .map((e) => `- ${e.title} on ${e.date} at ${e.venue_name} ($${e.price_adult})`)
      .join("\n");
    const tiers = (tiersResult.data ?? [])
      .map((t) => `- ${t.name}: $${t.price}/${t.duration_months}mo${t.is_family ? " (family)" : ""}${t.is_lifetime ? " (lifetime)" : ""} — ${(t.benefits ?? []).join(", ")}`)
      .join("\n");

    const lang = language ?? "en";
    const systemPrompt = `You are a helpful community assistant for ${orgName}. You help with events, membership, and community info. Respond in ${lang === "te" ? "Telugu" : lang === "en" ? "English" : lang} if requested. Be warm, concise, and helpful.

Knowledge base:
Upcoming events:
${upcomingEvents || "No upcoming events currently."}

Membership tiers:
${tiers || "Contact admin for membership information."}
${memberContext}

Keep responses concise (2-4 sentences unless the user asks for details). Do not make up information that is not in your knowledge base.`;

    // Build conversation history for Claude
    const historyForAI = existingMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    historyForAI.push({ role: "user", content: message });

    // Call Claude
    const reply = await chatWithAI(historyForAI, systemPrompt);

    // Save messages to conversation
    const now = new Date().toISOString();
    const userMsg: ChatMessage = { role: "user", content: message, timestamp: now };
    const botMsg: ChatMessage = { role: "assistant", content: reply, timestamp: now };
    const updatedMessages = [...existingMessages, userMsg, botMsg];

    await supabase
      .from("chat_conversations")
      .update({ messages: updatedMessages })
      .eq("id", conversationId);

    return NextResponse.json({
      data: { reply, conversationId },
    });
  } catch (err) {
    console.error("POST /api/v1/ai/chat error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
