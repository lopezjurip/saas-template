/**
 * Twilio inbound SMS parser.
 *
 * THIS IS THE ONLY FILE THAT MAY CONTAIN TWILIO INBOUND LOGIC.
 * Swapping providers = one new inbound-parser-<provider>.ts + env var update.
 * No other file should reference Twilio for inbound.
 *
 * Signature verification uses node:crypto HMAC-SHA1 over the request URL + sorted
 * POST params, per https://www.twilio.com/docs/usage/security#validating-requests.
 * The `twilio` npm package is NOT used here so we don't add a hard dependency.
 *
 * @example
 * const result = await parseTwilioInbound(request);
 * if (!result.valid) return new Response("Forbidden", { status: 403 });
 * // result.from, result.body, result.messageSid
 */

import { createHmac } from "node:crypto";

const TWILIO_AUTH_TOKEN = process.env["TWILIO_AUTH_TOKEN"];

export interface TwilioInboundResult {
  valid: boolean;
  from: string;
  body: string;
  messageSid: string;
  rawParams: Record<string, string>;
}

/**
 * Parses and verifies an inbound Twilio SMS webhook request.
 *
 * Signature algorithm:
 *  1. Take the full request URL (scheme + host + path + query).
 *  2. Sort POST params alphabetically by key and append key+value pairs.
 *  3. HMAC-SHA1 the result with TWILIO_AUTH_TOKEN; base64-encode.
 *  4. Compare to X-Twilio-Signature header (timing-safe).
 *
 * Returns `valid: false` (no throw) when signature fails or env missing.
 *
 * @example
 * const result = await parseTwilioInbound(request);
 * if (!result.valid) return new Response("", { status: 204 });
 */
export async function parseTwilioInbound(request: Request): Promise<TwilioInboundResult> {
  const INVALID: TwilioInboundResult = { valid: false, from: "", body: "", messageSid: "", rawParams: {} };

  if (!TWILIO_AUTH_TOKEN) {
    // SMS channel not configured — treat all requests as invalid.
    return INVALID;
  }

  const twilioSignature = request.headers.get("x-twilio-signature") ?? "";

  // Parse form body (Twilio sends application/x-www-form-urlencoded).
  let formText: string;
  try {
    formText = await request.text();
  } catch {
    return INVALID;
  }

  const params: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(formText)) {
    params[k] = v;
  }

  // Build the string to sign: URL + sorted key-value pairs.
  const url = request.url;
  const sortedKeys = Object.keys(params).sort();
  let signingString = url;
  for (const key of sortedKeys) {
    signingString += key + (params[key] ?? "");
  }

  // HMAC-SHA1, base64-encoded.
  const expectedSignature = createHmac("sha1", TWILIO_AUTH_TOKEN).update(signingString, "utf8").digest("base64");

  // Timing-safe comparison via Buffer.
  const expected = Buffer.from(expectedSignature, "base64");
  const incoming = Buffer.from(twilioSignature, "base64");

  let valid = false;
  if (expected.length === incoming.length) {
    // Node's timingSafeEqual is constant-time.
    const { timingSafeEqual } = await import("node:crypto");
    valid = timingSafeEqual(expected, incoming);
  }

  if (!valid) {
    return INVALID;
  }

  const from = params["From"] ?? "";
  const body = params["Body"] ?? "";
  const messageSid = params["MessageSid"] ?? "";

  return { valid: true, from, body, messageSid, rawParams: params };
}
