import { KapsoClient } from "@packages/kapso/client";
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";

const log = debug("api:internal:conversations:drain:whatsapp");

const KAPSO_API_KEY = process.env["KAPSO_API_KEY"];

/**
 * Sends an outbound WhatsApp message via the Kapso BSP client.
 *
 * @example
 * const result = await sendWhatsAppNotification({ deliveryId, body, ... });
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

  const messageText = input.body ?? "(no content)";

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
