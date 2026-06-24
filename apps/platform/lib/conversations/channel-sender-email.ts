import { ConversationNotificationEmail } from "@packages/react-email/templates/conversation_notification";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";

const log = debug("api:internal:conversations:drain:email");

const RESEND_API_KEY = process.env["RESEND_API_KEY"];
const RESEND_FROM = process.env["RESEND_FROM"] ?? "notifications@resend.dev";

/**
 * Sends an outbound notification email via Resend.
 *
 * @example
 * const result = await sendEmailNotification({ deliveryId, messageId, conversationId, profileId, subject, body, payload, locale });
 */
export const sendEmailNotification: ChannelSender = async function sendEmailNotification(
  input: ChannelSenderInput,
): Promise<ChannelSenderResult> {
  if (!RESEND_API_KEY) {
    log.warn("[sendEmailNotification] RESEND_API_KEY not set — skipping email delivery", {
      deliveryId: input.deliveryId,
    });
    return { status: "skipped", error: "RESEND_API_KEY not configured" };
  }

  if (!input.payload["recipient_email"]) {
    log.warn("[sendEmailNotification] no recipient_email in payload — skipping", {
      deliveryId: input.deliveryId,
    });
    return { status: "skipped", error: "no recipient_email resolved" };
  }

  const recipientEmail = String(input.payload["recipient_email"]);
  const subject = input.subject ?? "(no subject)";
  const body = input.body ?? "";

  // Build the thread URL so the recipient can view the in-app thread.
  const threadUrl = input.payload["thread_url"] ? String(input.payload["thread_url"]) : undefined;

  // Render React Email template to HTML.
  let html: string;
  try {
    html = await render(
      ConversationNotificationEmail({
        subject,
        body,
        threadUrl,
        locale: input.locale,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("[sendEmailNotification] template render failed", { deliveryId: input.deliveryId, error: message });
    return { status: "failed", error: `template render failed: ${message}` };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: recipientEmail,
      subject,
      html,
      headers: {
        "X-Conversation-Id": input.conversationId,
        "X-Message-Id": input.messageId,
      },
    });

    if (error) {
      log.error("[sendEmailNotification] Resend API error", { deliveryId: input.deliveryId, error });
      return { status: "failed", error: error.message };
    }

    log.info("[sendEmailNotification] sent", { deliveryId: input.deliveryId, resendId: data?.["id"] });
    return { status: "sent", providerMessageId: data?.["id"] ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("[sendEmailNotification] unexpected error", { deliveryId: input.deliveryId, error: message });
    return { status: "failed", error: message };
  }
};
