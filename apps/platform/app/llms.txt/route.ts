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
  const mcpUrl = `${base}/api/mcp`;
  const body = `# SaaS Template

> Production-ready SaaS template with multi-tenant support, chat-first UX,
> and an opinionated web surface for teams that move fast.

The marketing site has two locales (Spanish / English). The product itself
(/home, /auth/onboarding, tenant subdomains) is auth-gated and not exposed
here.

## MCP Server

This platform exposes a **Model Context Protocol (MCP) server** at:

\`\`\`
${mcpUrl}
\`\`\`

**Protocol:** MCP Streamable HTTP (JSON-RPC 2.0, stateless per-request)
**Auth:** \`Authorization: Bearer <api_key>\` — create keys at ${base}/home/account/integrations

### Quick start (Claude Desktop)

Add to \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "saas-template": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${mcpUrl}"],
      "env": { "MCP_BEARER_TOKEN": "<your-api-key>" }
    }
  }
}
\`\`\`

### Available tools

| Tool | Description |
|---|---|
| \`viewer_profile\` | Get authenticated user's profile (id, name) |
| \`tenants\` | List all tenants the user has access to |
| \`tenant_by_slug\` | Get a tenant by its URL slug |
| \`organizations\` | List organizations the user is a member of |
| \`agencies\` | List agencies the user has access to |
| \`viewer_has_permission\` | Check if the user has a permission in an organization |

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
