import { describe, expect, it } from "vitest";
import { SEMVER_SATISFY } from "./semver";

describe("SEMVER_SATISFY", () => {
  it("should return true for a lower version", () => {
    expect(SEMVER_SATISFY("<1.2.3", "1.2.2")).toBe(true);
  });

  it("should return true for equal versions", () => {
    expect(SEMVER_SATISFY("<=1.2.3", "1.2.3")).toBe(true);
  });

  it("should return true for a higher version", () => {
    expect(SEMVER_SATISFY(">1.2.3", "1.3.0")).toBe(true);
  });

  it("should return true for equal versions", () => {
    expect(SEMVER_SATISFY("=1.2.3", "1.2.3")).toBe(true);
  });

  it("should return true for a higher version", () => {
    expect(SEMVER_SATISFY("^0.2.3", "0.2.5")).toBe(true);
  });

  it("[two digits] should return true for a higher version", () => {
    expect(SEMVER_SATISFY("^3.01", "3.1.0")).toBe(true);
    expect(SEMVER_SATISFY("^3.1", "3.01")).toBe(false);
  });

  it("[two digits] should return false for a lower version", () => {
    expect(SEMVER_SATISFY("<0.2", "0.2.5")).toBe(false);
  });

  it("should return false for lower version with >", () => {
    expect(SEMVER_SATISFY(">1.2.3", "1.2.2")).toBe(false);
  });

  it("should return false for higher version with <", () => {
    expect(SEMVER_SATISFY("<1.2.3", "1.2.4")).toBe(false);
  });

  it("should return true for patch bump with ^", () => {
    expect(SEMVER_SATISFY("^1.2.3", "1.2.5")).toBe(true);
  });

  it("should return false for major bump with ^", () => {
    expect(SEMVER_SATISFY("^1.2.3", "2.0.0")).toBe(false);
  });

  it("should return true for minor bump with ~", () => {
    expect(SEMVER_SATISFY("~1.2.3", "1.2.9")).toBe(true);
  });

  it("should return false for minor bump with ~", () => {
    expect(SEMVER_SATISFY("~1.2.3", "1.3.0")).toBe(false);
  });

  it("should return true for exact match with =", () => {
    expect(SEMVER_SATISFY("=2.0.0", "2.0.0")).toBe(true);
  });

  it("should return false for non-match with =", () => {
    expect(SEMVER_SATISFY("=2.0.0", "2.0.1")).toBe(false);
  });

  it("should return true for >= check", () => {
    expect(SEMVER_SATISFY(">=1.2.3", "1.2.3")).toBe(true);
  });

  it("should return false for < check", () => {
    expect(SEMVER_SATISFY("<1.0.0", "1.0.0")).toBe(false);
  });

  it("first version should be greater than second version", () => {
    expect(SEMVER_SATISFY("^1.0", "1")).toBe(true);
    expect(SEMVER_SATISFY("^1.0.0", "1")).toBe(true);
    expect(SEMVER_SATISFY("^1.0.0", "1.0")).toBe(true);
    expect(SEMVER_SATISFY("^1.0.0", "1.0.0")).toBe(true);
  });
});
