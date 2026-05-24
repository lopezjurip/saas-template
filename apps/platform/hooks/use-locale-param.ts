"use client";

import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, type SupportedLocale } from "~/lib/i18n";

export function useLocaleParam(): SupportedLocale {
  const params = useParams<{ locale?: string }>();
  return IS_SUPPORTED_LOCALE(params?.locale) ? params.locale : DEFAULT_LOCALE;
}
