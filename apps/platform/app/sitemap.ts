import type { MetadataRoute } from "next";
import { isApexHost } from "~/lib/apex";
import { APP_URL } from "~/lib/constants";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "~/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isApex = await isApexHost();
  if (!isApex) {
    return [];
  }

  const now = new Date();
  const base = APP_URL.origin;

  function PAGE(
    path: string,
    data: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
  ): MetadataRoute.Sitemap[number] {
    return {
      ...data,
      url: `${base}/${DEFAULT_LOCALE}${path}`,
      alternates: {
        languages: {
          ...Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, `${base}/${locale}${path}`])),
          "x-default": `${base}/${DEFAULT_LOCALE}${path}`,
        },
      },
    };
  }

  const sitemap: MetadataRoute.Sitemap = [];

  sitemap.push(
    PAGE("/", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  return sitemap;
}
