import type { Maybe } from "./maybe";
import { FLOOR } from "./number";

/**
 * For handling timezone and sensitive dates please use `temporal.ts`.
 */

/**
 * Check if the `Date` object is valid.
 * @example
 * const date = new Date('2024-12-31');
 */
export function DATETIME_IS_VALID(date: Date): date is Date {
  return !Number.isNaN(date.getTime());
}

/**
 * Returns null on invalid date. Passing an explicit `undefined` or `null` is an invalid date and will return null.
 * @example
 * DATETIME() // valid date (now)
 * DATETIME('2024-12-31') // valid date
 * DATETIME(new Date('2024-12-31')) // valid date (cloned)
 * @example
 * DATETIME(undefined) // invalid date returns null
 * DATETIME(null) // invalid date returns null
 * DATETIME(new Date('INVALID')) // invalid date returns null
 */
export function DATETIME(...params: unknown[]): Maybe<Date> {
  if (params.length === 0) {
    return new Date();
  } else if (params[0] === null) {
    return null;
  } else if (params[0] === undefined) {
    return null;
  } else if (params[0] instanceof Date) {
    // if invalid date, it will return null.
    if (!DATETIME_IS_VALID(params[0])) {
      return null;
    }
    // if the first parameter is a valid `Date` object, clone it to avoid mutating the original.
    return new Date(params[0]);
  }

  // @ts-expect-error: Ignore
  const date = new Date(params[0]);
  return date instanceof Date && DATETIME_IS_VALID(date) ? date : null;
}

/** Keep date-time value but set timezone to local. See: https://stackoverflow.com/a/15171030 */
export function DATETIME_UTC(date: Date): Date {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

/** This is helpful for dates from psql that causes timezone to add/remove one day. This prevents that. */
export function DATE(...params: unknown[]): Maybe<Date> {
  const date = DATETIME(...params);
  return date && DATETIME_UTC(date);
}

/** Returns a new date in datetime-local format. */
export function DATETIME_LOCAL(date: unknown): Maybe<string> {
  // Validate and parse the input date string
  const parsed_date = DATETIME(date);

  if (!parsed_date) {
    return DATETIME_LOCAL(new Date());
  }

  // Utility function for zero-padding
  const padWithZero = (number: number) => String(number).padStart(2, "0");

  // Extract and format individual date components
  const year = parsed_date.getFullYear();
  const month = padWithZero(parsed_date.getMonth() + 1);
  const day = padWithZero(parsed_date.getDate());
  const hours = padWithZero(parsed_date.getHours());
  const minutes = padWithZero(parsed_date.getMinutes());

  // Construct the formatted date-time string
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * @example
 * const [yyyy, mm, dd] = DATE_PARTS(new Date()); // [2024, 1, 28]
 */
export function DATE_PARTS(date: Date) {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  return [yyyy, mm, dd] as const;
}

/**
 * Same as `DATE_PARTS` but returns strings padded with zeros.
 * @example
 * const [yyyy, mm, dd] = DATE_PARTS_PADDED(new Date()); // ["2024", "01", "28"]
 */
export function DATE_PARTS_PADDED(date: Date) {
  const [yyyy, mm, dd] = DATE_PARTS(date).map(String) as [string, string, string];
  return [yyyy.padStart(4, "0"), mm.padStart(2, "0"), dd.padStart(2, "0")] as const;
}

export function NOW() {
  return new Date();
}

/** Return the number of days of difference between two dates. */
export function DATE_DIFF_DAYS(greater: Date, smaller: Date): number {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

  // Convert both dates to UTC to avoid timezone differences
  const smaller_utc = Date.UTC(smaller.getFullYear(), smaller.getMonth(), smaller.getDate());
  const greater_utc = Date.UTC(greater.getFullYear(), greater.getMonth(), greater.getDate());

  // Calculate the difference in days
  const daysDifference = FLOOR((greater_utc - smaller_utc) / oneDayInMilliseconds);
  return daysDifference;
}

/** True if `date` is before `point` as days (non-inclusive). CAUTION: this ignores time and timezone. */
export function DATE_IS_PAST(date: Date, point = new Date()): boolean {
  return DATE_DIFF_DAYS(point, date) > 0;
}
/** True if `date` is after `point` as days (non-inclusive). CAUTION: this ignores time and timezone. */
export function DATE_IS_FUTURE(date: Date, point = new Date()): boolean {
  return DATE_DIFF_DAYS(date, point) > 0;
}
/** True if `date` is equal to `point` as days. CAUTION: this ignores time and timezone. */
export function DATE_IS_EQUAL(date: Date, ...dates: Date[]): boolean {
  return dates.every((point) => date.toDateString() === point.toDateString());
}

export function DATETIME_PLUS(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

/** Subtract two datetimes and return diff in milliseconds */
export function DATETIME_DIFF_MS(greater: Date, smaller: Date) {
  return greater.getTime() - smaller.getTime();
}

/** True if `date` as datetime is before `point` (non-inclusive). This compares dates and times with timezone. */
export function DATETIME_IS_PAST(date: Date, point = new Date()): boolean {
  return DATETIME_DIFF_MS(point, date) > 0;
}
/** True if `date` as datetime is after `point` (non-inclusive). This compares dates and times with timezone. */
export function DATETIME_IS_FUTURE(date: Date, point = new Date()): boolean {
  return DATETIME_DIFF_MS(date, point) > 0;
}
export function DATETIME_IS_EQUAL(date: Date, point = new Date()): boolean {
  return DATETIME_DIFF_MS(date, point) === 0;
}

/** Check if `point` is between two dates. If the `start` or `end` threshold is null or undefined it's considered opened. */
export function DATETIME_IS_BETWEEN(start: Maybe<Date>, end: Maybe<Date>, point = new Date()): boolean {
  if (start && end) {
    if (DATETIME_IS_PAST(start, point) && DATETIME_IS_FUTURE(end, point)) {
      return true;
    }
  } else if (start) {
    if (DATETIME_IS_PAST(start, point)) {
      return true;
    }
  } else if (end) {
    if (DATETIME_IS_FUTURE(end, point)) {
      return true;
    }
  }
  return false;
}

const DIVISIONS = /*#__PURE__*/ [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
] as const;

/**
 * https://blog.webdevsimplified.com/2020-07/relative-time-format/
 * @example
 * const formatter = new Intl.RelativeTimeFormat();
 * const parts = DATE_RELATIVE_FROM_DATE(date)
 * formatter.format(...parts)
 */
export function DATETIME_RELATIVE_FROM_DATE(date: Date, now = new Date()) {
  let duration = DATETIME_DIFF_MS(date, now) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return [Math.round(duration), division.name] as const;
    }
    duration /= division.amount;
  }

  return null;
}

/**
 * YYYY-MM-DD
 * Careful with the timezone, it will return the date in UTC.
 * @example
 * const str = DATE_STRING(new Date()); // "2024-01-28"
 */
export function DATE_STRING(date: Date): string {
  const [str] = date.toISOString().split("T");
  return str!;
}

/** https://stackoverflow.com/a/6109105 */
export function TIME_RELATIVE_DIFF_ES(current: Date, previous: Date, yearThreshold = 12 * 5): string {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current.getTime() - previous.getTime();

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)} s`;
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)}min`;
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)}hrs`;
  } else if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)}d`;
  } else {
    const months = Math.round(elapsed / msPerMonth);
    if (months < yearThreshold) {
      // Display in months if below threshold
      return months === 1 ? "1 mes" : `${months} meses`;
    } else {
      // Display in years otherwise
      const yrs = Math.round(months / 12);
      return yrs === 1 ? "1 año" : `${yrs} años`;
    }
  }
}

/**
 * @example
 * const formatter = useIntlRelativeTimeFormat();
 * const display = formatter.format(...RELATIVE_DATE_FORMAT(date_at));
 */
export function RELATIVE_DATE_FORMAT(fromDate: Date, toDate: Date = new Date()): [number, Intl.RelativeTimeFormatUnit] {
  const elapsedMilliseconds = toDate.getTime() - fromDate.getTime();
  const seconds = FLOOR(elapsedMilliseconds / 1000);
  const minutes = FLOOR(seconds / 60);
  const hours = FLOOR(minutes / 60);
  const days = FLOOR(hours / 24);
  const months = FLOOR(days / 30);
  const years = FLOOR(months / 12);

  if (seconds < 60) {
    return [-seconds, "second"];
  } else if (minutes < 60) {
    return [-minutes, "minute"];
  } else if (hours < 24) {
    return [-hours, "hour"];
  } else if (days < 30) {
    return [-days, "day"];
  } else if (months < 12) {
    return [-months, "month"];
  } else {
    return [-years, "year"];
  }
}

export function DATE_EPOCH(date: Date): number {
  return FLOOR(date.getTime() / 1000);
}

export type DateTimeTruncateModes = "month" | "day" | "year" | "hour" | "minute" | "second" | "ms";

/**
 * Simplify `Date` by truncating it to a specific component.
 * TODO: not sure about timezones.
 */
export function DATETIME_TRUNCATE(
  date: Date,
  mode: DateTimeTruncateModes,
  /** TODO: not sure. */
  truncateTz: boolean = mode === "year" || mode === "month" || mode === "day",
): Date {
  if (truncateTz) {
    switch (mode) {
      case "year":
        return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      case "month":
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
      case "day":
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      case "hour":
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours()));
      case "minute":
        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
          ),
        );
      case "second":
        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
          ),
        );
      case "ms":
        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds(),
          ),
        );
      default:
        throw new Error(`[DATETIME_TRUNCATE] invalid mode: ${mode}`);
    }
  } else {
    switch (mode) {
      case "year":
        return new Date(date.getFullYear(), 0, 1);
      case "month":
        return new Date(date.getFullYear(), date.getMonth(), 1);
      case "day":
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      case "hour":
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
      case "minute":
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
      case "second":
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        );
      case "ms":
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds(),
        );
      default:
        throw new Error(`[DATETIME_TRUNCATE] invalid mode: ${mode}`);
    }
  }
}
