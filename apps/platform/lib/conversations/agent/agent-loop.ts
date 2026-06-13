/**
 * Inbound agent loop — Vercel AI SDK + Anthropic.
 *
 * Reads the resolved conversation thread as message history, builds a permission-gated
 * tool set, runs a multi-step `generateText` loop, then posts the agent reply to the
 * conversation and dispatches it over the originating channel via the ChannelSender registry.
 *
 * The caller (webhook handler) must have already:
 *   1. Verified the provider signature.
 *   2. Called `resolveInbound()` to get `InboundContext`.
 *   3. Checked `ctx.alreadyResolved` and short-circuited if true.
 *
 * @example
 * await runAgentLoop(admin, ctx);
 */

import { anthropic } from "@ai-sdk/anthropic";
import type { createServiceRoleClient } from "@packages/supabase/client.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateText, stepCountIs } from "ai";
import { debug } from "~/lib/debug";
import type { ChannelSender } from "../channel-sender";
import { sendEmailNotification } from "../channel-sender-email";
import { sendSmsNotification } from "../channel-sender-twilio";
import { sendWebPushNotification } from "../channel-sender-web-push";
import { sendWhatsAppNotification } from "../channel-sender-whatsapp";
import type { InboundContext } from "../inbound-resolver";
import { buildPermittedTools } from "./tool-registry";

const log = debug("api:inbound:agent:loop");

/** Model IDs — do NOT change these without verifying provider support. */
const AGENT_MODEL = "claude-opus-4-8";

/** Channel → ChannelSender for reply dispatch. */
const REPLY_SENDER: Record<string, ChannelSender | undefined> = {
  email: sendEmailNotification,
  whatsapp: sendWhatsAppNotification,
  sms: sendSmsNotification,
  web_push: sendWebPushNotification,
};

/**
 * Run the agent loop for an inbound message and deliver the reply.
 *
 * Handles:
 *   - Layer-2 short-circuit: if conversation is already resolved, reply "already handled".
 *   - Permission-gated tool set built per caller's org membership.
 *   - Multi-step `generateText` with up to 10 steps.
 *   - Agent reply inserted as `agent`/`outbound` message + dispatched over originating channel.
 *
 * @example
 * await runAgentLoop(admin, ctx);
 */
export async function runAgentLoop(
  admin: ReturnType<typeof createServiceRoleClient>,
  ctx: InboundContext,
): Promise<void> {
  log.info("[runAgentLoop] starting", {
    conversationMessageId: ctx.conversationMessageId,
    conversationId: ctx.conversationId,
    profileId: ctx.profileId,
    channel: ctx.channel,
    alreadyResolved: ctx.alreadyResolved,
  });

  // Layer-2: conversation already resolved — post "already handled" agent message.
  if (ctx.alreadyResolved) {
    log.info("[runAgentLoop] Layer-2 short-circuit: conversation already resolved", {
      conversationId: ctx.conversationId,
    });
    const alreadyHandledText =
      "This request has already been handled. If you have a new question, please start a new conversation.";
    await postAgentReply(admin, ctx, alreadyHandledText);
    return;
  }

  // Build permission-gated tool set.
  const tools = await buildPermittedTools(admin, ctx);
  const toolCount = Object.keys(tools).length;
  log.info("[runAgentLoop] tools built", { toolCount, tools: Object.keys(tools) });

  // Build system prompt with resolved identity + scope context.
  const systemPrompt = buildSystemPrompt(ctx, Object.keys(tools));

  // Build message history from thread (already converted in inbound-resolver).
  // The current user message is already in the thread (just ingested).
  const messages = ctx.threadMessages;

  // Run the agent loop.
  let agentReplyText: string;
  try {
    const { text } = await generateText({
      model: anthropic(AGENT_MODEL),
      system: systemPrompt,
      messages,
      tools,
      stopWhen: stepCountIs(10),
    });
    agentReplyText = text.trim() || "I've processed your request. Let me know if you need anything else.";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("[runAgentLoop] generateText failed", { error: message, conversationId: ctx.conversationId });
    agentReplyText = "I encountered an error processing your request. Please try again or contact support.";
  }

  log.info("[runAgentLoop] agent reply generated", {
    conversationId: ctx.conversationId,
    replyLength: agentReplyText.length,
  });

  // Post agent reply to thread + dispatch over originating channel.
  await postAgentReply(admin, ctx, agentReplyText);
}

/**
 * Insert the agent reply as an `agent`/`outbound` message and dispatch it
 * over the originating channel by enqueuing a delivery.
 */
async function postAgentReply(
  admin: ReturnType<typeof createServiceRoleClient>,
  ctx: InboundContext,
  replyText: string,
): Promise<void> {
  // Insert agent outbound message.
  const { data: msgData, error: msgError } = await (admin as unknown as SupabaseClient)
    .from("conversation_messages")
    .insert({
      conversation_id: ctx.conversationId,
      message_author: "agent",
      message_direction: "outbound",
      message_body: replyText,
      message_payload: {},
    })
    .select("conversation_message_id")
    .single();

  if (msgError || !msgData) {
    log.error("[postAgentReply] failed to insert agent message", {
      error: msgError?.message,
      conversationId: ctx.conversationId,
    });
    return;
  }

  const agentMessageId = (msgData as Record<string, unknown>)["conversation_message_id"] as string;

  // Resolve the recipient contact for the originating channel.
  const contactChannels = new Set(["email", "whatsapp", "sms"]);
  const recipientPayload: Record<string, unknown> = {};

  if (contactChannels.has(ctx.channel)) {
    type MessageChannel = "in_app" | "email" | "web_push" | "whatsapp" | "sms";
    const { data: contact } = await (admin as unknown as SupabaseClient)
      .from("profile_contacts")
      .select("contact_value")
      .eq("profile_id", ctx.profileId)
      .eq("message_channel", ctx.channel as MessageChannel)
      .not("contact_verified_at", "is", null)
      .maybeSingle();

    if (contact) {
      const contactValue = (contact as Record<string, unknown>)["contact_value"] as string;
      const channelKey: Record<string, string> = {
        email: "recipient_email",
        whatsapp: "recipient_phone",
        sms: "recipient_phone",
      };
      const key = channelKey[ctx.channel];
      if (key) {
        recipientPayload[key] = contactValue;
      }
    }
  }

  // Generate a reply token for this delivery.
  const replyToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

  // Insert delivery row for the originating channel.
  const { data: deliveryData, error: deliveryError } = await (admin as unknown as SupabaseClient)
    .from("conversation_message_deliveries")
    .insert({
      conversation_message_id: agentMessageId,
      message_channel: ctx.channel,
      delivery_status: "queued",
      reply_token: replyToken,
    })
    .select("conversation_message_delivery_id")
    .single();

  if (deliveryError || !deliveryData) {
    log.error("[postAgentReply] failed to insert delivery", {
      error: deliveryError?.message,
      agentMessageId,
    });
    return;
  }

  const deliveryId = (deliveryData as Record<string, unknown>)["conversation_message_delivery_id"] as string;

  // Fetch conversation subject.
  const { data: convData } = await (admin as unknown as SupabaseClient)
    .from("conversations")
    .select("conversation_subject")
    .eq("conversation_id", ctx.conversationId)
    .single();

  const subject = convData ? ((convData as Record<string, unknown>)["conversation_subject"] as string | null) : null;

  // Dispatch immediately via the ChannelSender (bypass pgmq for agent replies
  // to keep latency low; in-process send, no queue hop).
  const sender = REPLY_SENDER[ctx.channel];
  if (!sender) {
    log.warn("[postAgentReply] no sender for channel", { channel: ctx.channel });
    return;
  }

  try {
    const result = await sender({
      deliveryId,
      messageId: agentMessageId,
      conversationId: ctx.conversationId,
      profileId: ctx.profileId,
      replyToken,
      subject,
      body: replyText,
      payload: recipientPayload,
      locale: "en",
    });

    log.info("[postAgentReply] sent", { channel: ctx.channel, status: result.status, deliveryId });

    // Update delivery status.
    await (admin as unknown as SupabaseClient)
      .from("conversation_message_deliveries")
      .update({
        delivery_status: result.status === "sent" ? "sent" : result.status === "skipped" ? "skipped" : "failed",
        provider_message_id: result.providerMessageId ?? null,
        delivery_sent_at: result.status === "sent" ? new Date().toISOString() : null,
        delivery_error: result.error ?? null,
      })
      .eq("conversation_message_delivery_id", deliveryId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("[postAgentReply] sender threw", { channel: ctx.channel, error: message });
    await (admin as unknown as SupabaseClient)
      .from("conversation_message_deliveries")
      .update({ delivery_status: "failed", delivery_error: message })
      .eq("conversation_message_delivery_id", deliveryId);
  }
}

/**
 * Build the system prompt for the agent with resolved identity + scope context.
 */
function buildSystemPrompt(ctx: InboundContext, availableToolNames: string[]): string {
  const scopeLines: string[] = [];
  if (ctx.organizationId) scopeLines.push(`Organization ID: ${ctx.organizationId}`);
  if (ctx.tenantId) scopeLines.push(`Tenant ID: ${ctx.tenantId}`);
  if (ctx.agencyId) scopeLines.push(`Agency ID: ${ctx.agencyId}`);

  const toolList = availableToolNames.length > 0 ? availableToolNames.join(", ") : "none";

  return [
    "You are a helpful AI assistant for a SaaS platform.",
    "You received this message via an inbound channel reply.",
    "",
    "## Resolved identity",
    `Profile ID: ${ctx.profileId}`,
    `Channel: ${ctx.channel}`,
    ...(scopeLines.length > 0 ? ["", "## Scope", ...scopeLines] : []),
    "",
    "## Instructions",
    "- Respond concisely and helpfully.",
    "- If the user's intent is clear, execute the appropriate tool immediately — do not ask for confirmation.",
    "- If the intent is ambiguous or you lack sufficient context, ask a clarifying question.",
    "- Only use tools that are available to you — do not promise actions you cannot take.",
    `- Available tools: ${toolList}`,
    "",
    "## Safety rules",
    "- Never impersonate the user or claim to be human.",
    "- Never execute an action you don't have a tool for.",
    "- If you encounter an error, tell the user clearly and suggest they contact support.",
  ].join("\n");
}
