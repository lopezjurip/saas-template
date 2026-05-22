import { describe, expect, it } from "vitest";
import { MILLISECONDS } from "./time";

describe("MILLISECONDS", () => {
  it("should convert '1s' to 1000", () => {
    expect(MILLISECONDS("1s")).toBe(1000);
  });

  it("should convert '1 minute' to 60000", () => {
    expect(MILLISECONDS("1 minute")).toBe(60000);
  });

  it("should throw an error for invalid input", () => {
    // @ts-expect-error
    expect(() => MILLISECONDS("invalid")).toThrowError();
  });

  // test negative values
  it("should convert '-1s' to -1000", () => {
    expect(MILLISECONDS("-1s")).toBe(-1000);
  });
});
