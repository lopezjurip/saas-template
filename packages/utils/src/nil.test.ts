import { describe, expect, it } from "vitest";
import { IS_NILL, IS_NOT_NILL } from "./nil";

describe("IS_NILL", () => {
  it("should detect nullish values", () => {
    expect(IS_NILL(undefined)).toBe(true);
    expect(IS_NILL(null)).toBe(true);
    expect(IS_NILL(0)).toBe(false);
    expect(IS_NILL("")).toBe(false);
  });
});

describe("IS_NOT_NILL", () => {
  it("should narrow non-nullish values", () => {
    const values = [0, "", false, null, undefined];
    const filtered = values.filter(IS_NOT_NILL);
    expect(filtered).toEqual([0, "", false]);
  });
});
