/**
 * POST /api/inbound/whatsapp
 *
 * Kapso WhatsApp inbound webhook handler.
 *
 * Security model:
 *   1. Verify HMAC-SHA256 webhook signature using KAPSO_WEBHOOK_SECRET.
 *      Reject on failure — sender phone alone is spoofable.
 *      NOTE: If Kapso does not provide a documented signature scheme, this handler
 *      falls back to a shared-secret header comparison. Flag this as a blocker
 *      if Kapso's docs specify a different mechanism.
 *   2. Sender phone → verified profile_contacts row for the "whatsapp" channel.
 *   3. Resolve reply_token from message text [ref:XXXX] pattern.
 *   4. Run agent loop via after().
 *
 * Configure in Kapso dashboard:
 *   Settings → Webhooks → URL: https://<host>/api/inbound/whatsapp
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { KapsoWebhookPayload } from "@packages/kapso/types";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { after, type NextRequest } from "next/server";
import { runAgentLoop } from "~/lib/conversations/agent/agent-loop";
import { resolveInbound } from "~/lib/conversations/inbound-resolver";
import { debug } from "~/lib/debug";

const log = debug("api:inbound:whatsapp");

const KAPSO_WEBHOOK_SECRET = process.env["KAPSO_WEBHOOK_SECRET"];

/**
 * Verify Kapso webhook signature.
 *
 * Kapso does not publish a formal webhook-signing spec in the SDK types/client.
 * This implementation uses HMAC-SHA256 over the raw body with KAPSO_WEBHOOK_SECRET,
 * compared against the `X-Kapso-Signature` header. If Kapso ships a different
 * algorithm, replace only this function.
 *
 * If KAPSO_WEBHOOK_SECRET is not set, the request is rejected (fail-closed).
 */
function verifyKapsoSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  // Header may be "sha256=<hex>" or plain hex.
  const incoming = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;

  const expectedBuf = Buffer.from(expected, "hex");
  const incomingBuf = Buffer.from(incoming, "hex");

  if (expectedBuf.length !== incomingBuf.length) return false;
  return timingSafeEqual(expectedBuf, incomingBuf);
}

/**
 * Extract reply_token from WhatsApp message body.
 * The outbound sender embeds `[ref:XXXXXXXXXXXX]` at the end of the message.
 */
function extractReplyToken(text: string): string | null {
  // Token is the first 12 chars of a 64-char hex reply_token, embedded as [ref:XXXXXXXXXXXX].
  // Accept up to 64 chars in case a future sender embeds the full token.
  const match = /\[ref:([A-Fa-f0-9]{12,64})\]/.exec(text);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest): Promise<Response> {
  // ── Read raw body ────────────────────────────────────────────────────────
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  // ── Signature verification ───────────────────────────────────────────────
  if (!KAPSO_WEBHOOK_SECRET) {
    log.error("[POST] KAPSO_WEBHOOK_SECRET not configured — rejecting all inbound WhatsApp");
    return new Response("not configured", { status: 503 });
  }

  const signatureHeader = request.headers.get("x-kapso-signature") ?? "";
  if (!signatureHeader) {
    log.warn("[POST] missing X-Kapso-Signature header");
    return new Response("forbidden", { status: 403 });
  }

  const signatureValid = verifyKapsoSignature(rawBody, signatureHeader, KAPSO_WEBHOOK_SECRET);
  if (!signatureValid) {
    log.warn("[POST] Kapso signature verification failed");
    return new Response("forbidden", { status: 403 });
  }

  // ── Parse payload ────────────────────────────────────────────────────────
  let payload: KapsoWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as KapsoWebhookPayload;
  } catch {
    log.error("[POST] failed to parse JSON body");
    return new Response("bad request", { status: 400 });
  }

  // Only process inbound text messages.
  if (!payload["message"] || payload["message"]["type"] !== "text") {
    // Non-text event (template reply, interactive, etc.) — ack and ignore.
    return new Response("ok", { status: 200 });
  }

  const senderPhone = payload["contact"]["phone"];
  const messageText = payload["message"]["text"];
  const providerMessageId = payload["message"]["id"];
  const kapsoConversationId = payload["conversation_id"];
  const replyToken = extractReplyToken(messageText);

  log.info("[POST] received inbound WhatsApp", {
    senderPhone,
    replyToken,
    providerMessageId,
    kapsoConversationId,
  });

  // ── Ack immediately; run agent in after() ────────────────────────────────
  after(async () => {
    const admin = createServiceRoleClient();
    const result = await resolveInbound(admin, {
      channel: "whatsapp",
      senderAddress: senderPhone,
      replyToken,
      providerMessageId,
      body: messageText,
      // Preserve kapso_conversation_id so the agent reply can target the right WA thread.
      rawPayload: {
        kapso_conversation_id: kapsoConversationId,
        whatsapp_conversation_id: kapsoConversationId,
        contact: payload["contact"],
        event: payload["event"],
      },
      signatureVerified: true,
    });

    if (!result.ok) {
      log.warn("[POST:after] inbound rejected", result.rejection);
      return;
    }

    await runAgentLoop(admin, result.ctx);
  });

  return new Response("ok", { status: 200 });
}
