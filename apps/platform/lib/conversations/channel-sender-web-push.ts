import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import webpush from "web-push";
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";

const log = debug("api:internal:conversations:drain:web-push");

const VAPID_PUBLIC_KEY = process.env["VAPID_PUBLIC_KEY"];
const VAPID_PRIVATE_KEY = process.env["VAPID_PRIVATE_KEY"];
const VAPID_SUBJECT = process.env["VAPID_SUBJECT"] ?? "mailto:admin@example.com";

let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
  return true;
}

/**
 * Sends a Web Push notification to all active push subscriptions for the recipient.
 *
 * Handles 404/410 responses from push services by marking the subscription stale
 * (deleting the row from `profile_push_subscriptions`) so future sends skip it.
 *
 * @example
 * const result = await sendWebPushNotification({ profileId, replyToken, subject, body, ... });
 */
export const sendWebPushNotification: ChannelSender = async function sendWebPushNotification(
  input: ChannelSenderInput,
): Promise<ChannelSenderResult> {
  if (!ensureVapidConfigured()) {
    log.warn("[sendWebPushNotification] VAPID keys not configured — skipping web_push delivery", {
      deliveryId: input.deliveryId,
    });
    return { status: "skipped", error: "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not configured" };
  }

  const admin = createSupabaseServiceRoleClient();

  // Load all active push subscriptions for this recipient.
  const { data: subscriptions, error: fetchError } = await admin
    .from("profile_push_subscriptions")
    .select("profile_push_subscription_id, endpoint, p256dh, auth")
    .eq("profile_id", input.profileId);

  if (fetchError) {
    log.error("[sendWebPushNotification] failed to fetch subscriptions", {
      deliveryId: input.deliveryId,
      error: fetchError.message,
    });
    return { status: "failed", error: `db fetch failed: ${fetchError.message}` };
  }

  if (!subscriptions || subscriptions.length === 0) {
    log.info("[sendWebPushNotification] no push subscriptions for profile — skipping", {
      deliveryId: input.deliveryId,
      profileId: input.profileId,
    });
    return { status: "skipped", error: "no active push subscriptions" };
  }

  const notificationPayload = JSON.stringify({
    title: input.subject ?? "New notification",
    body: input.body ?? "",
    data: {
      replyToken: input.replyToken,
      conversationId: input.conversationId,
      messageId: input.messageId,
    },
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub["endpoint"],
      keys: {
        p256dh: sub["p256dh"],
        auth: sub["auth"],
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, notificationPayload, {
        TTL: 24 * 60 * 60, // 24h
        urgency: "normal",
      });
      sentCount++;
      log.info("[sendWebPushNotification] push sent", {
        deliveryId: input.deliveryId,
        subscriptionId: sub["profile_push_subscription_id"],
      });
    } catch (err) {
      const statusCode = (err as { statusCode?: number })["statusCode"];
      const message = err instanceof Error ? err.message : String(err);

      if (statusCode === 404 || statusCode === 410) {
        // Subscription is stale — delete it so future sends skip it.
        log.info("[sendWebPushNotification] stale subscription, removing", {
          deliveryId: input.deliveryId,
          subscriptionId: sub["profile_push_subscription_id"],
          statusCode,
        });
        const { error: deleteError } = await admin
          .from("profile_push_subscriptions")
          .delete()
          .eq("profile_push_subscription_id", sub["profile_push_subscription_id"]);
        if (deleteError) {
          log.warn("[sendWebPushNotification] failed to delete stale subscription", {
            subscriptionId: sub["profile_push_subscription_id"],
            error: deleteError.message,
          });
        }
      } else {
        log.error("[sendWebPushNotification] push error", {
          deliveryId: input.deliveryId,
          subscriptionId: sub["profile_push_subscription_id"],
          statusCode,
          error: message,
        });
        errors.push(`${sub["profile_push_subscription_id"]}: ${message}`);
      }
    }
  }

  if (sentCount > 0) {
    return { status: "sent", providerMessageId: `web_push:${sentCount}` };
  }

  if (errors.length > 0) {
    return { status: "failed", error: errors.join("; ") };
  }

  // All subscriptions were stale and removed.
  return { status: "skipped", error: "all subscriptions were stale and removed" };
};
