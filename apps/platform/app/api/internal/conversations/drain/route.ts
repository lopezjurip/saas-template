/**
 * POST /api/internal/conversations/drain
 *
 * Drain worker for the `conversation_outbound` pgmq queue.
 * Reads a batch of queued delivery jobs, routes each to the appropriate
 * ChannelSender, then updates delivery status and deletes the queue message.
 *
 * Authentication: shared secret in `x-drain-secret` header (constant-time compare).
 * Scheduled by pg_cron → pg_net every minute in production.
 * For local testing, call directly:
 *   curl -X POST https://lvh.me:7003/api/internal/conversations/drain \
 *        -H "x-drain-secret: <CONVERSATIONS_DRAIN_SECRET>"
 *
 * Idempotent / safe to call repeatedly — messages with a visibility timeout in flight
 * are invisible until vt elapses (natural dedup). Successful messages are deleted from
 * the queue; failed ones are left for visibility-timeout retry up to MAX_ATTEMPTS, then
 * marked `failed` and deleted so they don't block the queue forever.
 */

import { timingSafeEqual as cryptoTimingSafeEqual } from "node:crypto";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { ChannelSender } from "~/lib/conversations/channel-sender";
import { sendEmailNotification } from "~/lib/conversations/channel-sender-email";
import { sendSmsNotification } from "~/lib/conversations/channel-sender-twilio";
import { sendWebPushNotification } from "~/lib/conversations/channel-sender-web-push";
import { sendWhatsAppNotification } from "~/lib/conversations/channel-sender-whatsapp";
import { debug } from "~/lib/debug";

const log = debug("api:internal:conversations:drain");

const CONVERSATIONS_DRAIN_SECRET = process.env["CONVERSATIONS_DRAIN_SECRET"];

/** Batch size per drain invocation. */
const DRAIN_BATCH_SIZE = 20;
/** Visibility timeout in seconds — message is re-queued for retry after this window. */
const VISIBILITY_TIMEOUT_SECONDS = 60;
/** After this many read attempts the delivery is permanently marked failed and deleted. */
const MAX_ATTEMPTS = 5;

/**
 * A single row returned by `pgmq.read` / `public.conversation_outbound_read`.
 * Typed manually because pgmq types are not included in the Supabase generated schema.
 */
interface PgmqMessage {
  msg_id: string; // bigint comes as string from PostgREST
  read_ct: number;
  enqueued_at: string;
  vt: string;
  message: {
    delivery_id: string;
    message_id: string;
    channel: string;
  };
}

/** Map from `message_channel` enum value to the ChannelSender implementation. */
const CHANNEL_SENDER: Record<string, ChannelSender | undefined> = {
  email: sendEmailNotification,
  whatsapp: sendWhatsAppNotification,
  web_push: sendWebPushNotification,
  sms: sendSmsNotification,
};

/**
 * Typed wrappers for pgmq queue operations.
 *
 * The generated Supabase types do not include `conversation_outbound_read` /
 * `conversation_outbound_delete` because those helper functions are added to the schema
 * after the last `pnpm generate:types` run.  These wrappers cast the Supabase client to
 * `SupabaseClient` (untyped) for these two calls only, keeping full type safety everywhere else.
 *
 * When the DB is next reset + types regenerated, the functions will appear in `Database`
 * and the cast can be removed.
 */
async function pgmqRead(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  vt: number,
  qty: number,
): Promise<{ data: PgmqMessage[] | null; error: { message: string } | null }> {
  return (admin as unknown as SupabaseClient).rpc("conversation_outbound_read", { vt, qty });
}

async function pgmqDelete(admin: ReturnType<typeof createSupabaseServiceRoleClient>, msgId: number): Promise<void> {
  await (admin as unknown as SupabaseClient).rpc("conversation_outbound_delete", { msg_id: msgId });
}

/**
 * Constant-time string comparison to prevent timing attacks when checking the drain secret.
 * Delegates to Node's built-in `crypto.timingSafeEqual` which requires equal-length buffers;
 * pads both sides to the same length before comparing so the length check does not leak.
 *
 * @example
 * const ok = safeEqual("abc", "abc"); // true
 */
function safeEqual(a: string, b: string): boolean {
  const aBytes = Buffer.from(a);
  const bBytes = Buffer.from(b);
  // Use the longer length so both buffers are padded to the same size.
  const len = Math.max(aBytes.length, bBytes.length);
  const aPad = Buffer.concat([aBytes, Buffer.alloc(len - aBytes.length)]);
  const bPad = Buffer.concat([bBytes, Buffer.alloc(len - bBytes.length)]);
  // cryptoTimingSafeEqual is constant-time regardless of content.
  // Lengths match here so it won't throw.
  return aBytes.length === bBytes.length && cryptoTimingSafeEqual(aPad, bPad);
}

export async function POST(request: NextRequest): Promise<Response> {
  // --- Auth gate ---------------------------------------------------------------
  if (!CONVERSATIONS_DRAIN_SECRET) {
    log.error("[POST] CONVERSATIONS_DRAIN_SECRET not set — drain route is disabled");
    return Response.json({ error: "drain not configured" }, { status: 503 });
  }

  const incomingSecret = request.headers.get("x-drain-secret") ?? "";
  if (!safeEqual(incomingSecret, CONVERSATIONS_DRAIN_SECRET)) {
    log.warn("[POST] unauthorized drain request — invalid secret");
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // --- Read queue --------------------------------------------------------------
  const admin = createSupabaseServiceRoleClient();

  const { data: messages, error: readError } = await pgmqRead(admin, VISIBILITY_TIMEOUT_SECONDS, DRAIN_BATCH_SIZE);

  if (readError) {
    log.error("[POST] pgmq read failed", { error: readError.message });
    return Response.json({ error: "queue read failed", detail: readError.message }, { status: 500 });
  }

  const batch = (messages as PgmqMessage[] | null) ?? [];
  if (batch.length === 0) {
    log.info("[POST] queue empty — nothing to drain");
    return Response.json({ drained: 0, results: [] });
  }

  log.info("[POST] draining batch", { count: batch.length });

  // --- Process each message ----------------------------------------------------
  interface DrainResult {
    msgId: string;
    deliveryId: string;
    channel: string;
    outcome: "sent" | "failed" | "skipped" | "error";
    providerMessageId?: string;
    error?: string;
  }
  const results: DrainResult[] = [];

  for (const msg of batch) {
    const msgId = msg["msg_id"];
    const readCount = msg["read_ct"] ?? 1;
    const { delivery_id: deliveryId, message_id: messageId, channel } = msg["message"];

    log.info("[POST] processing message", { msgId, deliveryId, channel, readCount });

    // Fetch delivery + message + conversation + recipient in one query.
    const { data: delivery, error: deliveryFetchError } = await admin
      .from("conversation_message_deliveries")
      .select(`
        conversation_message_delivery_id,
        message_channel,
        delivery_status,
        reply_token,
        conversation_messages (
          conversation_message_id,
          message_body,
          message_payload,
          message_priority,
          conversations (
            conversation_id,
            profile_id,
            conversation_subject,
            profiles (
              profile_id
            )
          )
        )
      `)
      .eq("conversation_message_delivery_id", deliveryId)
      .maybeSingle();

    if (deliveryFetchError) {
      log.error("[POST] delivery fetch error", { msgId, deliveryId, error: deliveryFetchError.message });
      results.push({ msgId, deliveryId, channel, outcome: "error", error: deliveryFetchError.message });
      continue;
    }

    if (!delivery) {
      // Delivery row was deleted (e.g. message cancelled). Safe to delete queue msg.
      log.warn("[POST] delivery not found, deleting queue message", { msgId, deliveryId });
      await pgmqDelete(admin, Number(msgId));
      results.push({ msgId, deliveryId, channel, outcome: "skipped", error: "delivery row not found" });
      continue;
    }

    // Already processed (idempotent guard).
    if (delivery["delivery_status"] !== "queued") {
      log.info("[POST] delivery already processed, deleting queue message", {
        msgId,
        deliveryId,
        status: delivery["delivery_status"],
      });
      await pgmqDelete(admin, Number(msgId));
      results.push({
        msgId,
        deliveryId,
        channel,
        outcome: "skipped",
        error: `already in status: ${delivery["delivery_status"]}`,
      });
      continue;
    }

    // Cap retry attempts — mark permanently failed after MAX_ATTEMPTS.
    if (readCount > MAX_ATTEMPTS) {
      log.warn("[POST] delivery exceeded max attempts, marking failed", {
        msgId,
        deliveryId,
        readCount,
        MAX_ATTEMPTS,
      });
      await admin
        .from("conversation_message_deliveries")
        .update({
          delivery_status: "failed",
          delivery_error: `exceeded max attempts (${readCount})`,
        })
        .eq("conversation_message_delivery_id", deliveryId);
      await pgmqDelete(admin, Number(msgId));
      results.push({ msgId, deliveryId, channel, outcome: "failed", error: "exceeded max attempts" });
      continue;
    }

    // Resolve sender.
    const sender = CHANNEL_SENDER[channel];
    if (!sender) {
      log.error("[POST] unknown channel", { msgId, deliveryId, channel });
      await admin
        .from("conversation_message_deliveries")
        .update({ delivery_status: "failed", delivery_error: `unknown channel: ${channel}` })
        .eq("conversation_message_delivery_id", deliveryId);
      await pgmqDelete(admin, Number(msgId));
      results.push({ msgId, deliveryId, channel, outcome: "failed", error: `unknown channel: ${channel}` });
      continue;
    }

    // Extract nested data using bracket notation (external DB row).
    const convMessage = delivery["conversation_messages"];
    const conversation = convMessage?.["conversations"];
    const profileId = conversation?.["profile_id"] ?? "";
    const conversationId = conversation?.["conversation_id"] ?? "";
    const replyToken = delivery["reply_token"] ?? "";
    const body = convMessage?.["message_body"] ?? null;
    const rawPayload = convMessage?.["message_payload"];
    const subject = conversation?.["conversation_subject"] ?? null;
    const payload: Record<string, unknown> =
      rawPayload && typeof rawPayload === "object" && !Array.isArray(rawPayload)
        ? (rawPayload as Record<string, unknown>)
        : {};

    // Resolve recipient email / phone from profile_contacts for the relevant channel.
    // The sender receives these in `payload` so it does not need to query again.
    const resolvedPayload = await resolveChannelContact(admin, profileId, channel, payload);

    // Call the channel sender.
    let senderResult: Awaited<ReturnType<ChannelSender>>;
    try {
      senderResult = await sender({
        deliveryId,
        messageId,
        conversationId,
        profileId,
        replyToken,
        subject,
        body,
        payload: resolvedPayload,
        locale: "en", // TODO: derive from profile locale once profiles carry it
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error("[POST] sender threw unexpectedly", { msgId, deliveryId, channel, error: message });
      senderResult = { status: "failed", error: `sender threw: ${message}` };
    }

    log.info("[POST] sender result", { msgId, deliveryId, channel, status: senderResult.status });

    // Persist result.
    if (senderResult.status === "sent" || senderResult.status === "skipped") {
      await admin
        .from("conversation_message_deliveries")
        .update({
          delivery_status: senderResult.status === "sent" ? "sent" : "skipped",
          provider_message_id: senderResult["providerMessageId"] ?? null,
          delivery_sent_at: senderResult.status === "sent" ? new Date().toISOString() : null,
          delivery_error: senderResult["error"] ?? null,
        })
        .eq("conversation_message_delivery_id", deliveryId);

      // Remove from queue — success or intentional skip.
      await pgmqDelete(admin, Number(msgId));
    } else {
      // Failed — leave in queue for visibility-timeout retry (don't delete).
      // Update delivery_error so the last failure reason is always visible.
      await admin
        .from("conversation_message_deliveries")
        .update({ delivery_error: senderResult["error"] ?? "unknown failure" })
        .eq("conversation_message_delivery_id", deliveryId);
    }

    results.push({
      msgId,
      deliveryId,
      channel,
      outcome: senderResult.status,
      providerMessageId: senderResult["providerMessageId"],
      error: senderResult["error"],
    });
  }

  const summary = {
    drained: batch.length,
    sent: results.filter((r) => r.outcome === "sent").length,
    skipped: results.filter((r) => r.outcome === "skipped").length,
    failed: results.filter((r) => r.outcome === "failed").length,
    error: results.filter((r) => r.outcome === "error").length,
    results,
  };

  log.info("[POST] drain complete", summary);
  return Response.json(summary);
}

/**
 * Resolves channel-specific contact addresses (email, phone) from `profile_contacts`
 * and merges them into the message payload so senders don't need extra DB queries.
 *
 * @example
 * const payload = await resolveChannelContact(admin, profileId, "email", {});
 * // { recipient_email: "user@example.com" }
 */
async function resolveChannelContact(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  profileId: string,
  channel: string,
  basePayload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  // Channels that need a contact address resolved from profile_contacts.
  const contactChannels = new Set(["email", "whatsapp", "sms"]);
  if (!contactChannels.has(channel) || !profileId) return basePayload;

  // Cast channel to the DB enum type — validated by `contactChannels.has(channel)` above.
  type MessageChannel = "in_app" | "email" | "web_push" | "whatsapp" | "sms";
  const { data: contact } = await admin
    .from("profile_contacts")
    .select("contact_value")
    .eq("profile_id", profileId)
    .eq("message_channel", channel as MessageChannel)
    .not("contact_verified_at", "is", null)
    .maybeSingle();

  if (!contact) return basePayload;

  const contactValue = contact["contact_value"];
  const channelKey: Record<string, string> = {
    email: "recipient_email",
    whatsapp: "recipient_phone",
    sms: "recipient_phone",
  };
  const key = channelKey[channel];
  if (!key) return basePayload;

  return { ...basePayload, [key]: contactValue };
}
