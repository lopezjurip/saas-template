/**
 * MCP client resolvers — build a token-scoped graphy / Supabase client from an
 * `McpContext`. Two variants per client:
 *
 * - `getXFromMcp(ctx)` — anon-friendly: uses `ctx.token` when present, otherwise an
 *   anonymous (anon-key only) client. Use in tools that allow unauthenticated callers.
 * - `getXFromMcpAssert(ctx)` — requires an authenticated caller: throws
 *   `McpUnauthorizedError` when no token. Use in tools that need a viewer.
 *
 * The auth endpoint runs with `required: false`, so anonymous requests reach tools;
 * these helpers are where each tool opts into (or out of) requiring a viewer.
 */

import { createSupabaseMcpClient } from "@packages/supabase/client.mcp";
import { createGraphyMcp } from "~/lib/graphy/graphy.mcp";
import type { McpContext } from "~/lib/mcp/tool";

/**
 * Thrown by the `*Assert` resolvers when the MCP caller is not authenticated.
 * Surfaces to the client as an `isError` tool result via the SDK.
 *
 * @example
 * throw new McpUnauthorizedError();
 */
export class McpUnauthorizedError extends Error {
  constructor(message = "Unauthorized: this MCP tool requires an authenticated caller") {
    super(message);
    this.name = "McpUnauthorizedError";
  }
}

/**
 * Token-scoped graphy client; anonymous when `ctx.token` is absent.
 * @example
 * const graphy = getGraphyFromMcp(ctx);
 */
export function getGraphyFromMcp(ctx: McpContext): ReturnType<typeof createGraphyMcp> {
  return createGraphyMcp(ctx.token);
}

/**
 * Token-scoped graphy client; throws `McpUnauthorizedError` for anonymous callers.
 * @example
 * const graphy = getGraphyFromMcpAssert(ctx);
 */
export function getGraphyFromMcpAssert(ctx: McpContext): ReturnType<typeof createGraphyMcp> {
  if (!ctx.token) {
    throw new McpUnauthorizedError();
  }
  return createGraphyMcp(ctx.token);
}

/**
 * Token-scoped Supabase (PostgREST) client; anonymous when `ctx.token` is absent.
 * @example
 * const supabase = getSupabaseFromMcp(ctx);
 */
export function getSupabaseFromMcp(ctx: McpContext): ReturnType<typeof createSupabaseMcpClient> {
  return createSupabaseMcpClient(ctx.token);
}

/**
 * Token-scoped Supabase client; throws `McpUnauthorizedError` for anonymous callers.
 * @example
 * const supabase = getSupabaseFromMcpAssert(ctx);
 */
export function getSupabaseFromMcpAssert(ctx: McpContext): ReturnType<typeof createSupabaseMcpClient> {
  if (!ctx.token) {
    throw new McpUnauthorizedError();
  }
  return createSupabaseMcpClient(ctx.token);
}
