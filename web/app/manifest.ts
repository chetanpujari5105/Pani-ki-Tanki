import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TankiAlert",
    short_name: "TankiAlert",
    description: "A free macOS menu bar app that plays a sound when your MacBook battery is full.",
    start_url: "/",
    display: "standalone",
    background_color: "#060a14",
    theme_color: "#060a14",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
