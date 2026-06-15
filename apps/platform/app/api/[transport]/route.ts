/**
 * MCP endpoint — Streamable HTTP transport (stateless, no Redis).
 *
 * Served at:
 *   POST /api/mcp   → tool calls, initialize, etc.
 *   GET  /api/mcp   → Streamable HTTP SSE stream (if client requests)
 *
 * Authentication: optional (`required: false`). A Bearer token, when present, must be
 * a valid Supabase access_token; `verifyToken` validates it with `supabase.auth.getUser`
 * — signing-agnostic, no `jose` dependency. On success it injects AuthInfo so handlers
 * resolve a user-scoped client. Anonymous callers (no/invalid token) still reach tools:
 * each tool opts into auth via `getGraphyFromMcpAssert` / `getSupabaseFromMcpAssert`
 * (which throw for anon), or stays anon-friendly via the non-`Assert` variants.
 *
 * Tenant scoping: tools receive `extra.authInfo.extra.host` (from the Host header)
 * and can call `tenantSlugFromHost()` to determine if the request came from a
 * subdomain context. RLS enforces access at the DB layer regardless.
 *
 * TODO (phase 2): swap `getUser()` round-trip for local JWKS verification with
 * `jose` once the Supabase project uses asymmetric signing — reduces latency by
 * eliminating the extra network call per tool invocation.
 */

import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createClient } from "@supabase/supabase-js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { debug } from "~/lib/debug";
import { registerTools } from "~/lib/mcp/register";

export const runtime = "nodejs";
export const maxDuration = 60;

const log = debug("app:api:mcp:route");

const NEXT_PUBLIC_SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

/**
 * Creates a bare anon Supabase client suitable for token validation.
 * NOT cookie-bound — used only for `auth.getUser(bearerToken)`.
 * A new client per-request is cheap; no session is persisted.
 */
function createAnonClientForValidation() {
  return createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

/**
 * Validates a bearer token by calling Supabase Auth.
 * Returns an AuthInfo when the token is valid; `undefined` otherwise. With
 * `required: false`, `undefined` does NOT 401 — the request proceeds anonymously
 * (no `authInfo`), and tools requiring auth throw via the `*Assert` helpers.
 *
 * `extra` carries the user ID and original host so tool handlers can
 * build per-user clients and resolve tenant slugs without re-parsing.
 */
async function verifyToken(req: Request, bearerToken?: string): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  const supabase = createAnonClientForValidation();

  let user_id: string;
  try {
    const { data, error } = await supabase.auth.getUser(bearerToken);
    if (error || !data["user"]) {
      log.warn("[verifyToken] invalid or expired token: %o", { error: error?.message ?? "no user" });
      return undefined;
    }
    user_id = data["user"]["id"];
  } catch (err) {
    log.error("[verifyToken] unexpected error during getUser: %o", { err });
    return undefined;
  }

  const host = req.headers.get("host") ?? undefined;

  return {
    token: bearerToken,
    scopes: [],
    clientId: "mcp",
    extra: {
      user_id: user_id,
      host: host,
    },
  };
}

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

const authHandler = withMcpAuth(mcpHandler, verifyToken, {
  // Optional auth: anonymous callers reach tools; per-tool `*Assert` helpers gate
  // the ones that need an authenticated caller.
  required: false,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { authHandler as GET, authHandler as POST };
