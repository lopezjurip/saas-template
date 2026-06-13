import { KapsoClient } from "@packages/kapso/client";
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";

const log = debug("api:internal:conversations:drain:whatsapp");

const KAPSO_API_KEY = process.env["KAPSO_API_KEY"];

/**
 * Sends an outbound WhatsApp message via the Kapso BSP client.
 *
 * Embeds the `reply_token` in the message text so the inbound Kapso webhook can
 * correlate replies back to this delivery and conversation.  The token is appended
 * as a compact reference line that is human-readable but out of the way.
 *
 * @example
 * const result = await sendWhatsAppNotification({ deliveryId, replyToken, body, ... });
 */
export const sendWhatsAppNotification: ChannelSender = async function sendWhatsAppNotification(
  input: ChannelSenderInput,
): Promise<ChannelSenderResult> {
  if (!KAPSO_API_KEY) {
    log.warn("[sendWhatsAppNotification] KAPSO_API_KEY not set — skipping WhatsApp delivery", {
      deliveryId: input.deliveryId,
    });
    return { status: "skipped", error: "KAPSO_API_KEY not configured" };
  }

  const whatsappConversationId = input.payload["whatsapp_conversation_id"];
  if (!whatsappConversationId) {
    log.warn("[sendWhatsAppNotification] no whatsapp_conversation_id in payload — skipping", {
      deliveryId: input.deliveryId,
    });
    return { status: "skipped", error: "no whatsapp_conversation_id in message payload" };
  }

  const body = input.body ?? "(no content)";

  // Append the reply token as a ref line so inbound can correlate replies.
  // Format: [ref:XXXXXX] — short enough to not dominate the message.
  const tokenShort = input.replyToken.slice(0, 12);
  const messageText = `${body}\n\n[ref:${tokenShort}]`;

  const client = new KapsoClient({ apiKey: KAPSO_API_KEY });

  try {
    await client.sendMessage(String(whatsappConversationId), {
      type: "text",
      text: messageText,
    });

    log.info("[sendWhatsAppNotification] sent", {
      deliveryId: input.deliveryId,
      whatsappConversationId,
    });

    // Kapso does not return a message ID on send; use the delivery ID as a stable ref.
    return { status: "sent", providerMessageId: `kapso:${String(whatsappConversationId)}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("[sendWhatsAppNotification] Kapso error", { deliveryId: input.deliveryId, error: message });
    return { status: "failed", error: message };
  }
};
