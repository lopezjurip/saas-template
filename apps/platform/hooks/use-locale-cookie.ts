"use client";

import { useStateCookie } from "@packages/react-hooks/use-state-cookie";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { LOCALE_COOKIE, type SupportedLocale } from "~/lib/i18n";
import { useLocale } from "~/lib/i18n.client";

export function useLocaleCookie() {
  const router = useRouter();
  // Active locale = the one the server rendered with, exposed via LocaleProvider — NOT the cookie
  // value. useStateCookie never reads the cookie (its initial MUST be the server read), so deriving
  // `current` from it would freeze at the default. After a switch, router.refresh() re-renders with
  // the new cookie, so this value updates and the toggle highlight tracks correctly.
  const current = useLocale() as SupportedLocale;
  const [, set] = useStateCookie(LOCALE_COOKIE, current);

  function selectLocale(next: SupportedLocale) {
    if (next === current) return;
    // Locale lives only in the NEXT_LOCALE cookie now — no URL segment. Persist it, then refresh
    // so server components (and <html lang> via the root layout) re-render in the new locale.
    // The proxy leaves an existing valid cookie untouched, so this choice sticks across reloads.
    set(next);
    // Soft refresh doesn't re-run the live <html lang>; update it here so screen readers /
    // spellcheck pick up the new language immediately.
    document.documentElement["lang"] = next;
    startTransition(() => router.refresh());
  }

  return [current, selectLocale] as const;
}
