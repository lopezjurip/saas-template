import { IS_BROWSER } from "./ssr";

/**
 * This is `IS_FINITE()` best friend.
 * Note: uses `parseFloat(value, 10)`. Refer to `IS_FINITE()` to confirm is valid number (not `NaN`). It's safe to use functional as `.map(NUMBER)`.
 * @example
 * Number(undefined) // NaN
 * Number(null) // 0
 * Number("") // 0
 * Number("foo") // NaN
 * parseInt(undefined) // NaN
 * parseInt(null) // NaN
 * parseInt("") // NaN
 * parseInt("foo") // NaN
 *
 * @example
 * const value = NUMBER(row["amount"])
 * if (IS_FINITE(value)) {
 *   // ...
 * }
 */
export function NUMBER(value: number | string | null | undefined | string[] | unknown): number {
  if (Array.isArray(value)) {
    return Number.NaN;
  }
  // @ts-expect-error: null and undefined works.
  return Number.parseFloat(value, 10);
}

/**
 * Same as `NUMBER()` but will throw error if invalid (`!IS_FINITE`).
 */
export function NUMBER_STRICT(value: Parameters<typeof NUMBER>[0]): number {
  const number = NUMBER(value);
  if (!IS_FINITE(number)) {
    throw new Error(`[NUMBER_STRICT] Error: expected numeric value, got instead: ${value}`);
  }
  return number;
}

/**
 * This is `NUMBER()` best friend.
 * Wrap of `Number.isFinite` but with type-guard.
 * NOTE: Numbers as strings (eg: `"1"`) will return `false`.
 * NOTE: `NaN` and `Infinity` are number-types but will return `false`.
 * @example
 * const value = NUMBER(row["amount"])
 * if (IS_FINITE(value)) {
 *   // ...
 * }
 */
export function IS_FINITE(number: unknown): number is number {
  return Number.isFinite(number);
}

/** Turn a decimal into a string with percent (%)
 * NOTE: Should be used only for CSS purposes, for UI use `useIntlNumberFormat({...FORMAT_NUMBER_DECIMALS_1, ...FORMAT_PCT})`
 */
export function PCT(number: number, digits = 2) {
  return `${(number * 100).toFixed(digits)}%`;
}

/**
 * NOTE: Safari 14.0.2 has a bug where it doesn't show the currency symbol.
 * TODO: Not SSR friendly.
 */
const isSafariBefore14_0_2 = /*#__PURE__*/ IS_BROWSER() && window.navigator.userAgent.includes("Version/14.0.2");

export const FORMAT_CURRENCY_CLP: Intl.NumberFormatOptions = /*#__PURE__*/ {
  style: "currency",
  currency: "CLP",
  currencyDisplay: isSafariBefore14_0_2 ? "symbol" : "narrowSymbol",
  roundingMode: "trunc",
};

export const FORMAT_CURRENCY_CLF: Intl.NumberFormatOptions = /*#__PURE__*/ {
  style: "currency",
  currency: "CLF",
  currencyDisplay: isSafariBefore14_0_2 ? "symbol" : "narrowSymbol",
  maximumFractionDigits: 4,
  roundingMode: "trunc",
};


export function CLAMP(number: number, min: number, max: number) {
  return Math.min(Math.max(number, min), max);
}

/** Clamp a number between 0.0 and 1.0 */
export function CLAMP_PCT(number: number) {
  return CLAMP(number, 0.0, 1.0);
}

export function TRUNC(number: number, digits: number = 0) {
  if (digits === 0) {
    return Math.trunc(number);
  }
  const factor = 10 ** digits;
  return Math.trunc(number * factor) / factor;
}

export function ROUND(number: number, digits: number = 0) {
  if (digits === 0) {
    return Math.round(number);
  }
  const factor = 10 ** digits;
  return Math.round(number * factor) / factor;
}

export function FLOOR(number: number, digits: number = 0) {
  if (digits === 0) {
    return Math.floor(number);
  }
  const factor = 10 ** digits;
  return Math.floor(number * factor) / factor;
}

export function CEIL(number: number, digits: number = 0) {
  if (digits === 0) {
    return Math.ceil(number);
  }
  const factor = 10 ** digits;
  return Math.ceil(number * factor) / factor;
}

const ROMAN_MAP: readonly [number, string][] = /*#__PURE__*/ [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/**
 * Converts a positive integer (1..3999) into its Roman numeral representation.
 * Returns "" for values outside that range or non-finite inputs.
 * @example
 * NUMBER_ROMAN(1)    // "I"
 * NUMBER_ROMAN(4)    // "IV"
 * NUMBER_ROMAN(2024) // "MMXXIV"
 */
export function NUMBER_ROMAN(n: number): string {
  if (!Number.isFinite(n) || n < 1 || n > 3999 || !Number.isInteger(n)) {
    return "";
  }
  let out = "";
  let rest = n;
  for (const [value, symbol] of ROMAN_MAP) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }
  return out;
}

/**
 * Splits a positive `total` into greedy chunks of exactly `max`, with the last chunk holding the
 * remainder (which is `<= max`). The sum of all chunks is exactly `total` (no rounding loss).
 *
 * `decimals` controls the smallest unit. Default `0` means integer chunks (e.g. CLP). Use `2` for
 * cents-precision (e.g. USD), `4` for UF, etc.
 *
 * Use `NUMBER_CHUNK_EVEN` if you need chunks distributed as evenly as possible instead.
 *
 * @example
 * NUMBER_CHUNK(10_000_000, 7_000_000)        // [7_000_000, 3_000_000]
 * NUMBER_CHUNK(14_000_000, 7_000_000)        // [7_000_000, 7_000_000]
 * NUMBER_CHUNK(27_230_000, 7_000_000)        // [7_000_000, 7_000_000, 7_000_000, 6_230_000]
 * NUMBER_CHUNK(10.5, 3, 1)                   // [3, 3, 3, 1.5]
 * NUMBER_CHUNK(100.05, 30, 2)                // [30, 30, 30, 10.05]
 */
export function NUMBER_CHUNK(total: number, max: number, decimals: number = 0): number[] {
  const { totalScaled, maxScaled, factor } = NUMBER_CHUNK_VALIDATE("NUMBER_CHUNK", total, max, decimals);
  const fullChunks = Math.floor(totalScaled / maxScaled);
  const remainderScaled = totalScaled - fullChunks * maxScaled;
  const result: number[] = [];
  for (let i = 0; i < fullChunks; i++) {
    result.push(maxScaled / factor);
  }
  if (remainderScaled > 0) {
    result.push(remainderScaled / factor);
  }
  return result;
}

/**
 * Splits a positive `total` into the smallest number of chunks where each chunk is `<= max`.
 * Chunks are distributed as evenly as possible (not greedy); leftover units are spread one-by-one
 * across the first chunks so the sum of all chunks is exactly `total` (no rounding loss).
 *
 * `decimals` controls the smallest unit. Default `0` means integer chunks (e.g. CLP). Use `2` for
 * cents-precision (e.g. USD), `4` for UF, etc.
 *
 * Use `NUMBER_CHUNK` if you need greedy chunks of exactly `max` (with leftover at the end).
 *
 * @example
 * NUMBER_CHUNK_EVEN(10_000_000, 7_000_000)   // [5_000_000, 5_000_000]
 * NUMBER_CHUNK_EVEN(27_230_000, 7_000_000)   // [6_807_500, 6_807_500, 6_807_500, 6_807_500]
 * NUMBER_CHUNK_EVEN(10.5, 3, 1)              // [2.7, 2.6, 2.6, 2.6]
 * NUMBER_CHUNK_EVEN(100.05, 30, 2)           // [25.02, 25.01, 25.01, 25.01]
 */
export function NUMBER_CHUNK_EVEN(total: number, max: number, decimals: number = 0): number[] {
  const { totalScaled, maxScaled, factor } = NUMBER_CHUNK_VALIDATE("NUMBER_CHUNK_EVEN", total, max, decimals);
  const count = Math.ceil(totalScaled / maxScaled);
  const base = Math.floor(totalScaled / count);
  const remainder = totalScaled - base * count;
  return Array.from({ length: count }, (_, index) => {
    const scaled = base + (index < remainder ? 1 : 0);
    return scaled / factor;
  });
}

function NUMBER_CHUNK_VALIDATE(name: string, total: number, max: number, decimals: number) {
  if (!Number.isFinite(total) || !Number.isFinite(max)) {
    throw new Error(`${name} requires finite numbers (total=${total}, max=${max})`);
  } else if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error(`${name} requires non-negative integer decimals (got ${decimals})`);
  } else if (total <= 0) {
    throw new Error(`${name} requires total > 0 (got ${total})`);
  } else if (max <= 0) {
    throw new Error(`${name} requires max > 0 (got ${max})`);
  }
  const factor = 10 ** decimals;
  const totalScaled = Math.round(total * factor);
  const maxScaled = Math.floor(max * factor);
  if (maxScaled < 1) {
    throw new Error(`${name}: max=${max} is smaller than the smallest unit at decimals=${decimals}`);
  }
  return { totalScaled, maxScaled, factor };
}

/**
 * Returns the nth Fibonacci number (1-indexed for backoff use).
 * F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8, ...
 * For n < 1 returns 0.
 */
export function FIBONACCI(n: number): number {
  if (!Number.isFinite(n) || n < 1) {
    return 0;
  }
  if (n <= 2) {
    return 1;
  }
  let a = 1;
  let b = 1;
  for (let i = 3; i <= n; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  return b;
}
