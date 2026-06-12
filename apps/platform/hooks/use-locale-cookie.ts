"use client";

import { useStateCookie } from "@packages/react-hooks/use-state-cookie";
import { usePathname, useRouter } from "next/navigation";
import { startTransition } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_TO_BCP47, type SUPPORTED_LOCALES } from "~/lib/i18n";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";

export function useLocaleCookie() {
  const pathname = usePathname();
  const router = useRouter();
  const [current, set] = useStateCookie(LOCALE_COOKIE, DEFAULT_LOCALE);

  function selectLocale(next: (typeof SUPPORTED_LOCALES)[number]) {
    if (next === current) return;
    // Fire-and-forget: the proxy re-sets this cookie (1yr) on the next request, so the bare write is enough.
    set(next);
    // <html lang> is rendered by the root layout; soft navigation doesn't re-render it,
    // so update the live DOM here so screen readers / spellcheck pick up the new language immediately.
    document.documentElement["lang"] = LOCALE_TO_BCP47[next];
    const nextPath = pathname.replace(/^\/[^/]+/, `/${next}`);
    startTransition(() => router.replace(ROUTE_HREF(UNSAFE_ROUTE(nextPath))));
  }

  return [current, selectLocale] as const;
}
