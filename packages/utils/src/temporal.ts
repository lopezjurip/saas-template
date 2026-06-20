/**
 * Polyfill for Temporal API (https://tc39.es/proposal-temporal/docs/)
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
 */

import { Temporal } from "temporal-polyfill";
import { FIBONACCI, NUMBER } from "./number";

export { Temporal }; // So we don't have to npm add it everywhere and later uninstall it

/** Santiago timezone. */
export const TZ = "America/Santiago";

export type TemporalValue = Temporal.ZonedDateTime | Temporal.PlainDateTime | Temporal.PlainDate;

function ISO(date: string | Date): string {
  return date instanceof Date ? date.toISOString() : date;
}

/**
 * Parse input into a Temporal DateTime with a timezone (defaults to "America/Santiago").
 * On `null` input, returns current date in timezone.
 * Idempotent: if input is already a TemporalValue, converts appropriately.
 */
export function TEMPORAL(date: string | Date | TemporalValue | null, timezone = TZ): Temporal.ZonedDateTime {
  if (date === null) {
    return TEMPORAL_NOW(timezone);
  } else if (date instanceof Temporal.ZonedDateTime) {
    // If timezone matches, return as-is; otherwise convert to requested timezone
    if (date.timeZoneId === timezone) {
      return date;
    }
    return date.withTimeZone(timezone);
  } else if (date instanceof Temporal.PlainDateTime) {
    return date.toZonedDateTime(timezone);
  } else if (date instanceof Temporal.PlainDate) {
    return date.toZonedDateTime(timezone);
  }

  // Handle string | Date inputs
  const input = ISO(date);

  if (/[T ]/.test(input)) {
    try {
      return Temporal.Instant.from(input).toZonedDateTimeISO(timezone);
    } catch {
      // No offset/zone → treat as wall time in given timezone
      const pdt = Temporal.PlainDateTime.from(input);
      return pdt.toZonedDateTime(timezone);
    }
  }
  // Plain date case
  return Temporal.PlainDateTime.from(input).toZonedDateTime(timezone);
}

/** Get current datetime in a given timezone.  */
export function TEMPORAL_NOW(timezone = TZ): Temporal.ZonedDateTime {
  return Temporal.Now.zonedDateTimeISO(timezone);
}

/**
 * Parse input into a PlainDate in given timezone (defaults to "America/Santiago").
 * On `null` input, returns current date in timezone.
 */
export function TEMPORAL_PLAINDATE(date: string | Date | null, timezone = TZ): Temporal.PlainDate {
  return TEMPORAL(date, timezone).toPlainDate();
}

export function TEMPORAL_PLAINDATETIME(date: string | Date | null, timezone = TZ): Temporal.PlainDateTime {
  return TEMPORAL(date, timezone).toPlainDateTime();
}

export function INSTANT_NOW(): Temporal.Instant {
  return Temporal.Now.instant();
}

export type InstantInput =
  | Temporal.Instant
  | Temporal.ZonedDateTime
  | Temporal.PlainDateTime
  | Date
  | number
  | bigint
  | string;

export function INSTANT_FROM(input: InstantInput): Temporal.Instant {
  if (input instanceof Temporal.Instant) {
    return input;
  } else if (input instanceof Temporal.ZonedDateTime) {
    return input.toInstant();
  } else if (input instanceof Temporal.PlainDateTime) {
    // Assume UTC for PlainDateTime (adjust if your app uses another default)
    return input.toZonedDateTime("UTC").toInstant();
  } else if (input instanceof Date) {
    return Temporal.Instant.fromEpochMilliseconds(input.getTime());
  } else if (typeof input === "number") {
    return Temporal.Instant.fromEpochMilliseconds(input);
  } else if (typeof input === "bigint") {
    return Temporal.Instant.fromEpochNanoseconds(input);
  } else if (typeof input === "string") {
    return Temporal.Instant.from(input);
  } else {
    throw new TypeError("Unsupported input for INSTANT_FROM");
  }
}

/**
 * Useful to generate representative dates for a given month/year/day for display purposes.
 * Missing values will default to `1970-01-01`.
 * @example
 * TEMPORAL_PLAINDATE_REPRESENTATIVE({ month: 2 }) // 1970-02-01
 * TEMPORAL_PLAINDATE_REPRESENTATIVE({ year: 2020, month: 5 }) // 2020-05-01
 * TEMPORAL_PLAINDATE_REPRESENTATIVE({ year: 2025, day: 29 }) // 2025-01-29
 * TEMPORAL_PLAINDATE_REPRESENTATIVE({}) // 1970-01-01
 */
export function TEMPORAL_PLAINDATE_REPRESENTATIVE(options: {
  year?: number;
  month?: number;
  day?: number;
}): Temporal.PlainDate {
  const year = options.year ?? 1970;
  const month = options.month ?? 1;
  const day = options.day ?? 1;
  return Temporal.PlainDate.from({ year, month, day });
}

/**
 * @example
 * TEMPORAL_DISPLAY_MONTH("es-CL", Temporal.PlainDate.from("2023-10-05")) // "octubre"
 * TEMPORAL_DISPLAY_MONTH("en-US", TEMPORAL_PLAINDATE_REPRESENTATIVE({ month: 2 })) // "February"
 */
export function TEMPORAL_DISPLAY_MONTH(
  locale: Intl.LocalesArgument,
  date: Temporal.PlainDate | Temporal.ZonedDateTime,
): string {
  return date.toLocaleString(locale, { month: "long" });
}

/**
 * Format for SQL text comparisons (timestamptz literals). Strips the IANA zone name,
 * keeping the UTC offset so PostgreSQL interprets it correctly.
 *
 * For Supabase/PostgREST `.filter()` / `.eq()` / `.gte()`, etc.
 *
 * @example
 * TEMPORAL("2025-01-01").toString()        // '2025-01-01T00:00:00-03:00[America/Santiago]' // fails in Supabase.
 * TEMPORAL_TO_SQL(TEMPORAL("2025-01-01"))  // '2025-01-01T00:00:00-03:00' // Supabase compatible.
 */
export function TEMPORAL_TO_SQL(date: TemporalValue) {
  return date.toString({ timeZoneName: "never" });
}

/**
 * @example
 * const [YYYY, MM, DD] = TEMPORAL_PARTS(Temporal.PlainDate.from("2025-01-05"));
 */
export function TEMPORAL_PARTS(date: TemporalValue) {
  const year = date.year;
  const month = date.month;
  const day = date.day;
  return [year, month, day] as const;
}

/**
 * Same as TEMPORAL_PARTS but returns zero-padded strings (eg: "2025", "01", "05").
 * @example
 * const [YYYY, MM, DD] = TEMPORAL_PARTS_PADDED(Temporal.PlainDate.from("2025-01-05"));
 */
export function TEMPORAL_PARTS_PADDED(date: TemporalValue) {
  const year = date.year.toString().padStart(4, "0");
  const month = date.month.toString().padStart(2, "0");
  const day = date.day.toString().padStart(2, "0");
  return [year, month, day] as const;
}

export type TemporalZonedDateTime = Temporal.ZonedDateTime;

/**
 * Parse PostgreSQL interval string to Temporal.Duration.
 * Supports formats like "13 days 11:53:26.600491" or "1 year 2 months 3 days 04:05:06.123456".
 * @example
 * ```tsx
 * DURATION_FROM_SQL("13 days 11:53:26.600491");
 * ```
 */
export function DURATION_FROM_SQL(interval: string): Temporal.Duration {
  // Try ISO 8601 format first (if PostgreSQL is configured to output it)
  try {
    return Temporal.Duration.from(interval);
  } catch {
    // Fall back to parsing PostgreSQL traditional format
  }

  // Parse PostgreSQL traditional format: "X days HH:MM:SS.microseconds"
  // Or more complex: "X years Y months Z days HH:MM:SS.microseconds"
  const parts: {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
    microseconds?: number;
  } = {};

  // Match patterns like "13 days", "1 year", "2 months", etc.
  const datePartRegex = /(\d+)\s+(year|years|month|months|week|weeks|day|days)/gi;
  let match: RegExpExecArray | null = null;
  while (true) {
    match = datePartRegex.exec(interval);
    if (match === null) {
      break;
    }
    const value = NUMBER(match[1]);
    const unit = match[2]?.toLowerCase() ?? "";
    if (unit.startsWith("year")) {
      parts.years = (parts.years ?? 0) + value;
    } else if (unit.startsWith("month")) {
      parts.months = (parts.months ?? 0) + value;
    } else if (unit.startsWith("week")) {
      parts.weeks = (parts.weeks ?? 0) + value;
    } else if (unit.startsWith("day")) {
      parts.days = (parts.days ?? 0) + value;
    }
  }

  // Match time part: "HH:MM:SS.microseconds" or "HH:MM:SS"
  const timePartRegex = /(\d{1,2}):(\d{1,2}):(\d{1,2}(?:\.\d+)?)/;
  const timeMatch = interval.match(timePartRegex);
  if (timeMatch) {
    parts.hours = NUMBER(timeMatch[1]);
    parts.minutes = NUMBER(timeMatch[2]);
    const secondsStr = timeMatch[3];
    const secondsNum = NUMBER(secondsStr);
    parts.seconds = Math.floor(secondsNum);
    const fractional = secondsNum - parts.seconds;

    if (fractional > 0) {
      // Convert fractional seconds to milliseconds/microseconds
      // PostgreSQL microseconds are in the fractional part
      // e.g., "26.600491" = 26 seconds + 600491 microseconds
      const totalMicroseconds = Math.round(fractional * 1_000_000);
      parts.milliseconds = Math.floor(totalMicroseconds / 1_000);
      const remainingMicroseconds = totalMicroseconds % 1_000;
      if (remainingMicroseconds > 0) {
        parts.microseconds = remainingMicroseconds;
      }
    }
  }

  // Only include defined, non-zero values
  const filteredParts: typeof parts = {};
  for (const [key, value] of Object.entries(parts)) {
    if (value !== undefined && value !== 0) {
      filteredParts[key as keyof typeof parts] = value;
    }
  }

  return Temporal.Duration.from(filteredParts);
}

/** Like Math.min but for Temporal.PlainDate. Returns null if input is empty. */
export function MIN_TEMPORAL_PD(...args: [Temporal.PlainDate, ...Temporal.PlainDate[]]): Temporal.PlainDate; // Doesn't return null if at least one argument
export function MIN_TEMPORAL_PD(...args: Temporal.PlainDate[]): Temporal.PlainDate | null;
export function MIN_TEMPORAL_PD(...args: Temporal.PlainDate[]): Temporal.PlainDate | null {
  if (args.length === 0) return null;
  return args.reduce((a, b) => (Temporal.PlainDate.compare(a, b) < 0 ? a : b));
}

/** Like Math.max but for Temporal.PlainDate. Returns null if input is empty. */
export function MAX_TEMPORAL_PD(...args: [Temporal.PlainDate, ...Temporal.PlainDate[]]): Temporal.PlainDate; // Doesn't return null if at least one argument
export function MAX_TEMPORAL_PD(...args: Temporal.PlainDate[]): Temporal.PlainDate | null;
export function MAX_TEMPORAL_PD(...args: Temporal.PlainDate[]): Temporal.PlainDate | null {
  if (args.length === 0) return null;
  return args.reduce((a, b) => (Temporal.PlainDate.compare(a, b) > 0 ? a : b));
}

export type TemporalTruncateUnit = Temporal.DateUnit | Temporal.TimeUnit;

/**
 * Remove up to the given unit. Returns a Temporal object.
 *
 * @example
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "year") // 2025-01-01:00:00
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "month") // 2025-01-01:00:00
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "day") // 2025-01-05:00:00
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "hour") // 2025-01-05:21:00:00
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "minute") // 2025-01-05:21:30:00
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "second") // 2025-01-05:21:30:45
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "millisecond") // 2025-01-05:21:30:45
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "microsecond") // 2025-01-05:21:30:45
 * TEMPORAL_TRUNCATE(Temporal.PlainDate.from("2025-01-05:21:30:45"), "nanosecond") // 2025-01-05:21:30:45
 */
export function TEMPORAL_TRUNCATE<T extends TemporalValue>(date: T, truncate: TemporalTruncateUnit): T {
  if (date instanceof Temporal.PlainDate) {
    switch (truncate) {
      case "year":
        return date.with({ month: 1, day: 1 }) as T;
      case "month":
        return date.with({ day: 1 }) as T;
      case "day":
        return date as T;
      default:
        return date as T;
    }
  }

  if (date instanceof Temporal.PlainDateTime) {
    switch (truncate) {
      case "year":
        return date.with({
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
          microsecond: 0,
          nanosecond: 0,
        }) as T;
      case "month":
        return date.with({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "day":
        return date.with({ hour: 0, minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "hour":
        return date.with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "minute":
        return date.with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "second":
        return date.with({ millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "millisecond":
        return date.with({ microsecond: 0, nanosecond: 0 }) as T;
      case "microsecond":
        return date.with({ nanosecond: 0 }) as T;
      case "nanosecond":
        return date as T;
      default:
        return date as T;
    }
  }

  if (date instanceof Temporal.ZonedDateTime) {
    switch (truncate) {
      case "year":
        return date.with({
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
          microsecond: 0,
          nanosecond: 0,
        }) as T;
      case "month":
        return date.with({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "day":
        return date.with({ hour: 0, minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "hour":
        return date.with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "minute":
        return date.with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "second":
        return date.with({ millisecond: 0, microsecond: 0, nanosecond: 0 }) as T;
      case "millisecond":
        return date.with({ microsecond: 0, nanosecond: 0 }) as T;
      case "microsecond":
        return date.with({ nanosecond: 0 }) as T;
      case "nanosecond":
        return date as T;
      default:
        return date as T;
    }
  }

  throw new Error(`[TEMPORAL_TRUNCATE] Unsupported Temporal type: ${typeof date}`);
}

export type BaseBackoff = Temporal.Duration | Temporal.DurationLike | string;

/**
 * Scale a Temporal.Duration (spec-compatible)
 */
export function TEMPORAL_DURATION_SCALE(duration: Temporal.Duration, factor: number): Temporal.Duration {
  return new Temporal.Duration(
    duration.years * factor,
    duration.months * factor,
    duration.weeks * factor,
    duration.days * factor,
    duration.hours * factor,
    duration.minutes * factor,
    duration.seconds * factor,
    duration.milliseconds * factor,
    duration.microseconds * factor,
    duration.nanoseconds * factor,
  );
}

/**
 * Fibonacci backoff using Temporal-native Duration
 * @example
 * const attempts = 10;
 * const retry_at = FIBONACCI_BACKOFF(attempts, timestamp, "hours");
 * if (retry_at.epochMilliseconds <= Date.now()) {
 *   // do it
 * }
 */
export function FIBONACCI_BACKOFF(
  attempts: number,
  timestamp: Temporal.Instant,
  base: Temporal.Duration | Temporal.DurationLike | string = { minutes: 1 },
): Temporal.Instant {
  const fib = FIBONACCI(attempts);
  const duration = base instanceof Temporal.Duration ? base : Temporal.Duration.from(base);
  const backoff = TEMPORAL_DURATION_SCALE(duration, fib);
  return timestamp.add(backoff);
}
