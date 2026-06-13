/**
 * Agent tool registry — MCP-style action catalog for the inbound AI agent.
 *
 * Each tool:
 *   - Has a Zod `inputSchema` (AI SDK v6 shape).
 *   - Has a permission slug that controls whether the tool is offered to the model.
 *   - Is "read-only" (skip Layer-1 mutex) or "side-effecting" (must claim before execute).
 *
 * ## Adding a product tool
 *
 * ```ts
 * import type { AgentTool } from "./tool-registry";
 * import { z } from "zod";
 *
 * export const myTool: AgentTool<"my_tool"> = {
 *   name: "my_tool",
 *   description: "Does something irreversible",
 *   permission: "organization_manage",   // null = always offered
 *   sideEffecting: true,                 // must use agent_action_claim
 *   inputSchema: z.object({ target_id: z.string() }),
 *   execute: async ({ input, ctx, admin, idempotencyKey }) => {
 *     // Only called if caller_has_permission check passes for input org.
 *     await admin.rpc("my_action_rpc", { ...input, caller_id: ctx.profileId });
 *     return { ok: true };
 *   },
 * };
 * ```
 *
 * Then register it at the bottom of this file:
 * ```ts
 * export const TOOL_REGISTRY = { ..., my_tool: myTool } as const;
 * ```
 */

import type { createServiceRoleClient } from "@packages/supabase/client.service";
import { tool } from "ai";
import { z } from "zod";
import { debug } from "~/lib/debug";
import type { InboundContext } from "../inbound-resolver";

const log = debug("api:inbound:agent:tools");

// ============================================================
// Tool shape
// ============================================================

// biome-ignore lint/suspicious/noExplicitAny: generic tool registry
export interface AgentTool<_Name extends string = string, TInput = any> {
  name: string;
  description: string;
  /**
   * Permission slug from `public.permissions`. When non-null, the tool is only offered
   * when `caller_has_permission(profileId, organizationId, permission)` is true.
   * Null = always offered (read-only, low-risk tools).
   */
  permission: string | null;
  /**
   * True = side-effecting (must be guarded by agent_action_claim / Layer-1 mutex).
   * False = read-only, naturally idempotent — may skip Layer-1.
   */
  sideEffecting: boolean;
  inputSchema: z.ZodType<TInput>;
  /**
   * Override the Layer-1 idempotency key for this tool.
   *
   * REQUIRED for any tool whose action targets a specific resource (e.g. approve a payment
   * order). Without this, the default key is `conv:{conversationId}:{toolName}` which
   * correctly deduplicates conversation-scoped actions (resolve, escalate) but would
   * over-deduplicate if the same tool runs on multiple resources in one conversation.
   *
   * @example
   * idempotencyKey: (input, ctx) => `org:${ctx.organizationId}:payment:${input.payment_id}:approve`
   */
  idempotencyKey?: (input: TInput, ctx: InboundContext) => string;
  execute: (args: {
    input: TInput;
    ctx: InboundContext;
    admin: ReturnType<typeof createServiceRoleClient>;
    /** Logical action idempotency key (e.g. `org:42:payment_order:123:approve`). */
    idempotencyKey: string;
  }) => Promise<Record<string, unknown>>;
}

// ============================================================
// Built-in starter tools
// ============================================================

/**
 * Mark the current conversation as resolved.
 *
 * Low-risk: idempotent, no money/irreversible effect. Side-effecting = true because it
 * stamps conversation_resolved_at — use Layer-1 to avoid dual-write from concurrent replies.
 */
const conversationResolveTool: AgentTool<"conversation_resolve", { summary: string }> = {
  name: "conversation_resolve",
  description:
    "Mark this conversation as resolved. Use when the user's request has been fulfilled or acknowledged and no further action is needed. Provide a brief summary of what was done.",
  permission: null,
  sideEffecting: true,
  inputSchema: z.object({
    summary: z.string().describe("Brief summary of what was resolved, shown to the user."),
  }),
  execute: async ({ input, ctx, admin, idempotencyKey }) => {
    log.info("[conversationResolveTool] resolving conversation", {
      conversationId: ctx.conversationId,
      idempotencyKey,
    });
    const { error } = await admin.rpc("conversation_resolve", {
      p_conversation_id: ctx.conversationId,
      channel: ctx.channel as "email" | "in_app" | "web_push" | "whatsapp" | "sms",
      resolution: { summary: input.summary },
    });
    if (error) {
      log.error("[conversationResolveTool] resolve failed", { error: error.message });
      return { ok: false, error: error.message };
    }
    return { ok: true, summary: input.summary };
  },
};

/**
 * Escalate the conversation to a support ticket that agency members can claim.
 *
 * Side-effecting: creates a ticket row. Uses Layer-1 idempotency so dual replies
 * (WhatsApp + email) don't create two tickets.
 */
const ticketEscalateTool: AgentTool<
  "ticket_escalate",
  { subject: string; priority?: "low" | "medium" | "high" | "critical" }
> = {
  name: "ticket_escalate",
  description:
    "Escalate this conversation to a support ticket so an agent can investigate. Use when the request needs human attention or cannot be resolved automatically. Provide a clear subject line.",
  permission: null,
  sideEffecting: true,
  inputSchema: z.object({
    subject: z.string().describe("Short subject line for the ticket (max 200 chars).").max(200),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .optional()
      .default("medium")
      .describe("Ticket priority. Default medium."),
  }),
  execute: async ({ input, ctx, admin, idempotencyKey }) => {
    log.info("[ticketEscalateTool] escalating", {
      conversationId: ctx.conversationId,
      subject: input.subject,
      idempotencyKey,
    });
    // Use ticket_escalate_as (explicit caller_id) because this runs under service-role
    // — viewer_profile_id() returns null in service-role context.
    const { data: ticketId, error } = await admin.rpc("ticket_escalate_as", {
      caller_id: ctx.profileId,
      p_conversation_id: ctx.conversationId,
      subject: input.subject,
      priority: input.priority ?? "medium",
    });
    if (error) {
      log.error("[ticketEscalateTool] escalate failed", { error: error.message });
      return { ok: false, error: error.message };
    }
    return { ok: true, ticketId };
  },
};

/**
 * Example domain action stub — shows the claim-before-execute pattern for an
 * irreversible / money-moving operation.
 *
 * Replace with a real domain RPC (e.g. `payment_order_approve`) that takes a
 * `caller_id` explicitly and enforces permission inside SQL.
 *
 * Permission: "organization_manage" — only offered when caller has this permission
 * in their organization.
 *
 * @example
 * // A product dev wires up the real action:
 * execute: async ({ input, ctx, admin }) => {
 *   const { error } = await admin.rpc("payment_order_approve", {
 *     payment_order_id: input.resource_id,
 *     caller_id: ctx.profileId,
 *     organization_id: ctx.organizationId,
 *   });
 *   return { ok: !error, error: error?.message };
 * },
 */
const exampleIrreversibleTool: AgentTool<"example_domain_action", { resource_id: string; confirm_phrase: string }> = {
  name: "example_domain_action",
  description:
    "[STUB] Execute an irreversible domain action on a resource. Replace with a real action in product code. Requires confirmation phrase 'CONFIRM'.",
  permission: "organization_manage",
  sideEffecting: true,
  inputSchema: z.object({
    resource_id: z.string().describe("ID of the resource to act on."),
    confirm_phrase: z.string().describe("Must be exactly 'CONFIRM' to proceed."),
  }),
  // Resource-scoped key: prevents dual-channel (WhatsApp + email) from executing
  // the same irreversible action twice for the same resource.
  idempotencyKey: (input, ctx) => `org:${ctx.organizationId ?? "none"}:resource:${input.resource_id}:domain_action`,
  execute: async ({ input, idempotencyKey }) => {
    if (input.confirm_phrase !== "CONFIRM") {
      return { ok: false, error: "confirmation phrase mismatch" };
    }
    log.info("[exampleIrreversibleTool] stub executed", { resource_id: input.resource_id, idempotencyKey });
    // Stub: replace with real RPC call.
    return { ok: true, resource_id: input.resource_id, note: "stub — wire real RPC here" };
  },
};

// ============================================================
// Registry
// ============================================================

/**
 * The master tool registry.  Keys match `AgentTool.name`.
 * Add new tools here after defining them above.
 */
// biome-ignore lint/suspicious/noExplicitAny: registry uses mixed types
export const TOOL_REGISTRY: Record<string, AgentTool<string, any>> = {
  conversation_resolve: conversationResolveTool,
  ticket_escalate: ticketEscalateTool,
  example_domain_action: exampleIrreversibleTool,
};

// ============================================================
// Permission-gated tool builder
// ============================================================

/**
 * Build the AI SDK `tools` map filtered to only those the resolved caller
 * has permission for in the current scope.
 *
 * Each returned tool's `execute` wraps the registry handler with:
 *   - Layer-1 `agent_action_claim` for side-effecting tools.
 *   - `agent_action_complete` to finalize status + output.
 *
 * @example
 * const tools = await buildPermittedTools(admin, ctx);
 * const { text } = await generateText({ model, tools, messages, ... });
 */
export async function buildPermittedTools(
  admin: ReturnType<typeof createServiceRoleClient>,
  ctx: InboundContext,
  // biome-ignore lint/suspicious/noExplicitAny: tool() generic is opaque; callers use the ToolSet union
): Promise<Record<string, ReturnType<typeof tool<any, any>>>> {
  // biome-ignore lint/suspicious/noExplicitAny: tool() generic is opaque
  const permitted: Record<string, ReturnType<typeof tool<any, any>>> = {};

  for (const [key, agentTool] of Object.entries(TOOL_REGISTRY)) {
    // Permission gate: check caller_has_permission for tools that require it.
    if (agentTool.permission !== null && ctx.organizationId !== null) {
      const { data: hasPerm, error: permError } = await admin.rpc("caller_has_permission", {
        caller_profile_id: ctx.profileId,
        organization_id: ctx.organizationId,
        permission_id: agentTool.permission,
      });
      if (permError || !hasPerm) {
        log.info("[buildPermittedTools] tool not permitted, skipping", {
          tool: key,
          permission: agentTool.permission,
          profileId: ctx.profileId,
          organizationId: ctx.organizationId,
        });
        continue;
      }
    } else if (agentTool.permission !== null && ctx.organizationId === null) {
      // Tool requires org-scope permission but no org in context — skip.
      continue;
    }

    // Capture loop variable for closure.
    const capturedTool = agentTool;

    permitted[key] = tool({
      description: capturedTool.description,
      inputSchema: capturedTool.inputSchema,
      execute: async (input: Record<string, unknown>) => {
        // Build logical action idempotency key.
        // Default: `conv:{conversationId}:{toolName}` — correct for conversation-scoped
        // actions (resolve, escalate). Tools targeting specific resources MUST override
        // via `AgentTool.idempotencyKey` to encode the resource (e.g. `org:42:order:123:approve`).
        const typedInput = input as Parameters<typeof capturedTool.execute>[0]["input"];
        const actionKey = capturedTool.idempotencyKey
          ? capturedTool.idempotencyKey(typedInput, ctx)
          : `conv:${ctx.conversationId}:${capturedTool.name}`;

        if (capturedTool.sideEffecting) {
          // Layer-1: claim the action slot (mutex).
          const { data: claimRows, error: claimError } = await admin.rpc("agent_action_claim", {
            idempotency_key: actionKey,
            conversation_message_id: ctx.conversationMessageId,
            profile_id: ctx.profileId,
            organization_id: ctx.organizationId ?? undefined,
            tool_name: capturedTool.name,
            // biome-ignore lint/suspicious/noExplicitAny: Json type vs Record<string,unknown> — safe cast
            tool_input: input as unknown as any,
          });

          if (claimError) {
            log.error("[buildPermittedTools] agent_action_claim failed", { tool: key, error: claimError.message });
            return { ok: false, error: "claim failed", detail: claimError.message };
          }

          const claimRow = (claimRows as Array<Record<string, unknown>>)?.[0];
          if (!claimRow || !claimRow["claimed"]) {
            // Another concurrent handler already claimed this action — return prior output.
            log.info("[buildPermittedTools] action already claimed, returning prior output", {
              tool: key,
              priorStatus: claimRow?.["prior_status"],
            });
            return {
              ok: true,
              note: "already_executed",
              priorStatus: claimRow?.["prior_status"],
              priorOutput: claimRow?.["prior_output"],
            };
          }

          // Won the claim — run the side effect.
          let result: Record<string, unknown>;
          let finalStatus: "executed" | "error" = "executed";
          try {
            result = await capturedTool.execute({
              input: typedInput,
              ctx,
              admin,
              idempotencyKey: actionKey,
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            log.error("[buildPermittedTools] tool execute threw", { tool: key, error: message });
            result = { ok: false, error: message };
            finalStatus = "error";
          }

          // Finalize audit log.
          const { error: completeError } = await admin.rpc("agent_action_complete", {
            idempotency_key: actionKey,
            status: finalStatus,
            // biome-ignore lint/suspicious/noExplicitAny: Json type vs Record<string,unknown> — safe cast
            tool_output: result as unknown as any,
          });
          if (completeError) {
            log.error("[buildPermittedTools] agent_action_complete failed", {
              tool: key,
              error: completeError.message,
            });
          }

          return result;
        }

        // Read-only tool — execute directly, no claim.
        return capturedTool.execute({
          input: typedInput,
          ctx,
          admin,
          idempotencyKey: actionKey,
        });
      },
    });
  }

  return permitted;
}
