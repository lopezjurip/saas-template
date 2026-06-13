/**
 * SMS channel sender via Twilio.
 *
 * THIS IS THE ONLY FILE THAT MAY IMPORT TWILIO. Swapping providers = one new
 * channel-sender-<provider>.ts + env vars + update the channel map in drain/route.ts.
 * No other file in the codebase should import `twilio`.
 *
 * Env-gated: if TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM are missing
 * the sender returns `skipped` — no error, no crash.
 */
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";

const log = debug("api:internal:conversations:drain:sms");

const TWILIO_ACCOUNT_SID = process.env["TWILIO_ACCOUNT_SID"];
const TWILIO_AUTH_TOKEN = process.env["TWILIO_AUTH_TOKEN"];
const TWILIO_FROM = process.env["TWILIO_FROM"];

/**
 * Sends an outbound SMS via Twilio.
 *
 * Requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM` to be set.
 * Returns `skipped` if any env var is missing so the drain worker continues safely.
 *
 * Embeds a short reply-token ref in the message body so inbound SMS can correlate
 * replies: `[ref:XXXXXXXXXXXX]` appended at the end.
 *
 * @example
 * const result = await sendSmsNotification({ deliveryId, replyToken, body, payload, ... });
 */
export const sendSmsNotification: ChannelSender = async function sendSmsNotification(
  input: ChannelSenderInput,
): Promise<ChannelSenderResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
    log.warn("[sendSmsNotification] Twilio env vars not set — skipping SMS delivery", {
      deliveryId: input.deliveryId,
    });
    return { status: "skipped", error: "TWILIO_* env vars not configured" };
  }

  const recipientPhone = input.payload["recipient_phone"];
  if (!recipientPhone) {
    log.warn("[sendSmsNotification] no recipient_phone in payload — skipping", {
      deliveryId: input.deliveryId,
    });
    return { status: "skipped", error: "no recipient_phone resolved" };
  }

  const body = input.body ?? "(no content)";
  const tokenShort = input.replyToken.slice(0, 12);
  const smsBody = `${body}\n[ref:${tokenShort}]`;

  // Dynamic import so that twilio is only loaded when env vars are present.
  // The `twilio` package is an optional dependency — do not add it unconditionally.
  // Run: pnpm --filter @apps/platform add twilio  — only when SMS is needed.
  // Typed as `unknown` to avoid a compile-time dependency on the twilio package.
  let twilioMod: {
    default: (
      sid: string,
      token: string,
    ) => { messages: { create: (opts: { body: string; from: string; to: string }) => Promise<{ sid: string }> } };
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    twilioMod = (await import("twilio" as string)) as typeof twilioMod;
  } catch {
    log.warn("[sendSmsNotification] twilio package not installed — skipping", {
      deliveryId: input.deliveryId,
    });
    return { status: "skipped", error: "twilio package not installed (run: pnpm --filter @apps/platform add twilio)" };
  }

  const client = twilioMod.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  try {
    const message = await client.messages.create({
      body: smsBody,
      from: TWILIO_FROM,
      to: String(recipientPhone),
    });

    log.info("[sendSmsNotification] sent", {
      deliveryId: input.deliveryId,
      sid: message.sid,
    });

    return { status: "sent", providerMessageId: message.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("[sendSmsNotification] Twilio error", { deliveryId: input.deliveryId, error: message });
    return { status: "failed", error: message };
  }
};
