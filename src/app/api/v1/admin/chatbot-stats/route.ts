import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { ApiError, ChatMessage } from "@/types";

// ---------------------------------------------------------------------------
// GET /api/v1/admin/chatbot-stats — Admin: chatbot analytics
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch conversations from the last 30 days
    const { data: conversations, count } = await supabase
      .from("chat_conversations")
      .select("id, session_id, messages, satisfaction, resolved, created_at", { count: "exact" })
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false });

    const allConvos = conversations ?? [];
    const totalConversations = count ?? 0;

    // Resolution rate
    const resolvedCount = allConvos.filter((c) => c.resolved).length;
    const resolutionRate = totalConversations > 0 ? (resolvedCount / totalConversations) * 100 : 0;

    // Average satisfaction (only from conversations that have a rating)
    const rated = allConvos.filter((c) => c.satisfaction !== null && c.satisfaction > 0);
    const avgSatisfaction =
      rated.length > 0
        ? rated.reduce((sum, c) => sum + (c.satisfaction ?? 0), 0) / rated.length
        : 0;

    // Recent 10 conversation previews
    const recentConversations = allConvos.slice(0, 10).map((c) => {
      const msgs = (c.messages as ChatMessage[]) ?? [];
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

      return {
        id: c.id,
        sessionId: c.session_id,
        lastMessage: lastMsg?.content?.slice(0, 100) ?? "(empty)",
        messageCount: msgs.length,
        satisfaction: c.satisfaction,
        resolved: c.resolved,
        createdAt: c.created_at,
      };
    });

    return NextResponse.json({
      data: {
        stats: {
          totalConversations,
          resolutionRate,
          avgSatisfaction,
        },
        conversations: recentConversations,
      },
    });
  } catch (err) {
    console.error("GET /api/v1/admin/chatbot-stats error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
