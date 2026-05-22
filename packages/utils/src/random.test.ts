import { describe, expect, it } from "vitest";
import { RANDOM_FLOAT, RANDOM_INT } from "./random";

describe("RANDOM_INT", () => {
  it("returns integer within range", () => {
    for (let i = 0; i < 100; i++) {
      const n = RANDOM_INT(1, 10);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(10);
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it("returns min when min === max", () => {
    expect(RANDOM_INT(5, 5)).toBe(5);
  });
});

describe("RANDOM_FLOAT", () => {
  it("returns float within range", () => {
    for (let i = 0; i < 100; i++) {
      const n = RANDOM_FLOAT(0, 1);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("respects custom range", () => {
    for (let i = 0; i < 100; i++) {
      const n = RANDOM_FLOAT(5, 10);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThan(10);
    }
  });
});
