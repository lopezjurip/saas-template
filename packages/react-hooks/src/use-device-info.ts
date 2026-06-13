"use client";

import { useMemo } from "react";
import { useMounted } from "./use-mounted";

export enum DeviceOS {
  MacOS = "macos",
  Windows = "windows",
  Linux = "linux",
  iOS = "ios",
  Android = "android",
  Unknown = "unknown",
}

export enum DeviceBrowser {
  Chrome = "chrome",
  Firefox = "firefox",
  Safari = "safari",
  Edge = "edge",
  Opera = "opera",
  Unknown = "unknown",
}

export interface DeviceInfo {
  os: DeviceOS;
  browser: DeviceBrowser;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isMobile: boolean;
  isTouch: boolean;
  /** "⌘" on macOS, "Ctrl" elsewhere */
  modKey: "⌘" | "Ctrl" | undefined;
  /** "Cmd" on macOS, "Ctrl" elsewhere — for readable labels */
  modKeyLabel: "Cmd" | "Ctrl" | undefined;
}

function DETECT_OS(ua: string): DeviceOS {
  if (/iphone|ipad|ipod/i.test(ua)) return DeviceOS.iOS;
  if (/android/i.test(ua)) return DeviceOS.Android;
  if (/mac os x/i.test(ua)) return DeviceOS.MacOS;
  if (/windows/i.test(ua)) return DeviceOS.Windows;
  if (/linux/i.test(ua)) return DeviceOS.Linux;
  return DeviceOS.Unknown;
}

function DETECT_BROWSER(ua: string): DeviceBrowser {
  if (/edg\//i.test(ua)) return DeviceBrowser.Edge;
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return DeviceBrowser.Opera;
  if (/firefox/i.test(ua)) return DeviceBrowser.Firefox;
  // Chrome must come after Edge/Opera (they also include "Chrome")
  if (/chrome/i.test(ua)) return DeviceBrowser.Chrome;
  if (/safari/i.test(ua)) return DeviceBrowser.Safari;
  return DeviceBrowser.Unknown;
}

const DEVICE_INFO_UNKNOWN: DeviceInfo = {
  os: DeviceOS.Unknown,
  browser: DeviceBrowser.Unknown,
  isMac: false,
  isWindows: false,
  isLinux: false,
  isMobile: false,
  isTouch: false,
  modKey: undefined,
  modKeyLabel: undefined,
};

export function COMPUTE_DEVICE_INFO(): DeviceInfo {
  if (typeof navigator === "undefined") {
    return DEVICE_INFO_UNKNOWN;
  }

  const ua = navigator.userAgent;
  const os = DETECT_OS(ua);
  const browser = DETECT_BROWSER(ua);
  const isMac = os === DeviceOS.MacOS;
  const isWindows = os === DeviceOS.Windows;
  const isLinux = os === DeviceOS.Linux;
  const isMobile = os === DeviceOS.iOS || os === DeviceOS.Android;
  const isTouch = (typeof window !== "undefined" && "ontouchstart" in window) || navigator.maxTouchPoints > 0;

  return {
    os,
    browser,
    isMac,
    isWindows,
    isLinux,
    isMobile,
    isTouch,
    modKey: isMac ? "⌘" : "Ctrl",
    modKeyLabel: isMac ? "Cmd" : "Ctrl",
  };
}

export function useDeviceInfo(): DeviceInfo | null {
  const mounted = useMounted();
  return useMemo(() => (mounted ? COMPUTE_DEVICE_INFO() : null), [mounted]);
}
