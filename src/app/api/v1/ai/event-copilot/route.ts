import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { generateEventListing } from "@/lib/ai";
import { chatWithAI } from "@/lib/ai";
import type { ApiError } from "@/types";

// ---------------------------------------------------------------------------
// POST /api/v1/ai/event-copilot — Admin: generate structured event listing
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
    const { description } = body as { description?: string };

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Description is required", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    // First, generate the polished listing HTML
    const htmlListing = await generateEventListing(description);

    // Then, extract structured data using a separate call
    const structuredPrompt = `You are a data extraction engine. Given a rough event description, extract structured event data.

Return ONLY valid JSON (no markdown fences) with these fields:
- "title": string (catchy event title)
- "description": string (polished event description, 2-3 paragraphs)
- "suggestedPrice": number (suggested adult ticket price in dollars, 0 if free)
- "suggestedCapacity": number (suggested capacity based on event type)
- "schedule": string (suggested schedule/agenda if applicable, or empty string)

Be realistic with pricing and capacity suggestions based on the event type.`;

    const structuredReply = await chatWithAI(
      [{ role: "user", content: description }],
      structuredPrompt,
    );

    let generatedEvent: {
      title: string;
      description: string;
      suggestedPrice: number;
      suggestedCapacity: number;
      schedule: string;
    };

    try {
      generatedEvent = JSON.parse(structuredReply);
    } catch {
      // Fallback: use the HTML listing as description
      generatedEvent = {
        title: "Untitled Event",
        description: htmlListing,
        suggestedPrice: 0,
        suggestedCapacity: 50,
        schedule: "",
      };
    }

    return NextResponse.json({
      data: {
        generatedEvent,
        htmlListing,
      },
    });
  } catch (err) {
    console.error("POST /api/v1/ai/event-copilot error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
