import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "~/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const hostBase = host.split(":")[0] ?? "";
  const apexBase = APP_HOST.split(":")[0] ?? "";
  const isApex = hostBase === apexBase || hostBase === `www.${apexBase}`;
  if (!isApex) return [];

  const base = `https://${APP_HOST}`;
  const homeLanguages: Record<string, string> = {
    ...Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, `${base}/${locale}`])),
    "x-default": `${base}/${DEFAULT_LOCALE}`,
  };

  return SUPPORTED_LOCALES.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: { languages: homeLanguages },
  }));
}
