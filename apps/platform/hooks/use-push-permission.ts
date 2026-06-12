"use client";
import { useEffect, useState } from "react";

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushPermission() {
  const [permission, setPermission] = useState<PushPermissionState>("unsupported");

  useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission as PushPermissionState);
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as PushPermissionState);
  }

  return { permission, requestPermission };
}
