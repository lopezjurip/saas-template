import { LocaleConfig } from "@packages/rosetta/locale-config";
import { type RosettaDict, RosettaImpl } from "@packages/rosetta/rosetta";

export const LOCALE_CONFIG = new LocaleConfig({
  // Final fallback when neither the NEXT_LOCALE cookie nor Accept-Language resolves: English.
  defaultLocale: "en-US",
  languages: [
    { tag: "es-CL", label: "Español" },
    { tag: "en-US", label: "English" },
    { tag: "pt-BR", label: "Português" },
  ],
});

const LOCALE_BY_LANGUAGE = {
  en: "en-US",
  es: "es-CL",
  pt: "pt-BR",
} as const satisfies Record<string, (typeof LOCALE_CONFIG.supported)[number]>;

/**
 * Creates a typed translation accessor from a locale dictionary.
 *
 * @example
 * const LOCALE_ES = { page_title: "Crear agencia" };
 * const LOCALE_EN: typeof LOCALE_ES = { page_title: "Create agency" };
 * const LOCALES = { es: LOCALE_ES, en: LOCALE_EN };
 *
 * const { t } = ROSETTA(LOCALES, locale);
 * t("page_title"); // "Crear agencia" | "Create agency"
 */
export function ROSETTA<T>(dict: RosettaDict<T>, locale: string) {
  return RosettaImpl.fromDictionary(dict, locale);
}

export const SUPPORTED_LOCALES = LOCALE_CONFIG.supported;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE = LOCALE_CONFIG.defaultLocale;
export const LOCALE_LABEL = LOCALE_CONFIG.label;
export const LOCALE_COOKIE = LOCALE_CONFIG.cookie;

export function IS_SUPPORTED_LOCALE(value: unknown): value is SupportedLocale {
  return LOCALE_CONFIG.isSupported(value);
}

export function LOCALE_SUPPORTED_RESOLVE(value: unknown): SupportedLocale | null {
  if (typeof value !== "string") return null;

  const normalized = LOCALE_TAG_NORMALIZE(value);
  for (const locale of SUPPORTED_LOCALES) {
    if (LOCALE_TAG_NORMALIZE(locale) === normalized) return locale;
  }

  const language = normalized.split("-")[0];
  if (language && language in LOCALE_BY_LANGUAGE) {
    return LOCALE_BY_LANGUAGE[language as keyof typeof LOCALE_BY_LANGUAGE];
  }

  return null;
}

function LOCALE_TAG_NORMALIZE(locale: string): string {
  return locale.replace(/_/g, "-").trim().toLowerCase();
}
