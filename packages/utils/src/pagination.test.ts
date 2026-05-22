import { describe, expect, it } from "vitest";
import { PAGINATION } from "./pagination";

describe("PAGINATION", () => {
  it("should calculate from/to range for first page", () => {
    expect(PAGINATION(0, 20)).toEqual([0, 19]);
  });

  it("should calculate from/to range for later pages", () => {
    expect(PAGINATION(2, 10)).toEqual([20, 29]);
  });
});
