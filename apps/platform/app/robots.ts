import type { MetadataRoute } from "next";
import { isApexHost } from "~/lib/apex";
import { APP_HOST } from "~/lib/constants";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const isApex = await isApexHost();
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
