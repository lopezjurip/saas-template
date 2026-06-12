import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SaaS Template",
    short_name: "SaaS Template",
    description: "Production-ready SaaS template",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d2138",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
