import { LocaleConfig } from "@packages/rosetta/locale-config";
import { type RosettaDict, RosettaImpl } from "@packages/rosetta/rosetta";
import type { NextRequest } from "next/server";

export const LOCALE_CONFIG = new LocaleConfig({
  supported: ["es", "en", "pt"] as const,
  defaultLocale: "es" as const,
  bcp47: { es: "es-CL", en: "en-US", pt: "pt-BR" },
  label: { es: "Español", en: "English", pt: "Português" },
});

export function ROSETTA<T>(dict: RosettaDict<T>, locale: string) {
  return RosettaImpl.fromDictionary(dict, locale);
}

export const SUPPORTED_LOCALES = LOCALE_CONFIG.supported;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE = LOCALE_CONFIG.defaultLocale;
export const LOCALE_TO_BCP47 = LOCALE_CONFIG.bcp47;
export const LOCALE_LABEL = LOCALE_CONFIG.label;
export const LOCALE_COOKIE = LOCALE_CONFIG.cookie;

export function IS_SUPPORTED_LOCALE(value: unknown): value is SupportedLocale {
  return LOCALE_CONFIG.isSupported(value);
}

export function EXTRACT_LOCALE_FROM_PATH(pathname: string): {
  locale: SupportedLocale | null;
  pathAfterLocale: string;
} {
  return LOCALE_CONFIG.extractFromPath(pathname);
}

export function PARSE_ACCEPT_LANGUAGE(header: string | null): SupportedLocale | null {
  return LOCALE_CONFIG.parseAcceptLanguage(header);
}

export function RESOLVE_LOCALE_FROM_REQUEST(request: NextRequest): SupportedLocale {
  return LOCALE_CONFIG.resolveFromRequest(request);
}
