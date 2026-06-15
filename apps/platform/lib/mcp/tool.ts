/**
 * MCP tool base class — kills the per-handler auth boilerplate and centralizes the
 * `server.registerTool` call (the variadic `server.tool` overloads are deprecated
 * in @modelcontextprotocol/sdk and removed in v2).
 *
 * Each tool extends `McpTool` and implements `handle(args, ctx)` as an async
 * generator: `yield` a `ServerNotification` to stream progress, `return` the final
 * `CallToolResult`. `ctx` is already authenticated: `ctx.graphy` / `ctx.supabase` are
 * token-scoped (RLS applies per user) and built lazily, so a tool that only needs one
 * client never constructs the other.
 *
 * Handlers stay pure-ish (no `extra.authInfo` parsing) so they can be unit-tested by
 * instantiating the tool and calling `run` directly with a fake `ctx`.
 */

import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ServerNotification } from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape, z } from "zod";

/** Args inferred from a tool's raw Zod input shape. */
export type InferArgs<Shape extends ZodRawShape> = z.infer<z.ZodObject<Shape>>;

/**
 * A tool's `handle` is an async generator: each `yield` is a `ServerNotification`
 * forwarded to `extra.sendNotification` (e.g. `notifications/message` progress logs),
 * and the `return` value is the final `CallToolResult`.
 *
 * @example
 * async *handle(args, ctx): McpToolStream {
 *   yield { method: "notifications/message", params: { level: "info", data: "working..." } };
 *   return { content: [{ type: "text", text: "done" }] };
 * }
 */
export type McpToolStream = AsyncGenerator<ServerNotification, CallToolResult, void>;

/**
 * Context handed to every MCP tool handler. Carries raw auth only; tools resolve a
 * client via the `getGraphyFromMcp` / `getSupabaseFromMcp` (anon) or `*Assert`
 * (require auth) helpers in `~/lib/mcp/clients`. All fields may be `undefined` —
 * the endpoint runs with `required: false`, so anonymous callers reach tools.
 */
export type McpContext = {
  /** Raw Supabase access token (Bearer), or `undefined` for anonymous callers. */
  token: string | undefined;
  /** Authenticated user id (`auth.users.id`), from `authInfo.extra.user_id`. */
  userId: string | undefined;
  /** Original `Host` header, for subdomain tenant scoping. */
  host: string | undefined;
};

/**
 * Base class for an MCP tool that runs only for authenticated callers.
 *
 * Subclasses declare `name` / `description` (and optionally `inputSchema`) and
 * implement `handle` as an async generator: `yield` a `ServerNotification` to stream
 * progress, `return` the final `CallToolResult`. `register` builds the `ctx` from
 * `authInfo` (may be anonymous) and drives the generator — forwarding yields to
 * `extra.sendNotification`. Tools requiring a viewer use the `*Assert` client helpers.
 *
 * @example
 * class WhoamiTool extends McpTool {
 *   readonly name = "whoami";
 *   readonly description = "...";
 *   async *handle(_args: Record<string, unknown>, ctx: McpContext): McpToolStream {
 *     const { data } = await ctx.graphy.query({ query: WhoamiMcpQuery });
 *     return { content: [{ type: "text", text: JSON.stringify(data) }] };
 *   }
 * }
 * new WhoamiTool().register(server);
 */
export abstract class McpTool<Shape extends ZodRawShape = ZodRawShape> {
  /** Unique tool name exposed to MCP clients. */
  abstract readonly name: string;
  /** Human-readable tool description shown to MCP clients. */
  abstract readonly description: string;
  /** Optional Zod input shape; omit for no-argument tools. */
  readonly inputSchema?: Shape;

  /**
   * Executes the tool against an authenticated, token-scoped context.
   * `yield` notifications for progress; `return` the final result.
   */
  abstract handle(args: InferArgs<Shape>, ctx: McpContext): McpToolStream;

  /**
   * Drives `handle` to completion: each yielded notification is passed to `emit`
   * (when provided) and the generator's return value is the final result. Shared by
   * `register` (forwards to `extra.sendNotification`) and unit tests (collects yields).
   *
   * @example
   * const notifications: ServerNotification[] = [];
   * const res = await tool.run(args, ctx, (n) => { notifications.push(n); });
   */
  async run(
    args: InferArgs<Shape>,
    ctx: McpContext,
    emit?: (notification: ServerNotification) => Promise<void> | void,
  ): Promise<CallToolResult> {
    const stream = this.handle(args, ctx);
    let step = await stream.next();
    while (!step.done) {
      if (emit) {
        await emit(step.value);
      }
      step = await stream.next();
    }
    return step.value;
  }

  /**
   * Registers this tool on an MCP server, wrapping `handle` with auth + ctx setup.
   *
   * @example
   * new WhoamiTool().register(server);
   */
  register(server: McpServer): void {
    // Arrow callback so `this` survives into the handler. Cast: inside this generic
    // class `Shape` is opaque, so the callback's `ShapeOutput<Shape>` arg type can't
    // be matched against the overloaded `registerTool` signature.
    const callback = (async (args, extra) => {
      const authInfo = extra.authInfo as AuthInfo | undefined;

      const ctx: McpContext = {
        token: authInfo?.token,
        userId: authInfo?.extra?.["user_id"] as string | undefined,
        host: authInfo?.extra?.["host"] as string | undefined,
      };

      return this.run(args as InferArgs<Shape>, ctx, (notification) => extra.sendNotification(notification));
    }) as ToolCallback<Shape>;

    server.registerTool(
      this.name,
      { description: this.description, inputSchema: this.inputSchema ?? ({} as Shape) },
      callback,
    );
  }
}
