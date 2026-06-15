/**
 * MCP tool registry.
 *
 * `registerTools(server)` is the single entry point passed to `createMcpHandler`.
 * It instantiates every tool and registers it on the server.
 *
 * ## Adding a new tool
 *
 * 1. Create `apps/platform/lib/mcp/tools/<group>.ts` exporting a class that extends
 *    `McpTool` from `~/lib/mcp/tool` (declare `name` / `description` / optional
 *    `inputSchema`, implement `handle(args, ctx)`). Export the class so it can be
 *    unit-tested by instantiating it and calling `run` with a fake `ctx`.
 * 2. Add an instance to the `TOOLS` array below.
 * 3. No barrel index files — import the file directly.
 *
 * ## Handler signature (each tool's `handle`)
 *
 * `McpTool.register` extracts `authInfo` (401 if absent) and passes a token-scoped
 * `ctx` to `handle` — no `extra.authInfo` parsing in the tool itself. `handle` is an
 * async generator: `yield` notifications for progress, `return` the final result:
 *
 * ```ts
 * async *handle(args, ctx) {
 *   ctx.token;     // Supabase access_token (Bearer)
 *   ctx.userId;    // profile_id (Supabase auth.users.id), from authInfo.extra.user_id
 *   ctx.host;      // Host header for tenant slug resolution
 *   ctx.graphy;    // lazy token-scoped pg_graphql client — RLS applies per user
 *   ctx.supabase;  // lazy token-scoped PostgREST client — RLS applies per user
 *   yield { method: "notifications/message", params: { level: "info", data: "..." } };
 *   return { content: [{ type: "text", text: "..." }] };
 * }
 * ```
 *
 * @example
 * const handler = createMcpHandler(registerTools, serverOptions, config);
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { debug } from "~/lib/debug";
import type { McpTool } from "~/lib/mcp/tool";
import { ListOrganizationMembersTool } from "~/lib/mcp/tools/members";
import { UpdateProfileTool } from "~/lib/mcp/tools/profile";
import { ListOrganizationsTool, ListTenantsTool } from "~/lib/mcp/tools/tenants";
import { WhoamiTool } from "~/lib/mcp/tools/whoami";

const log = debug("app:api:mcp:register");

/** All MCP tools, registered in order on each handler initialization. */
const TOOLS: McpTool[] = [
  // Identity & profile
  new WhoamiTool(),
  new UpdateProfileTool(),
  // Tenant & organization listing (viewer-scoped, RLS-enforced)
  new ListTenantsTool(),
  new ListOrganizationsTool(),
  // Member management (requires members_manage permission)
  new ListOrganizationMembersTool(),
];

/**
 * Registers all MCP tools on the given server instance.
 * Called once per handler initialization by `createMcpHandler`.
 *
 * @example
 * const handler = createMcpHandler(registerTools, { serverInfo: { name: "platform", version: "1.0.0" } });
 */
export function registerTools(server: McpServer): void {
  log.info("[registerTools] registering %d MCP tools", TOOLS.length);
  for (const tool of TOOLS) {
    tool.register(server);
  }
  log.info("[registerTools] done");
}
