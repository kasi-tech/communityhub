import { NextResponse } from "next/server";

/**
 * GET /api/v1/health
 *
 * Public health-check endpoint used by monitoring tools and load balancers.
 * Returns 200 with basic service info — no authentication required.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
