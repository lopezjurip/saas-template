"use client";

import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, type SupportedLocale } from "~/lib/i18n";
import { useLocale } from "~/lib/i18n.client";

/**
 * Active locale on the client. Locale is no longer a URL segment — it is resolved from the
 * NEXT_LOCALE cookie and provided via `LocaleProvider` in the root layout. Reads that context
 * (name kept as `useLocaleParam` so existing callers don't change).
 *
 * @example
 * const locale = useLocaleParam(); // "es-CL" | "en-US" | "pt-BR"
 */
export function useLocaleParam(): SupportedLocale {
  const locale = useLocale();
  return IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
}
