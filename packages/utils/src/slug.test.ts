import { describe, expect, it } from "vitest";
import { SLUG_REGEX } from "./slug";

describe("SLUG_REGEX", () => {
  describe("valid slugs", () => {
    it("accepts a single lowercase letter", () => {
      expect(SLUG_REGEX.test("a")).toBe(true);
    });

    it("accepts minimum 3-char slug", () => {
      expect(SLUG_REGEX.test("abc")).toBe(true);
    });

    it("accepts slug with hyphens in the middle", () => {
      expect(SLUG_REGEX.test("my-company")).toBe(true);
      expect(SLUG_REGEX.test("my-great-company")).toBe(true);
    });

    it("accepts slug with numbers", () => {
      expect(SLUG_REGEX.test("company123")).toBe(true);
      expect(SLUG_REGEX.test("123company")).toBe(true);
    });

    it("accepts maximum 40-char slug", () => {
      // 1 + 38 + 1 = 40 chars
      expect(SLUG_REGEX.test(`a${"b".repeat(38)}c`)).toBe(true);
    });
  });

  describe("invalid slugs", () => {
    it("rejects empty string", () => {
      expect(SLUG_REGEX.test("")).toBe(false);
    });

    it("rejects 2-char slugs (gap between 1 and 3)", () => {
      expect(SLUG_REGEX.test("ab")).toBe(false);
    });

    it("rejects slugs starting with a hyphen", () => {
      expect(SLUG_REGEX.test("-start")).toBe(false);
    });

    it("rejects slugs ending with a hyphen", () => {
      expect(SLUG_REGEX.test("end-")).toBe(false);
    });

    it("rejects uppercase letters", () => {
      expect(SLUG_REGEX.test("UPPER")).toBe(false);
      expect(SLUG_REGEX.test("MyCompany")).toBe(false);
    });

    it("rejects spaces", () => {
      expect(SLUG_REGEX.test("has space")).toBe(false);
    });

    it("rejects special characters", () => {
      expect(SLUG_REGEX.test("has.dot")).toBe(false);
      expect(SLUG_REGEX.test("under_score")).toBe(false);
      expect(SLUG_REGEX.test("slàsh")).toBe(false);
    });

    it("rejects slugs longer than 40 chars", () => {
      expect(SLUG_REGEX.test("a".repeat(41))).toBe(false);
    });
  });
});
