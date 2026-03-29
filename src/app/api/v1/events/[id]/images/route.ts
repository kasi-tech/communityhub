import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { ApiError } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ---------------------------------------------------------------------------
// POST /api/v1/events/[id]/images — Admin: upload an image for an event
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: { message: "Admin access required", code: "FORBIDDEN" } satisfies ApiError },
        { status: 403 },
      );
    }

    // Read multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { message: "No file provided", code: "VALIDATION_ERROR" } satisfies ApiError },
        { status: 422 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid file type. Allowed: jpg, png, webp",
            code: "VALIDATION_ERROR",
          } satisfies ApiError,
        },
        { status: 422 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: {
            message: "File too large. Maximum size is 5 MB",
            code: "VALIDATION_ERROR",
          } satisfies ApiError,
        },
        { status: 422 },
      );
    }

    // Verify event exists
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

    // Generate a placeholder image entry
    // In production this would upload to Supabase Storage + resize with sharp
    const imageId = crypto.randomUUID();
    const placeholderUrl = `/images/events/${id}/${imageId}.${file.type.split("/")[1]}`;

    const newImage = {
      id: imageId,
      originalUrl: placeholderUrl,
      coverUrl: placeholderUrl,
      galleryUrl: placeholderUrl,
      thumbnailUrl: placeholderUrl,
      altText: file.name.replace(/\.[^.]+$/, ""),
      isCover: false,
      uploadedAt: new Date().toISOString(),
    };

    const existingImages = Array.isArray(event.images) ? event.images : [];
    const updatedImages = [...existingImages, newImage];

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

    return NextResponse.json(
      { data: { imageId, url: placeholderUrl } },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/v1/events/[id]/images error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } satisfies ApiError },
      { status: 500 },
    );
  }
}
