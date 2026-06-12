import { LocaleConfig } from "@packages/rosetta/locale-config";
import { type RosettaDict, RosettaImpl } from "@packages/rosetta/rosetta";

export const LOCALE_CONFIG = new LocaleConfig({
  defaultLocale: "es-CL",
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

const LOCALE_CANDIDATE_REGEX = /^(?:[a-zA-Z]{2}|[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8})+)$/;

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

export function LOCALE_FROM_PATH(pathname: string): {
  locale: SupportedLocale | null;
  canonicalLocale: SupportedLocale | null;
  localeCandidate: string | null;
  localeIsCanonical: boolean;
  pathAfterLocale: string;
} {
  const { locale, pathAfterLocale } = LOCALE_CONFIG.extractFromPath(pathname);
  if (locale) {
    return {
      locale,
      canonicalLocale: locale,
      localeCandidate: locale,
      localeIsCanonical: true,
      pathAfterLocale,
    };
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (!first || !IS_LOCALE_CANDIDATE(first)) {
    return {
      locale: null,
      canonicalLocale: null,
      localeCandidate: null,
      localeIsCanonical: false,
      pathAfterLocale: pathname,
    };
  }

  const rest = segments.slice(1).join("/");
  return {
    locale: null,
    canonicalLocale: LOCALE_SUPPORTED_RESOLVE(first),
    localeCandidate: first,
    localeIsCanonical: false,
    pathAfterLocale: rest ? `/${rest}` : "/",
  };
}

function IS_LOCALE_CANDIDATE(value: string): boolean {
  return LOCALE_CANDIDATE_REGEX.test(value.trim());
}

function LOCALE_TAG_NORMALIZE(locale: string): string {
  return locale.replace(/_/g, "-").trim().toLowerCase();
}
