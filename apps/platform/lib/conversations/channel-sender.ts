/**
 * ChannelSender — contract every outbound channel sender must implement.
 *
 * Each channel has exactly one file that exports a default implementation of this
 * interface.  The drain worker imports each sender directly (no barrel); swapping a
 * provider = replacing one file + updating the relevant env vars.
 *
 * @example
 * const result = await sendEmail(input);
 * if (result.status === "sent") log.info("[drain] email sent", { providerMessageId: result.providerMessageId });
 */
export interface ChannelSenderInput {
  /** UUID of the delivery row (`conversation_message_deliveries`). */
  deliveryId: string;
  /** UUID of the message row (`conversation_messages`). */
  messageId: string;
  /** UUID of the conversation. */
  conversationId: string;
  /** UUID of the recipient profile. */
  profileId: string;
  /** Per-delivery opaque token embedded in reply-to / message ref. */
  replyToken: string;
  /** Message subject (may be null for non-email channels). */
  subject: string | null;
  /** Plain-text message body. */
  body: string | null;
  /** Structured payload from `conversation_messages.message_payload`. */
  payload: Record<string, unknown>;
  /** BCP 47 locale inferred from the conversation's recipient profile. */
  locale: string;
}

export interface ChannelSenderResult {
  status: "sent" | "failed" | "skipped";
  /** Provider-assigned message / send ID (for receipt tracking). */
  providerMessageId?: string;
  /** Human-readable error string stored in `delivery_error`. */
  error?: string;
}

export type ChannelSender = (input: ChannelSenderInput) => Promise<ChannelSenderResult>;
