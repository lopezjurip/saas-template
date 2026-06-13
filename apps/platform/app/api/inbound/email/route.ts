/**
 * POST /api/inbound/email
 *
 * Resend inbound email webhook handler.
 *
 * Security model:
 *   1. Verify Svix webhook signature (X-Svix-Id, X-Svix-Timestamp, X-Svix-Signature headers).
 *      Reject on failure — from-header alone is spoofable.
 *   2. Verify DKIM/SPF verdict fields from the Resend payload (spf.result, dkim.result).
 *      Reject if both fail.
 *   3. Extract reply_token from plus-address recipient `reply+<token>@<domain>` or X-Reply-Token header.
 *   4. Resolve identity + ingest via resolveInbound.
 *   5. If resolved and not already-handled: run agent loop in `after()`.
 *
 * Returns 200 immediately after signature verification; agent runs asynchronously
 * so Resend's retry timeout is not triggered by model latency.
 *
 * Configure in Resend dashboard:
 *   Domains → your domain → Inbound → Webhook URL: https://<host>/api/inbound/email
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { after, type NextRequest } from "next/server";
import { runAgentLoop } from "~/lib/conversations/agent/agent-loop";
import { resolveInbound } from "~/lib/conversations/inbound-resolver";
import { debug } from "~/lib/debug";

const log = debug("api:inbound:email");

const RESEND_WEBHOOK_SECRET = process.env["RESEND_WEBHOOK_SECRET"];
const RESEND_INBOUND_DOMAIN = process.env["RESEND_INBOUND_DOMAIN"];

/**
 * Verify Resend inbound webhook signature using Svix signing scheme.
 *
 * Svix sign format: "v1,<base64-hmac-sha256>"
 * String to sign: `${svixId}.${svixTimestamp}.${rawBody}`
 * Accept signatures within ±5 min to prevent replay.
 */
function verifySvixSignature(
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): boolean {
  // Replay guard: reject if timestamp is more than 5 minutes old.
  const ts = Number(svixTimestamp);
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    return false;
  }

  const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;

  // Svix secret is "whsec_<base64>"; strip prefix if present.
  const secretBytes = secret.startsWith("whsec_") ? Buffer.from(secret.slice(6), "base64") : Buffer.from(secret);

  const expectedHmac = createHmac("sha256", secretBytes).update(toSign, "utf8").digest("base64");

  // svixSignature may contain multiple space-separated signatures ("v1,xxx v1,yyy").
  for (const sig of svixSignature.split(" ")) {
    const parts = sig.split(",");
    if (parts[0] !== "v1" || !parts[1]) continue;
    const incoming = Buffer.from(parts[1], "base64");
    const expected = Buffer.from(expectedHmac, "base64");
    if (incoming.length === expected.length && timingSafeEqual(incoming, expected)) {
      return true;
    }
  }
  return false;
}

/**
 * Extract the reply_token from the recipient address or X-Reply-Token header.
 *
 * Looks for: `reply+<token>@<RESEND_INBOUND_DOMAIN>` in the `to` array,
 * or the `X-Reply-Token` custom header on the original outbound email.
 */
function extractReplyToken(payload: Record<string, unknown>): string | null {
  // Try X-Reply-Token header first (set by channel-sender-email.ts).
  const headers = payload["headers"];
  if (headers && typeof headers === "object" && !Array.isArray(headers)) {
    const xReplyToken = (headers as Record<string, string>)["X-Reply-Token"];
    if (xReplyToken) return xReplyToken;
  }

  // Try plus-address: reply+<token>@<domain>
  const toAddresses = payload["to"];
  const addresses: string[] = Array.isArray(toAddresses)
    ? (toAddresses as string[])
    : typeof toAddresses === "string"
      ? [toAddresses]
      : [];

  for (const addr of addresses) {
    if (!RESEND_INBOUND_DOMAIN) break;
    const match = /reply\+([^@]+)@/.exec(addr);
    if (match?.[1]) return match[1];
  }

  // Try In-Reply-To header as a last resort (may embed message ID containing token).
  if (headers && typeof headers === "object") {
    const inReplyTo = (headers as Record<string, string>)["In-Reply-To"] ?? "";
    const match = /reply\+([^@>]+)@/.exec(inReplyTo);
    if (match?.[1]) return match[1];
  }

  return null;
}

export async function POST(request: NextRequest): Promise<Response> {
  // ── Read raw body ────────────────────────────────────────────────────────
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  // ── Svix signature verification ──────────────────────────────────────────
  if (!RESEND_WEBHOOK_SECRET) {
    log.error("[POST] RESEND_WEBHOOK_SECRET not configured — rejecting all inbound email");
    return new Response("not configured", { status: 503 });
  }

  const svixId = request.headers.get("svix-id") ?? "";
  const svixTimestamp = request.headers.get("svix-timestamp") ?? "";
  const svixSignature = request.headers.get("svix-signature") ?? "";

  if (!svixId || !svixTimestamp || !svixSignature) {
    log.warn("[POST] missing Svix headers");
    return new Response("forbidden", { status: 403 });
  }

  const signatureValid = verifySvixSignature(rawBody, svixId, svixTimestamp, svixSignature, RESEND_WEBHOOK_SECRET);
  if (!signatureValid) {
    log.warn("[POST] Svix signature verification failed", { svixId });
    return new Response("forbidden", { status: 403 });
  }

  // ── Parse payload ────────────────────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    log.error("[POST] failed to parse JSON body");
    return new Response("bad request", { status: 400 });
  }

  // Resend inbound event type guard.
  if (payload["type"] !== "email.received" && payload["type"] !== "inbound") {
    // Not an inbound email event — acknowledge and ignore.
    return new Response("ok", { status: 200 });
  }

  const data = (payload["data"] ?? payload) as Record<string, unknown>;

  // ── DKIM / SPF verification ──────────────────────────────────────────────
  // Resend provides spf.result and dkim.result in the payload.
  // Reject if BOTH fail (not just one — some providers don't set both).
  const spfResult = (data["spf"] as Record<string, unknown> | undefined)?.["result"];
  const dkimResult = (data["dkim"] as Record<string, unknown> | undefined)?.["result"];
  const spfFail = spfResult !== undefined && spfResult !== "pass" && spfResult !== "neutral";
  const dkimFail = dkimResult !== undefined && dkimResult !== "pass";

  if (spfFail && dkimFail) {
    log.warn("[POST] SPF and DKIM both failed — rejecting", { spfResult, dkimResult, svixId });
    return new Response("forbidden", { status: 403 });
  }

  // ── Extract sender + body + reply_token ──────────────────────────────────
  const senderAddress = (data["from"] as string | undefined) ?? "";
  // Strip display name: "John Doe <john@example.com>" → "john@example.com"
  const emailMatch = /<([^>]+)>/.exec(senderAddress);
  const senderEmail = (emailMatch?.[1] ?? senderAddress).toLowerCase().trim();

  const body = (data["text"] as string | undefined) ?? (data["html"] as string | undefined) ?? "";
  const providerMessageId = (svixId || (data["message_id"] as string | undefined)) ?? "";
  const replyToken = extractReplyToken(data);

  log.info("[POST] received inbound email", {
    senderEmail,
    replyToken,
    providerMessageId,
    bodyLength: body.length,
  });

  // ── Ack immediately; run agent in after() ────────────────────────────────
  after(async () => {
    const admin = createServiceRoleClient();
    const result = await resolveInbound(admin, {
      channel: "email",
      senderAddress: senderEmail,
      replyToken,
      providerMessageId,
      body,
      rawPayload: data,
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
