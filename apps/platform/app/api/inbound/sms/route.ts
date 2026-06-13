/**
 * POST /api/inbound/sms
 *
 * Twilio SMS inbound webhook handler.
 *
 * Security model:
 *   1. Delegates all Twilio-specific logic (signature verification, body parsing)
 *      to `inbound-parser-twilio.ts` — the ONLY file with Twilio inbound knowledge.
 *      Swap providers: replace that file + env vars, this route stays unchanged.
 *   2. parseTwilioInbound() verifies X-Twilio-Signature HMAC-SHA1.
 *   3. Sender phone → verified profile_contacts (sms channel).
 *   4. Extract reply_token from [ref:XXXX] embedded in message body.
 *   5. Run agent loop via after().
 *
 * Twilio expects TwiML or empty 204 — returns 204 (no content).
 * Configure in Twilio Console:
 *   Phone Numbers → Active Numbers → Messaging → Webhook URL: https://<host>/api/inbound/sms
 */

import { createServiceRoleClient } from "@packages/supabase/client.service";
import { after, type NextRequest } from "next/server";
import { runAgentLoop } from "~/lib/conversations/agent/agent-loop";
import { parseTwilioInbound } from "~/lib/conversations/inbound-parser-twilio";
import { resolveInbound } from "~/lib/conversations/inbound-resolver";
import { debug } from "~/lib/debug";

const log = debug("api:inbound:sms");

/**
 * Extract reply_token from SMS body.
 * The outbound sender embeds `[ref:XXXXXXXXXXXX]` (12-char hex short prefix) at the end.
 */
function extractReplyToken(body: string): string | null {
  // Token is the first 12 chars of a 64-char hex reply_token, embedded as [ref:XXXXXXXXXXXX].
  // Accept up to 64 chars in case a future sender embeds the full token.
  const match = /\[ref:([A-Fa-f0-9]{12,64})\]/.exec(body);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest): Promise<Response> {
  // ── Parse + verify via the Twilio-specific parser ────────────────────────
  const parsed = await parseTwilioInbound(request);

  if (!parsed.valid) {
    log.warn("[POST] Twilio signature verification failed or not configured");
    // Return empty 204 — Twilio will not retry on non-5xx.
    return new Response(null, { status: 204 });
  }

  const { from: senderPhone, body: messageBody, messageSid, rawParams } = parsed;

  log.info("[POST] received inbound SMS", {
    senderPhone,
    messageSid,
    bodyLength: messageBody.length,
  });

  const replyToken = extractReplyToken(messageBody);

  // ── Ack immediately; run agent in after() ────────────────────────────────
  after(async () => {
    const admin = createServiceRoleClient();
    const result = await resolveInbound(admin, {
      channel: "sms",
      senderAddress: senderPhone,
      replyToken,
      providerMessageId: messageSid,
      body: messageBody,
      rawPayload: rawParams as Record<string, unknown>,
      signatureVerified: true,
    });

    if (!result.ok) {
      log.warn("[POST:after] inbound rejected", result.rejection);
      return;
    }

    await runAgentLoop(admin, result.ctx);
  });

  // Return empty 204 — Twilio is happy with no TwiML body for inbound processing.
  return new Response(null, { status: 204 });
}
