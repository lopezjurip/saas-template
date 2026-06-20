/**
 * MCP endpoint — Streamable HTTP transport (stateless, no Redis).
 *
 * Served at:
 *   POST /api/mcp   → tool calls, initialize, etc.
 *   GET  /api/mcp   → Streamable HTTP SSE stream (if client requests)
 *
 * Authentication: optional (`required: false`). A Bearer token, when present, is validated
 * in `~/lib/mcp/verify-token` — local JWKS verification (jose, no GoTrue round-trip) with
 * RFC 8707 audience check; HS256 fallback via getUser() while GoTrue enforces RS256.
 * Anonymous callers (no/invalid token) still reach tools; each tool opts into auth via
 * `getGraphyFromMcpAssert` / `getSupabaseFromMcpAssert` (which throw for anon), or stays
 * anon-friendly via the non-`Assert` variants.
 *
 * Tenant scoping: tools receive `extra.authInfo.extra.host` (from the Host header)
 * and can call `tenantSlugFromHost()` to determine if the request came from a
 * subdomain context. RLS enforces access at the DB layer regardless.
 */

import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerTools } from "~/lib/mcp/register";
import { mcpTokenVerify } from "~/lib/mcp/token";

export const runtime = "nodejs";
export const maxDuration = 60;

const mcpHandler = createMcpHandler(
  registerTools,
  {
    serverInfo: { name: "platform-mcp", version: "1.0.0" },
    capabilities: { tools: {} },
  },
  {
    basePath: "/api",
    maxDuration: 60,
    // No redisUrl — stateless Streamable HTTP (Vercel Fluid compute compatible)
  },
);

const authHandler = withMcpAuth(mcpHandler, mcpTokenVerify, {
  // Optional auth: anonymous callers reach tools; per-tool `*Assert` helpers gate
  // the ones that need an authenticated caller.
  required: false,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { authHandler as GET, authHandler as POST };
