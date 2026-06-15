import { type NextRequest, NextResponse } from "next/server";
import { APP_HOST } from "~/lib/constants";

export async function GET(request: NextRequest, ctx: RouteContext<"/llms.txt">) {
  const host = request.headers.get("host") ?? "";
  const hostBase = host.split(":")[0] ?? "";
  const apexBase = APP_HOST.split(":")[0] ?? "";
  const isApex = hostBase === apexBase || hostBase === `www.${apexBase}`;

  /**
   * Tenant subdomains are private app instances — no public surface for LLMs.
   */
  if (!isApex) {
    return new NextResponse("Not found", { status: 404 });
  }

  const base = `https://${APP_HOST}`;
  const body = `# SaaS Template

> Production-ready SaaS template with multi-tenant support, chat-first UX,
> and an opinionated web surface for teams that move fast.

The marketing site negotiates its language (Spanish / English / Portuguese)
from the request, so a single URL serves the visitor's locale. The product
itself (/home, /auth/onboarding, tenant subdomains) is auth-gated and not
exposed here.

## Pages

- [Home](${base}/): Landing page.
- [MCP](${base}/mcp): Remote Model Context Protocol server — connect AI agents.
- [Pricing](${base}/pricing): Plans and pricing.
- [FAQ](${base}/faq): Frequently asked questions.

## For agents

- [MCP endpoint](${base}/api/mcp): Streamable HTTP MCP server. Anonymous tools
  respond without a token; data tools require a Supabase OAuth Bearer token.
- [OAuth metadata](${base}/.well-known/oauth-protected-resource): RFC 9728
  protected-resource metadata for authorization-server discovery.

## Optional

- [robots.txt](${base}/robots.txt): Crawl policy.
- [sitemap.xml](${base}/sitemap.xml): Public URLs.
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
