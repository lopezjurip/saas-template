import { type NextRequest, NextResponse } from "next/server";
import { APP_HOST } from "~/lib/constants";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostBase = host.split(":")[0] ?? "";
  const apexBase = APP_HOST.split(":")[0] ?? "";
  const isApex = hostBase === apexBase || hostBase === `www.${apexBase}`;

  // Tenant subdomains are private app instances — no public surface for LLMs.
  if (!isApex) {
    return new NextResponse("Not found", { status: 404 });
  }

  const base = `https://${APP_HOST}`;
  const body = `# Humane

> Chat-first HR and payroll platform for Chilean companies (50–250 employees).
> Built around Chilean labor law (Código del Trabajo, Previred, LRE) with a
> WhatsApp-native experience for employees and an opinionated web surface
> for HR/payroll administrators.

The marketing site has two locales (Spanish / English). The product itself
(/home, /auth/onboarding, tenant subdomains) is auth-gated and not exposed
here.

## Pages

- [Inicio (es-CL)](${base}/es): Landing en español.
- [Home (en-US)](${base}/en): English landing.

## Optional

- [robots.txt](${base}/robots.txt): Crawl policy.
- [sitemap.xml](${base}/sitemap.xml): Public URLs with hreflang.
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
