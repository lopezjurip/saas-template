import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { APP_HOST } from "~/lib/constants";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const hostBase = host.split(":")[0] ?? "";
  const apexBase = APP_HOST.split(":")[0] ?? "";
  const isApex = hostBase === apexBase || hostBase === `www.${apexBase}`;

  // Tenant subdomains are private app instances — no public content to crawl.
  if (!isApex) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/es", "/en"],
        disallow: ["/api/", "/auth", "/home", "/tenants/", "/*/auth", "/*/home", "/*/tenants/"],
      },
    ],
    sitemap: `https://${APP_HOST}/sitemap.xml`,
  };
}
