import { describe, expect, it } from "vitest";
import { CEIL, FIBONACCI, FLOOR, NUMBER, NUMBER_CHUNK, NUMBER_CHUNK_EVEN, NUMBER_ROMAN, ROUND, TRUNC } from "./number";

describe("NUMBER", () => {
  it("should return NaN for null", () => {
    expect(NUMBER(null)).toBeNaN();
  });

  it("should return NaN for undefined", () => {
    expect(NUMBER(undefined)).toBeNaN();
  });

  it("should return NaN for empty string", () => {
    expect(NUMBER("")).toBeNaN();
  });

  it("should return NaN for non-numeric string", () => {
    expect(NUMBER("foo")).toBeNaN();
  });

  it("should work with integer numbers", () => {
    expect(NUMBER("42")).toBe(42);
  });

  it("should work with negative numbers", () => {
    expect(NUMBER("-42")).toBe(-42);
  });

  // TODO: not sure about this behavior.
  it.skip("should fail with coma ','", () => {
    expect(NUMBER("42,5")).toBeNaN();
  });

  it("should work with decimal numbers", () => {
    expect(NUMBER("3.14")).toBe(3.14);
  });

  it("should work with negative decimal numbers", () => {
    expect(NUMBER("-3.14")).toBe(-3.14);
  });

  it("should work with point number", () => {
    expect(NUMBER(".5")).toBe(0.5);
  });

  it("should work with negative point number", () => {
    expect(NUMBER("-.5")).toBe(-0.5);
  });

  it("should return NaN for boolean true", () => {
    expect(NUMBER(true)).toBeNaN();
  });

  it("should return NaN for boolean false", () => {
    expect(NUMBER(false)).toBeNaN();
  });

  it("should return NaN for an array of strings", () => {
    expect(NUMBER(["1", "2"])).toBeNaN();
  });

  it("should return number if input is already a number", () => {
    expect(NUMBER(100)).toBe(100);
    expect(NUMBER(-50.25)).toBe(-50.25);
  });

  it("should return NaN for object input", () => {
    expect(NUMBER({})).toBeNaN();
    expect(NUMBER({ value: "123" })).toBeNaN();
  });

  it("should return NaN for function input", () => {
    expect(NUMBER(() => 5)).toBeNaN();
  });

  it("should parse strings with leading/trailing whitespace", () => {
    expect(NUMBER("  42  ")).toBe(42);
    expect(NUMBER(" \n\t-3.5 ")).toBe(-3.5);
  });

  it("should stop parsing at non-numeric characters", () => {
    expect(NUMBER("123abc")).toBe(123);
    expect(NUMBER("3.14pie")).toBe(3.14);
  });

  it("should parse scientific notation", () => {
    expect(NUMBER("1e3")).toBe(1000);
    expect(NUMBER("-2.5e2")).toBe(-250);
  });

  it("should return Infinity for 'Infinity'", () => {
    expect(NUMBER("Infinity")).toBe(Number.POSITIVE_INFINITY);
    expect(NUMBER("-Infinity")).toBe(Number.NEGATIVE_INFINITY);
  });

  it("should return NaN for empty array", () => {
    expect(NUMBER([])).toBeNaN();
  });

  it.skip("should return NaN for null prototype object", () => {
    const obj = Object.create(null);
    expect(NUMBER(obj)).toBeNaN();
  });
});

describe("CEIL", () => {
  it("should round up to the nearest integer", () => {
    expect(CEIL(3.14)).toBe(4);
    expect(CEIL(-3.14)).toBe(-3);
    expect(CEIL(5)).toBe(5);
    expect(CEIL(-5)).toBe(-5);
  });

  it("should round up to specified decimal places", () => {
    expect(CEIL(Math.PI, 2)).toBe(3.15);
    expect(CEIL(-Math.PI, 2)).toBe(-3.14);
    expect(CEIL(2.5, 0)).toBe(3);
    expect(CEIL(-2.5, 0)).toBe(-2);
  });
});

describe("FLOOR", () => {
  it("should round down to the nearest integer", () => {
    expect(FLOOR(3.14)).toBe(3);
    expect(FLOOR(-3.14)).toBe(-4);
    expect(FLOOR(5)).toBe(5);
    expect(FLOOR(-5)).toBe(-5);
  });

  it("should round down to specified decimal places", () => {
    expect(FLOOR(Math.PI, 2)).toBe(3.14);
    expect(FLOOR(-Math.PI, 2)).toBe(-3.15);
    expect(FLOOR(2.5, 0)).toBe(2);
    expect(FLOOR(-2.5, 0)).toBe(-3);
  });
});
describe("ROUND", () => {
  it("should round to the nearest integer", () => {
    expect(ROUND(3.14)).toBe(3);
    expect(ROUND(3.5)).toBe(4); // tie → rounds up (away from 0)

    // ⚠️ Strange case: for negatives, many languages round -3.5 → -4,
    // but here we expect -3 (round half toward 0). This is a nonstandard choice.
    expect(ROUND(-3.14)).toBe(-3);
    expect(ROUND(-3.5)).toBe(-3);

    expect(ROUND(5)).toBe(5);
    expect(ROUND(-5)).toBe(-5);
  });

  it("should round to specified decimal places", () => {
    expect(ROUND(Math.PI, 2)).toBe(3.14);
    expect(ROUND(3.14559, 2)).toBe(3.15);

    expect(ROUND(-Math.PI, 2)).toBe(-3.14);
    expect(ROUND(-3.14559, 2)).toBe(-3.15);

    // ⚠️ Another strange case: ROUND(2.5, 0) → 3 but ROUND(-2.5, 0) → -2.
    // Asymmetric behavior (positive half → up, negative half → toward 0).
    expect(ROUND(2.5, 0)).toBe(3);
    expect(ROUND(-2.5, 0)).toBe(-2);
  });
});

describe("FIBONACCI", () => {
  it("should return 0 for n < 1", () => {
    expect(FIBONACCI(0)).toBe(0);
    expect(FIBONACCI(-1)).toBe(0);
    expect(FIBONACCI(Number.NaN)).toBe(0);
  });

  it("should return classic Fibonacci sequence", () => {
    expect(FIBONACCI(1)).toBe(1);
    expect(FIBONACCI(2)).toBe(1);
    expect(FIBONACCI(3)).toBe(2);
    expect(FIBONACCI(4)).toBe(3);
    expect(FIBONACCI(5)).toBe(5);
    expect(FIBONACCI(6)).toBe(8);
    expect(FIBONACCI(7)).toBe(13);
    expect(FIBONACCI(8)).toBe(21);
  });
});

describe("NUMBER_ROMAN", () => {
  it("should convert single-digit values", () => {
    expect(NUMBER_ROMAN(1)).toBe("I");
    expect(NUMBER_ROMAN(2)).toBe("II");
    expect(NUMBER_ROMAN(3)).toBe("III");
    expect(NUMBER_ROMAN(4)).toBe("IV");
    expect(NUMBER_ROMAN(5)).toBe("V");
    expect(NUMBER_ROMAN(9)).toBe("IX");
  });

  it("should convert tens correctly", () => {
    expect(NUMBER_ROMAN(10)).toBe("X");
    expect(NUMBER_ROMAN(40)).toBe("XL");
    expect(NUMBER_ROMAN(49)).toBe("XLIX");
    expect(NUMBER_ROMAN(50)).toBe("L");
    expect(NUMBER_ROMAN(90)).toBe("XC");
    expect(NUMBER_ROMAN(99)).toBe("XCIX");
  });

  it("should convert hundreds correctly", () => {
    expect(NUMBER_ROMAN(100)).toBe("C");
    expect(NUMBER_ROMAN(400)).toBe("CD");
    expect(NUMBER_ROMAN(500)).toBe("D");
    expect(NUMBER_ROMAN(900)).toBe("CM");
    expect(NUMBER_ROMAN(999)).toBe("CMXCIX");
  });

  it("should convert thousands correctly", () => {
    expect(NUMBER_ROMAN(1000)).toBe("M");
    expect(NUMBER_ROMAN(2024)).toBe("MMXXIV");
    expect(NUMBER_ROMAN(3999)).toBe("MMMCMXCIX");
  });

  it("should return empty string for out-of-range values", () => {
    expect(NUMBER_ROMAN(0)).toBe("");
    expect(NUMBER_ROMAN(-1)).toBe("");
    expect(NUMBER_ROMAN(4000)).toBe("");
  });

  it("should return empty string for non-finite or non-integer input", () => {
    expect(NUMBER_ROMAN(Number.NaN)).toBe("");
    expect(NUMBER_ROMAN(Number.POSITIVE_INFINITY)).toBe("");
    expect(NUMBER_ROMAN(Number.NEGATIVE_INFINITY)).toBe("");
    expect(NUMBER_ROMAN(3.14)).toBe("");
    expect(NUMBER_ROMAN(1.5)).toBe("");
  });
});

describe("TRUNC", () => {
  it("should TRUNC to the nearest integer", () => {
    expect(TRUNC(3.14)).toBe(3);
    expect(TRUNC(3.99)).toBe(3);

    // ⚠️ Truncation of negatives: TRUNC(-3.99) → -3, not -4.
    // This differs from floor(), which would push toward -∞.
    expect(TRUNC(-3.14)).toBe(-3);
    expect(TRUNC(-3.99)).toBe(-3);

    expect(TRUNC(5)).toBe(5);
    expect(TRUNC(-5)).toBe(-5);
  });

  it("should TRUNC to specified decimal places", () => {
    expect(TRUNC(Math.PI, 2)).toBe(3.14);
    expect(TRUNC(3.14959, 2)).toBe(3.14);

    expect(TRUNC(-Math.PI, 2)).toBe(-3.14);
    expect(TRUNC(-3.14959, 2)).toBe(-3.14);

    // ⚠️ Here TRUNC(±2.5, 0) → ±2. Always toward 0, not toward -∞.
    expect(TRUNC(2.5, 0)).toBe(2);
    expect(TRUNC(-2.5, 0)).toBe(-2);
  });
});

describe("NUMBER_CHUNK", () => {
  it("should return a single chunk when total <= max", () => {
    expect(NUMBER_CHUNK(1000, 7_000_000)).toEqual([1000]);
    expect(NUMBER_CHUNK(7_000_000, 7_000_000)).toEqual([7_000_000]);
    expect(NUMBER_CHUNK(1, 1)).toEqual([1]);
  });

  it("should fill greedy max chunks with remainder at the end", () => {
    expect(NUMBER_CHUNK(10_000_000, 7_000_000)).toEqual([7_000_000, 3_000_000]);
    expect(NUMBER_CHUNK(15_000_000, 7_000_000)).toEqual([7_000_000, 7_000_000, 1_000_000]);
    expect(NUMBER_CHUNK(27_230_000, 7_000_000)).toEqual([7_000_000, 7_000_000, 7_000_000, 6_230_000]);
  });

  it("should not append a zero chunk when total is a multiple of max", () => {
    expect(NUMBER_CHUNK(14_000_000, 7_000_000)).toEqual([7_000_000, 7_000_000]);
    expect(NUMBER_CHUNK(21_000_000, 7_000_000)).toEqual([7_000_000, 7_000_000, 7_000_000]);
    expect(NUMBER_CHUNK(9, 3)).toEqual([3, 3, 3]);
  });

  it("should always preserve the sum exactly", () => {
    const cases: Array<[number, number]> = [
      [27_230_000, 7_000_000],
      [10, 3],
      [11, 3],
      [7_000_001, 7_000_000],
      [99, 7],
      [1, 1_000_000],
    ];
    for (const [total, max] of cases) {
      const chunks = NUMBER_CHUNK(total, max);
      const sum = chunks.reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(total);
      for (const chunk of chunks) {
        expect(chunk).toBeLessThanOrEqual(max);
        expect(chunk).toBeGreaterThan(0);
      }
    }
  });

  it("should support decimals=1", () => {
    expect(NUMBER_CHUNK(10.5, 3, 1)).toEqual([3, 3, 3, 1.5]);
  });

  it("should support decimals=2 (cents-precision)", () => {
    expect(NUMBER_CHUNK(100.05, 30, 2)).toEqual([30, 30, 30, 10.05]);
  });

  it("should support decimals=4 (UF-precision)", () => {
    expect(NUMBER_CHUNK(1.5, 0.6, 4)).toEqual([0.6, 0.6, 0.3]);
  });

  it("should preserve sum exactly with decimals", () => {
    const chunks = NUMBER_CHUNK(100.05, 30, 2);
    const sumScaled = chunks.reduce((acc, n) => acc + Math.round(n * 100), 0);
    expect(sumScaled).toBe(10005);
  });

  it("should throw when total <= 0", () => {
    expect(() => NUMBER_CHUNK(0, 7_000_000)).toThrow(/total > 0/);
    expect(() => NUMBER_CHUNK(-1, 7_000_000)).toThrow(/total > 0/);
  });

  it("should throw when max <= 0", () => {
    expect(() => NUMBER_CHUNK(1000, 0)).toThrow(/max > 0/);
    expect(() => NUMBER_CHUNK(1000, -1)).toThrow(/max > 0/);
  });

  it("should throw on non-finite inputs", () => {
    expect(() => NUMBER_CHUNK(Number.NaN, 7)).toThrow(/finite/);
    expect(() => NUMBER_CHUNK(10, Number.POSITIVE_INFINITY)).toThrow(/finite/);
  });

  it("should throw on invalid decimals", () => {
    expect(() => NUMBER_CHUNK(10, 3, -1)).toThrow(/decimals/);
    expect(() => NUMBER_CHUNK(10, 3, 1.5)).toThrow(/decimals/);
  });

  it("should throw when max is below the smallest unit at decimals", () => {
    expect(() => NUMBER_CHUNK(1, 0.001, 2)).toThrow(/smallest unit/);
  });
});

describe("NUMBER_CHUNK_EVEN", () => {
  it("should return a single chunk when total <= max", () => {
    expect(NUMBER_CHUNK_EVEN(1000, 7_000_000)).toEqual([1000]);
    expect(NUMBER_CHUNK_EVEN(7_000_000, 7_000_000)).toEqual([7_000_000]);
  });

  it("should split evenly when total is a multiple of count", () => {
    expect(NUMBER_CHUNK_EVEN(10_000_000, 7_000_000)).toEqual([5_000_000, 5_000_000]);
    expect(NUMBER_CHUNK_EVEN(14_000_000, 7_000_000)).toEqual([7_000_000, 7_000_000]);
    expect(NUMBER_CHUNK_EVEN(15_000_000, 7_000_000)).toEqual([5_000_000, 5_000_000, 5_000_000]);
  });

  it("should handle the BUDACOM case (27.23M / 7M -> 4 even chunks)", () => {
    expect(NUMBER_CHUNK_EVEN(27_230_000, 7_000_000)).toEqual([6_807_500, 6_807_500, 6_807_500, 6_807_500]);
  });

  it("should distribute remainder to the first chunks", () => {
    expect(NUMBER_CHUNK_EVEN(7_000_001, 7_000_000)).toEqual([3_500_001, 3_500_000]);
    expect(NUMBER_CHUNK_EVEN(10, 3)).toEqual([3, 3, 2, 2]);
    expect(NUMBER_CHUNK_EVEN(11, 3)).toEqual([3, 3, 3, 2]);
  });

  it("should always preserve the sum exactly", () => {
    const cases: Array<[number, number]> = [
      [27_230_000, 7_000_000],
      [10, 3],
      [11, 3],
      [7_000_001, 7_000_000],
      [99, 7],
      [1, 1_000_000],
    ];
    for (const [total, max] of cases) {
      const chunks = NUMBER_CHUNK_EVEN(total, max);
      const sum = chunks.reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(total);
      for (const chunk of chunks) {
        expect(chunk).toBeLessThanOrEqual(max);
        expect(chunk).toBeGreaterThan(0);
      }
    }
  });

  it("should support decimals", () => {
    expect(NUMBER_CHUNK_EVEN(10.5, 3, 1)).toEqual([2.7, 2.6, 2.6, 2.6]);
    expect(NUMBER_CHUNK_EVEN(100.05, 30, 2)).toEqual([25.02, 25.01, 25.01, 25.01]);
    expect(NUMBER_CHUNK_EVEN(1.5, 0.6, 4)).toEqual([0.5, 0.5, 0.5]);
  });

  it("should throw on invalid inputs", () => {
    expect(() => NUMBER_CHUNK_EVEN(0, 7_000_000)).toThrow(/total > 0/);
    expect(() => NUMBER_CHUNK_EVEN(1000, 0)).toThrow(/max > 0/);
    expect(() => NUMBER_CHUNK_EVEN(Number.NaN, 7)).toThrow(/finite/);
    expect(() => NUMBER_CHUNK_EVEN(10, 3, -1)).toThrow(/decimals/);
    expect(() => NUMBER_CHUNK_EVEN(1, 0.001, 2)).toThrow(/smallest unit/);
  });
});
