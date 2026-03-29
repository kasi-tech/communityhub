import { ImageResponse } from "next/og";

// ---------------------------------------------------------------------------
// Default OG Image — 1200x630 indigo gradient with CommunityHub branding
// ---------------------------------------------------------------------------

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "CommunityHub — Community Management Platform";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.2)",
            marginBottom: 24,
            fontSize: 36,
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          CH
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          CommunityHub
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
            marginTop: 16,
            margin: 0,
            paddingTop: 16,
          }}
        >
          Community Management Platform
        </p>

        {/* Decorative line */}
        <div
          style={{
            width: 120,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.4)",
            marginTop: 32,
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
