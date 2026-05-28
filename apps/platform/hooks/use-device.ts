"use client";

import { useMemo } from "react";

type DeviceType = "mobile" | "tablet" | "desktop";

interface UseDevice {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useDevice(): UseDevice {
  return useMemo<UseDevice>(() => {
    if (typeof navigator === "undefined") {
      return { type: "desktop", isMobile: false, isTablet: false, isDesktop: true };
    }
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPod/i.test(ua);
    const isTablet = !isMobile && /iPad|Tablet|PlayBook/i.test(ua);
    const type: DeviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";
    return { type, isMobile, isTablet, isDesktop: !isMobile && !isTablet };
  }, []);
}
