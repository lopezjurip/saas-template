/**
 * Inbound identity and scope resolution for the P4 agent pipeline.
 *
 * Given a provider-verified inbound message, resolves:
 *   1. The sender → verified `profile_contacts` row for this channel.
 *   2. The conversation scope (via reply_token correlation or cold-inbound membership lookup).
 *   3. Idempotency key namespaced by channel.
 *
 * Returns a typed `InboundContext` consumed by the agent loop and webhook handlers.
 *
 * @example
 * const ctx = await resolveInbound(admin, {
 *   channel: "email",
 *   senderAddress: "user@example.com",
 *   replyToken: "abc123...",
 *   providerMessageId: "svix-msg-001",
 *   body: "Please approve the payment",
 *   rawPayload: {},
 *   signatureVerified: true,
 * });
 */

import type { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { debug } from "~/lib/debug";

const log = debug("api:inbound:resolver");

// ============================================================
// Types
// ============================================================

export type InboundChannel = "email" | "whatsapp" | "sms";

export interface InboundParams {
  /** Channel the inbound arrived on. */
  channel: InboundChannel;
  /**
   * Normalized sender address: email address or E.164 phone number.
   * Used to look up the verified profile_contacts row.
   */
  senderAddress: string;
  /**
   * The per-delivery reply_token embedded in the original outbound message
   * (plus-address, [ref:XXXX], or message ref). Null = cold inbound.
   */
  replyToken: string | null;
  /** Provider-assigned message ID for idempotency deduplication. */
  providerMessageId: string;
  /** Plain-text body of the inbound message. */
  body: string;
  /** Raw provider payload to persist in message_payload. */
  rawPayload: Record<string, unknown>;
  /** Whether the provider signature was cryptographically verified. */
  signatureVerified: boolean;
}

/** Resolved scope when identity + correlation succeed. */
export interface InboundContext {
  /** The inbound conversation_message_id just inserted (or deduplicated). */
  conversationMessageId: string;
  conversationId: string;
  profileId: string;
  organizationId: number | null;
  agencyId: string | null;
  tenantId: number | null;
  /** True when the conversation was already resolved before this inbound. */
  alreadyResolved: boolean;
  /** Idempotency key used for message dedup. */
  idempotencyKey: string;
  /** Thread messages for agent context (newest last). */
  threadMessages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  channel: InboundChannel;
  body: string;
}

/** Outcome when sender cannot be verified or resolved. */
export interface InboundRejection {
  reason: "sender_not_verified" | "conversation_not_found" | "no_membership" | "error";
  detail: string;
}

export type ResolveInboundResult = { ok: true; ctx: InboundContext } | { ok: false; rejection: InboundRejection };

// ============================================================
// Main resolver
// ============================================================

/**
 * Resolves inbound identity + scope, ingests the message row, returns context for the agent.
 *
 * Call ONLY after provider signature has been verified by the webhook handler.
 *
 * @example
 * const result = await resolveInbound(admin, params);
 * if (!result.ok) { log.warn("rejected", result.rejection); return; }
 * await runAgentLoop(result.ctx);
 */
export async function resolveInbound(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  params: InboundParams,
): Promise<ResolveInboundResult> {
  const { channel, senderAddress, replyToken, providerMessageId, body, rawPayload, signatureVerified } = params;

  // Step 1: Verify sender maps to a verified profile_contacts row.
  type MessageChannel = "in_app" | "email" | "web_push" | "whatsapp" | "sms";
  const { data: contact, error: contactError } = await (admin as unknown as SupabaseClient)
    .from("profile_contacts")
    .select("profile_id, contact_value")
    .eq("message_channel", channel as MessageChannel)
    .ilike("contact_value", senderAddress)
    .not("contact_verified_at", "is", null)
    .maybeSingle();

  if (contactError) {
    log.error("[resolveInbound] profile_contacts lookup failed", {
      error: contactError.message,
      channel,
      senderAddress,
    });
    return { ok: false, rejection: { reason: "error", detail: contactError.message } };
  }

  if (!contact) {
    log.warn("[resolveInbound] no verified contact found", { channel, senderAddress });
    return {
      ok: false,
      rejection: { reason: "sender_not_verified", detail: `no verified ${channel} contact for ${senderAddress}` },
    };
  }

  const profileId = contact["profile_id"] as string;

  // Step 2: Correlate to conversation.
  let conversationId: string | null = null;

  if (replyToken) {
    // Warm path: reply_token → delivery → message → conversation.
    // Outbound embeds only the first 12 chars of the 64-char token as `[ref:XXXX]`
    // to stay within SMS character limits. Use a prefix-match here to correlate.
    // The replyToken extractor regex only matches hex chars so no LIKE-injection risk.
    const { data: delivery, error: deliveryError } = await (admin as unknown as SupabaseClient)
      .from("conversation_message_deliveries")
      .select("conversation_message_id, conversation_messages ( conversation_id )")
      .like("reply_token", `${replyToken}%`)
      .order("conversation_message_delivery_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (deliveryError) {
      log.warn("[resolveInbound] delivery lookup error", { replyToken, error: deliveryError.message });
    } else if (delivery) {
      const msg = delivery["conversation_messages"] as unknown as { conversation_id: string } | null;
      conversationId = msg?.["conversation_id"] ?? null;
    }
  }

  if (!conversationId) {
    // Cold inbound: find the most-recent open conversation for this profile.
    const { data: conv, error: convError } = await (admin as unknown as SupabaseClient)
      .from("conversations")
      .select("conversation_id")
      .eq("profile_id", profileId)
      .eq("conversation_status", "open")
      .order("conversation_last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (convError) {
      log.error("[resolveInbound] conversation lookup failed", { profileId, error: convError.message });
      return { ok: false, rejection: { reason: "error", detail: convError.message } };
    }

    if (!conv) {
      log.warn("[resolveInbound] no open conversation found for cold inbound", { profileId, channel });
      return { ok: false, rejection: { reason: "conversation_not_found", detail: "no open conversation" } };
    }

    conversationId = conv["conversation_id"] as string;
  }

  // Step 3: Ingest inbound message (atomic, deduplicated).
  const { data: ingestRows, error: ingestError } = await admin.rpc("conversation_ingest_inbound", {
    conversation_id: conversationId,
    profile_id: profileId,
    channel: channel as "email" | "in_app" | "web_push" | "whatsapp" | "sms",
    body,
    payload: { ...rawPayload, provider_message_id: providerMessageId },
    provider_message_id: providerMessageId,
    signature_verified: signatureVerified,
  });

  if (ingestError) {
    log.error("[resolveInbound] conversation_ingest_inbound failed", { error: ingestError.message });
    return { ok: false, rejection: { reason: "error", detail: ingestError.message } };
  }

  const ingestRow = (ingestRows as Array<Record<string, unknown>>)?.[0];
  if (!ingestRow) {
    return { ok: false, rejection: { reason: "error", detail: "ingest returned no rows" } };
  }

  const conversationMessageId = ingestRow["out_conversation_message_id"] as string;
  const organizationId = (ingestRow["out_organization_id"] as number | null) ?? null;
  const agencyId = (ingestRow["out_agency_id"] as string | null) ?? null;
  const tenantId = (ingestRow["out_tenant_id"] as number | null) ?? null;
  const alreadyResolved = Boolean(ingestRow["out_already_resolved"]);
  const idempotencyKey = `${channel}:${providerMessageId}`;

  // Step 4: Fetch thread messages for agent history.
  const { data: rawMessages } = await (admin as unknown as SupabaseClient)
    .from("conversation_messages")
    .select("message_author, message_direction, message_body")
    .eq("conversation_id", conversationId)
    .order("message_created_at", { ascending: true })
    .limit(50);

  const threadMessages = ((rawMessages as Array<Record<string, unknown>>) ?? [])
    .map((m) => {
      const author = m["message_author"] as string;
      const dir = m["message_direction"] as string;
      const msgBody = (m["message_body"] as string | null) ?? "";
      // system/agent outbound = assistant; user inbound = user
      const role: "user" | "assistant" = author === "user" && dir === "inbound" ? "user" : "assistant";
      return { role, content: msgBody };
    })
    .filter((m) => m.content.length > 0);

  log.info("[resolveInbound] resolved", {
    conversationMessageId,
    conversationId,
    profileId,
    organizationId,
    alreadyResolved,
    channel,
  });

  return {
    ok: true,
    ctx: {
      conversationMessageId,
      conversationId,
      profileId,
      organizationId,
      agencyId,
      tenantId,
      alreadyResolved,
      idempotencyKey,
      threadMessages,
      channel,
      body,
    },
  };
}
