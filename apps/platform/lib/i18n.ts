import { LocaleConfig } from "@packages/rosetta/locale-config";
import { type RosettaDict, RosettaImpl } from "@packages/rosetta/rosetta";

export const LOCALE_CONFIG = new LocaleConfig({
  defaultLocale: "es",
  languages: [
    { tag: "es", label: "Español", regions: [{ subtag: "CL" }] },
    { tag: "en", label: "English", regions: [{ subtag: "US" }] },
    { tag: "pt", label: "Português", regions: [{ subtag: "BR" }] },
  ],
});

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
