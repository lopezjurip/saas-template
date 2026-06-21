"use client";

import { useSupabase } from "@packages/supabase/react";
import { useEffect, useState } from "react";
import { useViewerProfile } from "./use-viewer-profile";

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported" | "no_vapid";

/**
 * Manages browser push notification permission, PushManager subscription,
 * and persists subscriptions to profile_push_subscriptions.
 *
 * Returns "unsupported" when the browser lacks Notification/serviceWorker/PushManager APIs.
 * Returns "no_vapid" when NEXT_PUBLIC_VAPID_PUBLIC_KEY env var is not set.
 * @example
 * const { permission, subscribed, requestPermission, unsubscribe } = usePushPermission();
 */
export function usePushPermission() {
  const [permission, setPermission] = useState<PushPermissionState>("unsupported");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = useSupabase();
  const { data: { profile } = { ["profile"]: null } } = useViewerProfile();

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }
    const vapidKey = process.env["NEXT_PUBLIC_VAPID_PUBLIC_KEY"];
    if (!vapidKey) {
      setPermission("no_vapid");
      return;
    }
    setPermission(Notification.permission as PushPermissionState);

    // Check if already subscribed
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setSubscribed(sub !== null);
      })
      .catch(() => {
        // Service worker not ready yet — ignore
      });
  }, []);

  async function requestPermission() {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const vapidKey = process.env["NEXT_PUBLIC_VAPID_PUBLIC_KEY"];
    if (!vapidKey) return;

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);
      if (result !== "granted") {
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      // Encode VAPID key from base64url to Uint8Array backed by a plain ArrayBuffer
      const key = URL_BASE64_TO_UINT8ARRAY(vapidKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key.buffer as ArrayBuffer,
      });

      const subJson = sub.toJSON();
      const endpoint = subJson["endpoint"];
      const keys = subJson["keys"] as Record<string, string> | undefined;
      const p256dh = keys?.["p256dh"];
      const auth = keys?.["auth"];

      if (!endpoint || !p256dh || !auth) {
        throw new Error("Incomplete push subscription");
      }

      if (profile) {
        const { error } = await supabase
          .from("profile_push_subscriptions")
          .upsert({ endpoint, p256dh, auth, profile_id: profile["profileId"] }, { onConflict: "endpoint" });
        if (!error) {
          setSubscribed(true);
        }
      }
    } catch {
      // If subscribe fails, permission may still show as granted without sub
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    if (!("serviceWorker" in navigator)) return;

    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;

      const endpoint = sub.endpoint;
      await sub.unsubscribe();

      if (profile) {
        await supabase
          .from("profile_push_subscriptions")
          .delete()
          .eq("endpoint", endpoint)
          .eq("profile_id", profile["profileId"])
          .throwOnError();
      }
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }

  return { permission, subscribed, loading, requestPermission, unsubscribe };
}

/**
 * Decodes a base64url-encoded VAPID public key into a Uint8Array
 * suitable for PushManager.subscribe({ applicationServerKey }).
 * @example
 * URL_BASE64_TO_UINT8ARRAY("BEl62iUYgUivxIk...") // Uint8Array
 */
function URL_BASE64_TO_UINT8ARRAY(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
