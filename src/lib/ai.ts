import Anthropic from "@anthropic-ai/sdk";
import type { FraudScore } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// ---------------------------------------------------------------------------
// Generic chat
// ---------------------------------------------------------------------------

interface ChatInput {
  role: "user" | "assistant";
  content: string;
}

/**
 * Send a multi-turn conversation to Claude and return the assistant reply.
 */
export async function chatWithAI(
  messages: ChatInput[],
  systemPrompt: string,
  model: string = DEFAULT_MODEL,
): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}

// ---------------------------------------------------------------------------
// Fraud scoring
// ---------------------------------------------------------------------------

/**
 * Analyse an application for fraud signals using Claude.
 * Returns a numeric score (0-100) and an array of contributing factors.
 */
export async function scoreFraud(
  applicationData: Record<string, unknown>,
): Promise<FraudScore> {
  const systemPrompt = `You are a fraud detection analyst for a community membership platform.
Analyse the application data and return a JSON object with:
- "score": integer 0–100 (0 = no risk, 100 = definite fraud)
- "factors": array of objects each containing "name", "weight" (number), "value" (string), and "signal" ("positive" | "neutral" | "negative")

Consider: email validity, phone format, name patterns, duplicate detection signals, geographic consistency, and referral chain quality.
Return ONLY valid JSON — no markdown fences.`;

  const reply = await chatWithAI(
    [{ role: "user", content: JSON.stringify(applicationData) }],
    systemPrompt,
  );

  try {
    return JSON.parse(reply) as FraudScore;
  } catch {
    return { score: 50, factors: [{ name: "parse_error", weight: 1, value: "Could not parse AI response", signal: "neutral" }] };
  }
}

// ---------------------------------------------------------------------------
// Event listing generator
// ---------------------------------------------------------------------------

/**
 * Generate a polished event listing from a rough description.
 */
export async function generateEventListing(
  description: string,
): Promise<string> {
  const systemPrompt = `You are a professional event copywriter for a community organisation.
Given a rough description, produce a polished, engaging event listing in HTML format.
Include: catchy title, summary paragraph, key details (date/time/venue if mentioned), and a call-to-action.
Keep the tone warm, inclusive, and community-oriented.`;

  return chatWithAI(
    [{ role: "user", content: description }],
    systemPrompt,
  );
}

// ---------------------------------------------------------------------------
// Post-event recap generator
// ---------------------------------------------------------------------------

/**
 * Generate a post-event recap / newsletter snippet.
 */
export async function generateRecap(
  eventData: Record<string, unknown>,
  photoCount: number,
): Promise<string> {
  const systemPrompt = `You are a community newsletter writer.
Given event details and the number of photos taken, write a warm, celebratory recap (3-5 paragraphs) suitable for an email newsletter.
Mention highlights, community spirit, and encourage attendance at future events.
If photos were taken, reference the photo gallery.`;

  return chatWithAI(
    [
      {
        role: "user",
        content: `Event data: ${JSON.stringify(eventData)}\nPhotos taken: ${photoCount}`,
      },
    ],
    systemPrompt,
  );
}
