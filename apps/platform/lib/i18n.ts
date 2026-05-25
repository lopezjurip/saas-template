import type { NextRequest } from "next/server";

export const SUPPORTED_LOCALES = ["es", "en", "pt"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "es";

// URL segment → BCP 47 tag used for <html lang> and any Intl APIs.
export const LOCALE_TO_BCP47: Record<SupportedLocale, string> = {
  es: "es-CL",
  en: "en-US",
  pt: "pt-BR",
};

export const LOCALE_LABEL: Record<SupportedLocale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function IS_SUPPORTED_LOCALE(value: unknown): value is SupportedLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function EXTRACT_LOCALE_FROM_PATH(pathname: string): {
  locale: SupportedLocale | null;
  pathAfterLocale: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && IS_SUPPORTED_LOCALE(first)) {
    const rest = segments.slice(1).join("/");
    return { locale: first, pathAfterLocale: rest ? `/${rest}` : "/" };
  }
  return { locale: null, pathAfterLocale: pathname };
}

export function PARSE_ACCEPT_LANGUAGE(header: string | null): SupportedLocale | null {
  if (!header) return null;
  const codes = header
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.split("-")[0]?.toLowerCase())
    .filter((c): c is string => Boolean(c));
  for (const code of codes) {
    if (IS_SUPPORTED_LOCALE(code)) return code;
  }
  return null;
}

export function RESOLVE_LOCALE_FROM_REQUEST(request: NextRequest): SupportedLocale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (IS_SUPPORTED_LOCALE(cookie)) return cookie;
  const fromHeader = PARSE_ACCEPT_LANGUAGE(request.headers.get("accept-language"));
  if (fromHeader) return fromHeader;
  return DEFAULT_LOCALE;
}
