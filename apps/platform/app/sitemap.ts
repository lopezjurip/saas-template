import type { MetadataRoute } from "next";
import { isApexHost } from "~/lib/apex";
import { APP_URL } from "~/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isApex = await isApexHost();
  if (!isApex) {
    return [];
  }

  const now = new Date();
  const base = APP_URL.origin;

  // Locale is no longer in the URL (resolved from cookie/Accept-Language), so there are no
  // per-locale URLs or hreflang alternates — one URL serves the negotiated language.
  function PAGE(
    path: string,
    data: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
  ): MetadataRoute.Sitemap[number] {
    return {
      ...data,
      url: `${base}${path}`,
    };
  }

  const sitemap: MetadataRoute.Sitemap = [];

  sitemap.push(
    PAGE("/", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    PAGE("/mcp", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  return sitemap;
}
