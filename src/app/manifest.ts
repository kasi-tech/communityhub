import type { MetadataRoute } from "next";

// ---------------------------------------------------------------------------
// PWA Manifest — served via Next.js metadata API at /manifest.webmanifest
// ---------------------------------------------------------------------------

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CommunityHub",
    short_name: "CommunityHub",
    description: "Community management platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366F1",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
