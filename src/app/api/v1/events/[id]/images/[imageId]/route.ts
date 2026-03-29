import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

type RouteContext = { params: Promise<{ id: string; imageId: string }> };

// ---------------------------------------------------------------------------
// DELETE /api/v1/events/[id]/images/[imageId] — Admin: remove an image
// ---------------------------------------------------------------------------

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id, imageId } = await context.params;
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    // Fetch event
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("id, images")
      .eq("id", id)
      .single();

    if (fetchError || !event) {
      return NextResponse.json(
        { error: { message: "Event not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    const existingImages = Array.isArray(event.images) ? event.images : [];
    const imageIndex = existingImages.findIndex(
      (img: { id: string }) => img.id === imageId,
    );

    if (imageIndex === -1) {
      return NextResponse.json(
        { error: { message: "Image not found", code: "NOT_FOUND" } satisfies ApiError },
        { status: 404 },
      );
    }

    // In production: also delete from Supabase Storage here
    const updatedImages = existingImages.filter(
      (_: unknown, i: number) => i !== imageIndex,
    );

    const { error: updateError } = await supabase
      .from("events")
      .update({ images: updatedImages })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: { message: updateError.message, code: "DB_ERROR" } satisfies ApiError },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    console.error("DELETE /api/v1/events/[id]/images/[imageId] error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
