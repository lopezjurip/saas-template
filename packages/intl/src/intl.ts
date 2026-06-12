import { RosettaImpl } from "@packages/rosetta/rosetta";
import type { Maybe } from "@packages/utils/maybe";
import { FORMAT_CURRENCY_CLF, FORMAT_CURRENCY_CLP, IS_FINITE, NUMBER } from "@packages/utils/number";
import { SPACE_NON_BREAKING } from "@packages/utils/string";
import { DURATION_FROM_SQL, TEMPORAL, type Temporal, TZ } from "@packages/utils/temporal";

/** "CLF 100" to "100 UF". Untested in all browsers. */
const RE_FORMAT_CURRENCY_CLF = true as boolean;

const TK = "Fracciones" as const;
/**
 * unicode &#120778;
 * https://www.amp-what.com/unicode/search/f
 */
const F = "𝟊" as const;

/** For small decimals, double the maximum fraction digits. */
const AUTO_SMALL_DECIMAL = true as boolean;

/**
 * IntlNumberParser parses locale-aware number strings.
 *
 * TODO: doesn't work on older browsers (eg: iPhone 6)
 * https://stackoverflow.com/a/55366435
 */
export class IntlNumberParser {
  private indexes: Map<string, number>;
  private group?: RegExp;
  private decimal?: RegExp;
  private numeral: RegExp;

  constructor(locale: string, options?: Intl.NumberFormatOptions) {
    const parts = new Intl.NumberFormat(locale, options).formatToParts(12345.6);
    const numerals = [...new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210)].reverse();
    this.indexes = new Map(numerals.map((d, i) => [d, i]));

    const group = parts.find((d) => d.type === "group");
    this.group = group ? new RegExp(`[${group.value}]`, "g") : undefined;

    const decimal = parts.find((d) => d.type === "decimal");
    this.decimal = decimal ? new RegExp(`[${decimal.value}]`) : undefined;

    this.numeral = new RegExp(`[${numerals.join("")}]`, "g");
  }

  private index = (d: any): any => {
    return this.indexes.get(d);
  };

  public parse(string: string): number {
    let str = string.trim();
    if (this.group) {
      str = str.replace(this.group, ""); // TODO: not sure about this "if"
    }
    if (this.decimal) {
      str = str.replace(this.decimal, "."); // TODO: not sure about this "if"
    }
    str = str.replace(this.numeral, this.index);
    return str ? +str : Number.NaN;
  }
}

/**
 * @example
 * const f = new IntlUniversalFormatter("es-CL");
 */
export class IntlUniversalFormatter {
  constructor(public readonly locale: string) {}

  // TODO: implement this method
  // public format(input: number | bigint | Intl.StringNumericLiteral | Date): string {}

  public formatPCT(
    input: string | number | bigint | Intl.StringNumericLiteral,
    digits?: number,
    options?: Intl.NumberFormatOptions,
  ): string {
    const number = typeof input === "string" ? NUMBER(input) : input;
    const formatter = new Intl.NumberFormat(this.locale, {
      style: "percent",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      roundingMode: "trunc",
      ...options,
    });
    return formatter.format(number);
  }

  /**
   * Like formatPCT() but for a range of values, only keeps "%" at the end.
   */
  public formatPCTRange(
    inputs: (string | number | bigint | Intl.StringNumericLiteral)[],
    digits?: number,
    options?: Intl.NumberFormatOptions,
  ): string {
    return inputs
      .map((input, i, { length }) => {
        const str = this.formatPCT(input, digits, options);
        if (i < length - 1) {
          return str.replace(/%$/, "");
        }
        return str;
      })
      .join("-");
  }

  public formatNumber(
    input: string | number | bigint | Intl.StringNumericLiteral,
    options?: Intl.NumberFormatOptions,
  ): string {
    const number = typeof input === "string" ? NUMBER(input) : input;
    const formatter = new Intl.NumberFormat(this.locale, {
      roundingMode: "trunc",
      ...options,
    });
    return formatter.format(number);
  }

  /**
   * Format a Temporal.PlainDate as a date string.
   * @example
   * ```tsx
   * f.formatDate(Temporal.PlainDate.from("2026-03-02")); // "2 de marzo de 2026"
   * f.formatDate(Temporal.PlainDate.from("2026-03-02"), { dateStyle: "short" }); // "02/03/2026"
   * ```
   */
  public formatDate(
    input: Temporal.PlainDate,
    options: Intl.DateTimeFormatOptions = {
      dateStyle: "long",
    },
  ): string {
    const zonedDateTime = input.toZonedDateTime(TZ);
    return zonedDateTime.toLocaleString(this.locale, options);
  }

  public formatDateTime(
    input: Date | Temporal.ZonedDateTime | string,
    options: Intl.DateTimeFormatOptions = {
      dateStyle: "long",
      timeStyle: "short",
      hour12: false,
    },
  ): string {
    if (typeof input === "string") {
      input = new Date(input);
    }
    if (input instanceof Date) {
      const formatter = new Intl.DateTimeFormat(this.locale, options);
      return formatter.format(input);
    } else {
      return input.toLocaleString(this.locale, options);
    }
  }

  /**
   * Use this method to format tokens ("U42:series:B", "U42:series:A", "U42", etc.).
   * @example
   * ```tsx
   * f.formatTokens(1000); // "1.000 Fracciones"
   * ```
   */
  public formatTokens(input: string | number | bigint | Intl.StringNumericLiteral, options?: Intl.NumberFormatOptions) {
    return this.formatMoney(input, TK, options);
  }

  /**
   * Use this method to format money (USD, EUR, CLP, CLF, etc.) but also tokens ("U42:series:B", "U42:series:A", "U42", etc.).
   * @example
   * ```tsx
   * f.formatMoney(1000, "CLP"); // "$1.000"
   * f.formatMoney(1000, "USD"); // "US$1.000,00"
   * f.formatMoney(1000, "EUR"); // "EUR 1.000,00"
   * f.formatMoney(1.23, "CLF"); // "1,2300 UF"
   * f.formatMoney(1.23, "USD"); // "US$1,23"
   * f.formatMoney(1.23, "U42:series:B"); // "1,23 Fracciones"
   * f.formatMoney(1.23, "U42:series:A"); // "1,23 Fracciones"
   * f.formatMoney(1.23, "U42"); // "1,23 Fracciones"
   * ```
   */
  public formatMoney(
    input: string | number | bigint | Intl.StringNumericLiteral,
    currency: "USD" | "EUR" | "CLP" | "CLF" | `U${string}` | string | undefined | null,
    /** Overwrite recommended decimal digits for selected currency. */
    options?: Intl.NumberFormatOptions | null,
  ): string {
    const { number, formatter, kind } = this.formatMoneyFormatter(input, currency, options);
    if (kind === "CLF") {
      if (RE_FORMAT_CURRENCY_CLF) {
        const separator = SPACE_NON_BREAKING; // TODO: not sure if compatible with all browsers.
        return formatter.format(number).split(separator).reverse().join(separator).replace("CLF", "UF");
      }
      return formatter.format(number);
    }
    if (kind === "token") {
      const rosetta = RosettaImpl.fromDictionary(LOCALES, this.locale);
      const label =
        options?.currencyDisplay === "symbol" || options?.currencyDisplay === "narrowSymbol" ? F : rosetta.t("token");
      return `${formatter.format(number)} ${label}`;
    }
    return formatter.format(number);
  }

  /** Same logic as {@link formatMoney} but returns `Intl.NumberFormatPart[]` for per-part styling. */
  public formatMoneyToParts(
    input: string | number | bigint | Intl.StringNumericLiteral,
    currency: "USD" | "EUR" | "CLP" | "CLF" | `U${string}` | string | undefined | null,
    options?: Intl.NumberFormatOptions | null,
  ): Intl.NumberFormatPart[] {
    const { number, formatter, kind } = this.formatMoneyFormatter(input, currency, options);
    if (kind === "CLF") {
      const parts = formatter.formatToParts(number);
      const normalized = parts.map((p) => (p.value === "CLF" ? { ...p, value: "UF" } : p));
      if (RE_FORMAT_CURRENCY_CLF) {
        const sepIdx = normalized.findIndex((p) => p.type === "literal" && p.value === SPACE_NON_BREAKING);
        if (sepIdx !== -1) {
          const before = normalized.slice(0, sepIdx);
          const sep = normalized[sepIdx]!;
          const after = normalized.slice(sepIdx + 1);
          return [...after, sep, ...before];
        }
      }
      return normalized;
    }
    if (kind === "token") {
      const rosetta = RosettaImpl.fromDictionary(LOCALES, this.locale);
      const label =
        options?.currencyDisplay === "symbol" || options?.currencyDisplay === "narrowSymbol" ? F : rosetta.t("token");
      return [...formatter.formatToParts(number), { type: "literal", value: " " }, { type: "unit", value: label }];
    }
    return formatter.formatToParts(number);
  }

  protected formatMoneyFormatter(
    input: string | number | bigint | Intl.StringNumericLiteral,
    currency: "USD" | "EUR" | "CLP" | "CLF" | `U${string}` | string | undefined | null,
    options?: Intl.NumberFormatOptions | null,
  ): {
    number: number | bigint | Intl.StringNumericLiteral;
    formatter: IntlNumberFormatPatched;
    kind: "CLP" | "CLF" | "USD" | "EUR" | "token" | "default";
  } {
    const number = typeof input === "string" ? NUMBER(input) : input;

    let isSmallDecimal = false;
    if (AUTO_SMALL_DECIMAL) {
      const n = Number(number);
      isSmallDecimal = n !== 0 && Math.abs(n) < 1;
    }

    if (currency === "CLP") {
      // TODO: not implemented.
      const formatter = new IntlNumberFormatPatched(this.locale, {
        minimumFractionDigits: 0,
        ...FORMAT_CURRENCY_CLP,
        ...options,
        // CLP has 0 decimal places, so we set 2 on small numbers.
        // maximumFractionDigits: isSmallDecimal ? 2 : maxFraction,
      });
      return { number, formatter, kind: "CLP" };
    } else if (currency === "CLF") {
      const maxFraction = options?.maximumFractionDigits ?? 2;
      const formatter = new IntlNumberFormatPatched(this.locale, {
        minimumFractionDigits: 0,
        ...FORMAT_CURRENCY_CLF,
        ...options,
        maximumFractionDigits: isSmallDecimal ? maxFraction * 2 : maxFraction,
      });
      return { number, formatter, kind: "CLF" };
    } else if (currency === "USD") {
      const maxFraction = options?.maximumFractionDigits ?? 2;
      const formatter = new IntlNumberFormatPatched(this.locale, {
        minimumFractionDigits: 0,
        style: "currency",
        currency: "USD",
        currencyDisplay: "symbol", // TODO: can break safari 14_0_2?
        roundingMode: "trunc",
        ...options,
        maximumFractionDigits: isSmallDecimal ? maxFraction * 2 : maxFraction,
      });
      return { number, formatter, kind: "USD" };
    } else if (currency === "EUR") {
      const maxFraction = options?.maximumFractionDigits ?? 2;
      const formatter = new IntlNumberFormatPatched(this.locale, {
        minimumFractionDigits: 0,
        style: "currency",
        currency: "EUR",
        currencyDisplay: "symbol",
        roundingMode: "trunc",
        ...options,
        maximumFractionDigits: isSmallDecimal ? maxFraction * 2 : maxFraction,
      });
      return { number, formatter, kind: "EUR" };
    } else if (currency === TK || currency?.startsWith("U")) {
      // when U42 use plain numbers and minimize decimals up to 3 when its necessary.
      const maxFraction = options?.maximumFractionDigits ?? 3;
      const formatter = new IntlNumberFormatPatched(this.locale, {
        minimumFractionDigits: 0,
        roundingMode: "trunc",
        ...options,
        maximumFractionDigits: isSmallDecimal ? maxFraction * 2 : maxFraction,
      });
      return { number, formatter, kind: "token" };
    } else {
      // default
      const maxFraction = options?.maximumFractionDigits ?? 2;
      const formatter = new IntlNumberFormatPatched(this.locale, {
        minimumFractionDigits: 0,
        ...options,
        maximumFractionDigits: isSmallDecimal ? maxFraction * 2 : maxFraction,
      });
      return { number, formatter, kind: "default" };
    }
  }

  public formatRelativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ): string {
    const formatter = new Intl.RelativeTimeFormat(this.locale, options);
    return formatter.format(value, unit);
  }

  public formatDisplayName(code: string, options: Intl.DisplayNamesOptions): string {
    const formatter = new Intl.DisplayNames(this.locale, options);
    return formatter.of(code) ?? code;
  }

  public formatList(list: Iterable<string>, options?: Intl.ListFormatOptions): string {
    const formatter = new Intl.ListFormat(this.locale, options);
    return formatter.format(list);
  }

  /**
   * Format SQL interval string to a human readable string
   * @example
   * ```tsx
   * f.formatInterval("13 days 11:53:26.600491");
   * f.formatInterval("P13DT12H31M30.545122S");
   * ```
   */
  public formatInterval(interval: string, options?: IntlDurationFormatOptions): string {
    const duration = DURATION_FROM_SQL(interval);
    return this.formatDuration(duration, options);
  }

  /**
   * Formats the interval (duration) between two dates using Temporal.
   * @example
   * ```tsx
   * const start = new Date("2023-01-01");
   * const end = new Date("2023-12-31");
   * f.formatInterval(start, end); // "364 days" (or localized equivalent)
   * ```
   */
  public formatIntervalRange(
    start: Date | string | Temporal.ZonedDateTime | Temporal.PlainDateTime,
    end: Date | string | Temporal.ZonedDateTime | Temporal.PlainDateTime,
    options?: IntlDurationFormatOptions,
  ): string {
    const startZoned = start instanceof Date || typeof start === "string" ? TEMPORAL(start) : start;
    const endZoned = end instanceof Date || typeof end === "string" ? TEMPORAL(end) : end;
    const duration = startZoned.until(endZoned);
    return this.formatDuration(duration, options);
  }

  /**
   * Uses a Temporal's Duration to format a human readable string. Tips: you can round the duration before formatting it.
   * @example
   * ```tsx
   * const duration = DURATION("P13DT12H31M30.545122S").round({ smallestUnit: "hours" });
   * f.formatDuration(duration, { style: "long" }); // "13 días y 13 horas"
   * ```
   */
  public formatDuration(duration: Temporal.Duration, options?: IntlDurationFormatOptions): string {
    if (typeof Intl.DurationFormat !== "undefined") {
      const formatter = new Intl.DurationFormat(this.locale, options);
      return formatter.format(duration);
    } else {
      const formatter = new IntlDurationFormatPatched(this.locale, options);
      return formatter.format(duration);
    }
  }
}

export type IntlNumberFormatPatchedOptions = Intl.NumberFormatOptions;

/**
 * Fixes an issue with percent formatting that adds a space between the number and the percent sign.
 * Example: "50 %" -> "50%"
 */
export class IntlNumberFormatPatched implements Intl.NumberFormat {
  private readonly wrapped: Intl.NumberFormat;

  public constructor(
    locale: string,
    private readonly options?: IntlNumberFormatPatchedOptions,
  ) {
    this.wrapped = new Intl.NumberFormat(locale, options);
  }

  // This is an arrow function because Safari has a bug with `this` binding.
  public format = (value: number | bigint | Intl.StringNumericLiteral): string => {
    /** Strange unicode space that some browsers add as percent separator. */
    const SPACE = SPACE_NON_BREAKING;
    if (this.options) {
      if (this.options.style === "percent") {
        return this.wrapped.format(value).replace(SPACE, "").replace(" ", ""); // remove space
      }
    }
    return this.wrapped.format(value);
  };

  /**
   * Format a value if it is a number or bigint, on nil value returns undefined.
   */
  public formatLoose(value: number | bigint | Intl.StringNumericLiteral): string;
  public formatLoose(value: Maybe<never>): undefined;
  public formatLoose(value: Maybe<number | bigint | Intl.StringNumericLiteral>): string | undefined;
  public formatLoose(value: Maybe<number | bigint | Intl.StringNumericLiteral>): string | undefined {
    return IS_FINITE(value) ? this.format(value) : undefined;
  }

  public resolvedOptions = (): ReturnType<Intl.NumberFormat["resolvedOptions"]> => {
    return this.wrapped.resolvedOptions();
  };
  // @ts-expect-error Type error
  public formatToParts = (
    ...args: Parameters<Intl.NumberFormat["formatToParts"]>
  ): ReturnType<Intl.NumberFormat["formatToParts"]> => {
    return this.wrapped.formatToParts(...args);
  };
  public formatRange = (
    ...args: Parameters<Intl.NumberFormat["formatRange"]>
  ): ReturnType<Intl.NumberFormat["formatRange"]> => {
    return this.wrapped.formatRange(...args);
  };
  public formatRangeToParts = (
    ...args: Parameters<Intl.NumberFormat["formatRangeToParts"]>
  ): ReturnType<Intl.NumberFormat["formatRangeToParts"]> => {
    return this.wrapped.formatRangeToParts(...args);
  };
}

/** https://github.com/tc39/proposal-intl-duration-format */
export type IntlDurationFormatOptions = {
  /** A string denoting which locale matching algorithm to use. Defaults to "best fit". */
  localeMatcher?: "best fit" | "lookup";
  /** A string containing the name of the numbering system to be used for number formatting. */
  numberingSystem?: string;
  /** The base style to be used for formatting. This can be overridden per-unit by setting the more granular options. Defaults to "short". */
  style?: "long" | "short" | "narrow" | "digital";
  /** The style to be used for formatting years. */
  years?: "long" | "short" | "narrow";
  /** Whether to always display years, or only if nonzero. */
  yearsDisplay?: "always" | "auto";
  /** The style to be used for formatting months. */
  months?: "long" | "short" | "narrow";
  /** Whether to always display months, or only if nonzero. */
  monthsDisplay?: "always" | "auto";
  /** The style to be used for formatting weeks. */
  weeks?: "long" | "short" | "narrow";
  /** Whether to always display weeks, or only if nonzero. */
  weeksDisplay?: "always" | "auto";
  /** The style to be used for formatting days. */
  days?: "long" | "short" | "narrow";
  /** Whether to always display days, or only if nonzero. */
  daysDisplay?: "always" | "auto";
  /** The style to be used for formatting hours. */
  hours?: "long" | "short" | "narrow" | "numeric" | "2-digit";
  /** Whether to always display hours, or only if nonzero. */
  hoursDisplay?: "always" | "auto";
  /** The style to be used for formatting minutes. */
  minutes?: "long" | "short" | "narrow" | "numeric" | "2-digit";
  /** Whether to always display minutes, or only if nonzero. */
  minutesDisplay?: "always" | "auto";
  /** The style to be used for formatting seconds. */
  seconds?: "long" | "short" | "narrow" | "numeric" | "2-digit";
  /** Whether to always display seconds, or only if nonzero. */
  secondsDisplay?: "always" | "auto";
  /** The style to be used for formatting milliseconds. */
  milliseconds?: "long" | "short" | "narrow" | "numeric";
  /** Whether to always display milliseconds, or only if nonzero. */
  millisecondsDisplay?: "always" | "auto";
  /** The style to be used for formatting microseconds. */
  microseconds?: "long" | "short" | "narrow" | "numeric";
  /** Whether to always display microseconds, or only if nonzero. */
  microsecondsDisplay?: "always" | "auto";
  /** The style to be used for formatting nanoseconds. */
  nanoseconds?: "long" | "short" | "narrow" | "numeric";
  /** Whether to always display nanoseconds, or only if nonzero. */
  nanosecondsDisplay?: "always" | "auto";
  /** How many fractional digits to display in the output. Additional decimal places will be truncated towards zero. */
  fractionalDigits?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};

/**
 * Fallback implementation using Intl.RelativeTimeFormat
 */
export class IntlDurationFormatPatched {
  constructor(
    public readonly locale: string,
    public readonly options?: IntlDurationFormatOptions,
  ) {}

  public format(duration: Temporal.Duration): string {
    const options = this.options;
    const locale = this.locale;

    const style = options?.style ?? "short";
    const parts: string[] = [];

    // Helper to get unit style
    function getUnitStyle(unit: keyof IntlDurationFormatOptions): "long" | "short" | "narrow" | "numeric" | "2-digit" {
      return (options?.[unit] as "long" | "short" | "narrow" | "numeric" | "2-digit") ?? style;
    }

    // Helper to check if unit should be displayed
    function shouldDisplay(value: number, display?: "always" | "auto"): boolean {
      if (display === "always") {
        return true;
      }
      // For "auto" or undefined, only display if value is non-zero
      return value !== 0;
    }

    // Helper to format a unit using Intl.RelativeTimeFormat
    function formatUnit(
      value: number,
      unit: Intl.RelativeTimeFormatUnit,
      unitStyle: "long" | "short" | "narrow",
    ): string {
      if (value === 0) {
        return "";
      }
      const formatter = new Intl.RelativeTimeFormat(locale, { style: unitStyle, numeric: "always" });
      // Use formatToParts to avoid prefixes/suffixes like "in" or "ago"
      const parts = formatter.formatToParts(value, unit);
      // Build string from number and unit parts, skip literal prefixes
      const integerPart: string[] = [];
      const resultParts: string[] = [];
      for (const part of parts) {
        if (part.type === "integer" || part.type === "decimal" || part.type === "fraction" || part.type === "group") {
          integerPart.push(part.value);
        } else if (part.type === "literal" && integerPart.length > 0) {
          // After finding the integer, the next literal contains the unit name
          resultParts.push(part.value.trim());
          break;
        }
      }
      return `${integerPart.join("").trim()} ${resultParts.join(" ").trim()}`;
    }

    // Helper to get unit name (singular or plural form)
    function getUnitName(
      value: number,
      unit: Intl.RelativeTimeFormatUnit,
      baseStyle: "long" | "short" | "narrow" | "2-digit",
    ): string {
      const unitStyle: "long" | "short" | "narrow" = baseStyle === "2-digit" ? "short" : baseStyle;
      const formatter = new Intl.RelativeTimeFormat(locale, { style: unitStyle, numeric: "always" });
      // Use formatToParts to extract just the unit name
      const parts = formatter.formatToParts(value, unit);
      let foundInteger = false;
      for (const part of parts) {
        if (part.type === "integer" || part.type === "decimal" || part.type === "fraction") {
          foundInteger = true;
        } else if (part.type === "literal" && foundInteger) {
          // After finding the integer, the next literal contains the unit name
          return part.value.trim();
        }
      }
      return "";
    }

    // Helper to format numeric values (for digital style)
    function formatNumeric(value: number, pad: number = 2): string {
      return Math.abs(value).toString().padStart(pad, "0");
    }

    // Handle digital style separately
    if (style === "digital") {
      const hours =
        duration.hours +
        duration.days * 24 +
        duration.weeks * 7 * 24 +
        (duration.months ?? 0) * 30 * 24 +
        (duration.years ?? 0) * 365 * 24;
      const minutes = duration.minutes;
      const seconds = duration.seconds;
      const fractionalDigits = options?.fractionalDigits ?? 0;

      if (fractionalDigits > 0 && duration.milliseconds > 0) {
        const ms = duration.milliseconds;
        const fractional = (ms / 1000).toFixed(fractionalDigits).slice(1); // Get ".123" part
        return `${formatNumeric(hours)}:${formatNumeric(minutes)}:${formatNumeric(seconds)}${fractional}`;
      }
      return `${formatNumeric(hours)}:${formatNumeric(minutes)}:${formatNumeric(seconds)}`;
    }

    // Extract values
    const years = duration.years ?? 0;
    const months = duration.months ?? 0;
    const weeks = duration.weeks ?? 0;
    const days = duration.days ?? 0;
    const hours = duration.hours ?? 0;
    const minutes = duration.minutes ?? 0;
    const seconds = duration.seconds ?? 0;
    const milliseconds = duration.milliseconds ?? 0;
    const microseconds = duration.microseconds ?? 0;
    const nanoseconds = duration.nanoseconds ?? 0;

    // Format fractional seconds if needed
    let fractionalSeconds = 0;
    const fractionalDigits = options?.fractionalDigits;
    if (fractionalDigits !== undefined && fractionalDigits > 0) {
      const totalMs = milliseconds + microseconds / 1000 + nanoseconds / 1_000_000;
      fractionalSeconds =
        Math.floor((totalMs / 1000) * Math.pow(10, fractionalDigits)) / Math.pow(10, fractionalDigits);
    }

    // Build parts array based on options
    if (shouldDisplay(years, options?.yearsDisplay)) {
      const unitStyle = getUnitStyle("years");
      if (unitStyle === "numeric" || unitStyle === "2-digit") {
        const unitName = getUnitName(years, "year", style);
        const valueStr = unitStyle === "2-digit" ? years.toString().padStart(2, "0") : years.toString();
        parts.push(`${valueStr} ${unitName}`);
      } else {
        parts.push(formatUnit(years, "year", unitStyle));
      }
    }

    if (shouldDisplay(months, options?.monthsDisplay)) {
      const unitStyle = getUnitStyle("months");
      if (unitStyle === "numeric" || unitStyle === "2-digit") {
        const unitName = getUnitName(months, "month", style);
        const valueStr = unitStyle === "2-digit" ? months.toString().padStart(2, "0") : months.toString();
        parts.push(`${valueStr} ${unitName}`);
      } else {
        parts.push(formatUnit(months, "month", unitStyle));
      }
    }

    if (shouldDisplay(weeks, options?.weeksDisplay)) {
      const unitStyle = getUnitStyle("weeks");
      if (unitStyle === "numeric" || unitStyle === "2-digit") {
        const unitName = getUnitName(weeks, "week", style);
        const valueStr = unitStyle === "2-digit" ? weeks.toString().padStart(2, "0") : weeks.toString();
        parts.push(`${valueStr} ${unitName}`);
      } else {
        parts.push(formatUnit(weeks, "week", unitStyle));
      }
    }

    if (shouldDisplay(days, options?.daysDisplay)) {
      const unitStyle = getUnitStyle("days");
      if (unitStyle === "numeric" || unitStyle === "2-digit") {
        const unitName = getUnitName(days, "day", style);
        const valueStr = unitStyle === "2-digit" ? days.toString().padStart(2, "0") : days.toString();
        parts.push(`${valueStr} ${unitName}`);
      } else {
        parts.push(formatUnit(days, "day", unitStyle));
      }
    }

    if (shouldDisplay(hours, options?.hoursDisplay)) {
      const unitStyle = getUnitStyle("hours");
      if (unitStyle === "numeric" || unitStyle === "2-digit") {
        const unitName = getUnitName(hours, "hour", style);
        const valueStr = unitStyle === "2-digit" ? hours.toString().padStart(2, "0") : hours.toString();
        parts.push(`${valueStr} ${unitName}`);
      } else {
        parts.push(formatUnit(hours, "hour", unitStyle));
      }
    }

    if (shouldDisplay(minutes, options?.minutesDisplay)) {
      const unitStyle = getUnitStyle("minutes");
      if (unitStyle === "numeric" || unitStyle === "2-digit") {
        const unitName = getUnitName(minutes, "minute", style);
        const valueStr = unitStyle === "2-digit" ? minutes.toString().padStart(2, "0") : minutes.toString();
        parts.push(`${valueStr} ${unitName}`);
      } else {
        parts.push(formatUnit(minutes, "minute", unitStyle));
      }
    }

    if (shouldDisplay(seconds + fractionalSeconds, options?.secondsDisplay)) {
      const unitStyle = getUnitStyle("seconds");
      const totalSeconds = seconds + fractionalSeconds;
      if (unitStyle === "numeric" || unitStyle === "2-digit") {
        const unitName = getUnitName(Math.abs(totalSeconds) >= 1 ? totalSeconds : 1, "second", style);
        let secondsStr: string;
        if (fractionalDigits !== undefined && fractionalDigits > 0) {
          secondsStr = totalSeconds.toFixed(fractionalDigits);
        } else {
          secondsStr = seconds.toString();
        }
        if (unitStyle === "2-digit" && fractionalDigits === undefined) {
          secondsStr = secondsStr.padStart(2, "0");
        }
        parts.push(`${secondsStr} ${unitName}`);
      } else {
        // For non-numeric styles, we need to handle fractional seconds differently
        if (fractionalSeconds > 0 && fractionalDigits !== undefined && fractionalDigits > 0) {
          const unitName = getUnitName(1, "second", style);
          parts.push(`${totalSeconds.toFixed(fractionalDigits)} ${unitName}`);
        } else {
          parts.push(formatUnit(seconds, "second", unitStyle));
        }
      }
    }

    // Handle sub-second units if explicitly requested
    // if (shouldDisplay(milliseconds, options?.millisecondsDisplay) && options?.millisecondsDisplay === "always") {
    //   const unitStyle = getUnitStyle("milliseconds");
    //   if (unitStyle === "numeric" || unitStyle === "2-digit") {
    //     const unitName = getUnitName(1, "second", style);
    //     const msUnitName = getUnitName(milliseconds, "millisecond", style);
    //     if (unitStyle === "numeric" || unitStyle === "2-digit") {
    //       parts.push(`${milliseconds} ${msUnitName}`);
    //     } else {
    //       const normalizedStyle: "long" | "short" | "narrow" = unitStyle === "2-digit" ? "short" : unitStyle;
    //       parts.push(formatUnit(milliseconds, "millisecond", normalizedStyle));
    //     }

    // If no parts were added (all zeros), return "0 seconds"
    if (parts.length === 0) {
      // Use "long" style for zero to get full unit name (e.g., "seconds" not "s")
      const formatter = new Intl.RelativeTimeFormat(locale, { style: "long", numeric: "always" });
      const formatParts = formatter.formatToParts(0, "second");
      // Extract number and unit, skip literal prefixes
      const resultParts: string[] = [];
      let foundInteger = false;
      for (const part of formatParts) {
        if (part.type === "integer" || part.type === "decimal" || part.type === "fraction") {
          resultParts.push(part.value);
          foundInteger = true;
        } else if (part.type === "literal" && foundInteger) {
          // After finding the integer, the next literal contains the unit name
          resultParts.push(part.value.trim());
          break;
        }
      }
      return resultParts.join(" ").trim() || "0 seconds";
    }

    // Join parts with appropriate separator based on style
    if (style === "narrow") {
      return parts.join(" ");
    } else {
      // For long and short, use list formatting for better localization
      try {
        const listFormatter = new Intl.ListFormat(locale, { style: "long", type: "conjunction" });
        return listFormatter.format(parts);
      } catch {
        // Fallback if ListFormat is not available
        return parts.join(", ");
      }
    }
  }
}

const LOCALE_ES = {
  token: "Fracciones",
};
const LOCALE_EN = {
  token: "Fractions",
};
const LOCALE_PT = {
  token: "Frações",
};
const LOCALES = /*#__PURE__*/ { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
