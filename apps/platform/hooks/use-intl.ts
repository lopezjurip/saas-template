"use client";

import { useMemo } from "react";
import { useLocale } from "~/lib/i18n.client";

/**
 * Returns a memoized `Intl.DateTimeFormat` instance for the current locale.
 * @example
 * const fmt = useIntlDateTimeFormat({ day: "2-digit", month: "short", year: "numeric" });
 * fmt.format(new Date()); // "12 jun. 2026"
 */
export function useIntlDateTimeFormat(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = useLocale();
  return useMemo(() => new Intl.DateTimeFormat(locale, options), [locale, options]);
}

/**
 * Returns a memoized `Intl.NumberFormat` instance for the current locale.
 * @example
 * const fmt = useIntlNumberFormat({ style: "currency", currency: "USD" });
 * fmt.format(1234.5); // "$1,234.50"
 */
export function useIntlNumberFormat(options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const locale = useLocale();
  return useMemo(() => new Intl.NumberFormat(locale, options), [locale, options]);
}

/**
 * Returns a memoized `Intl.RelativeTimeFormat` instance for the current locale.
 * @example
 * const fmt = useIntlRelativeTimeFormat();
 * fmt.format(...RELATIVE_DATE_FORMAT(date)); // "hace 3 días"
 */
export function useIntlRelativeTimeFormat(options?: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat {
  const locale = useLocale();
  return useMemo(() => new Intl.RelativeTimeFormat(locale, { numeric: "auto", ...options }), [locale, options]);
}

/**
 * Returns a memoized `Intl.ListFormat` instance for the current locale.
 * @example
 * const fmt = useIntlListFormat({ style: "long", type: "conjunction" });
 * fmt.format(["manzana", "pera", "uva"]); // "manzana, pera y uva"
 */
export function useIntlListFormat(options?: Intl.ListFormatOptions): Intl.ListFormat {
  const locale = useLocale();
  return useMemo(() => new Intl.ListFormat(locale, options), [locale, options]);
}

/**
 * Returns a memoized `Intl.PluralRules` instance for the current locale.
 * @example
 * const rules = useIntlPluralRules();
 * rules.select(1); // "one"
 * rules.select(2); // "other"
 */
export function useIntlPluralRules(options?: Intl.PluralRulesOptions): Intl.PluralRules {
  const locale = useLocale();
  return useMemo(() => new Intl.PluralRules(locale, options), [locale, options]);
}

/**
 * Returns a memoized `Intl.Collator` instance for the current locale.
 * @example
 * const col = useIntlCollator({ sensitivity: "base" });
 * ["ñ", "n", "a"].sort(col.compare); // ["a", "n", "ñ"]
 */
export function useIntlCollator(options?: Intl.CollatorOptions): Intl.Collator {
  const locale = useLocale();
  return useMemo(() => new Intl.Collator(locale, options), [locale, options]);
}

/**
 * Returns a memoized `Intl.Segmenter` instance for the current locale.
 * @example
 * const seg = useIntlSegmenter({ granularity: "word" });
 * [...seg.segment("hola mundo")].map(s => s.segment); // ["hola", " ", "mundo"]
 */
export function useIntlSegmenter(options?: Intl.SegmenterOptions): Intl.Segmenter {
  const locale = useLocale();
  return useMemo(() => new Intl.Segmenter(locale, options), [locale, options]);
}

/**
 * Returns a memoized `Intl.DisplayNames` instance for the current locale.
 * @example
 * const names = useIntlDisplayNames({ type: "language" });
 * names.of("es"); // "español"
 */
export function useIntlDisplayNames(options: Intl.DisplayNamesOptions): Intl.DisplayNames {
  const locale = useLocale();
  return useMemo(() => new Intl.DisplayNames(locale, options), [locale, options]);
}
