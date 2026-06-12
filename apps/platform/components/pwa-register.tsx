"use client";
import { useEffect } from "react";

/** Registers `/sw.js` as the service worker once on mount. No-op when unsupported. */
export function usePwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);
}

/** Mounts `usePwaRegister` in the component tree. Renders nothing. */
export function PwaRegister() {
  usePwaRegister();
  return null;
}
