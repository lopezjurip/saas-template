import { describe, expect, it } from "vitest";
import { REGEX_CREDIT_CARD } from "./regex";

describe("REGEX_CREDIT_CARD", () => {
  it("should match valid credit card numbers", () => {
    expect(REGEX_CREDIT_CARD.test("1234-5678-1234-5678")).toBe(true);
    expect(REGEX_CREDIT_CARD.test("1234 5678 1234 5678")).toBe(true);
    expect(REGEX_CREDIT_CARD.test("1234567812345678")).toBe(true);
  });

  it("should not match invalid credit card numbers", () => {
    expect(REGEX_CREDIT_CARD.test("1234-5678-1234-567")).toBe(false);
    expect(REGEX_CREDIT_CARD.test("1234-5678-1234-56789")).toBe(false);
    expect(REGEX_CREDIT_CARD.test("1234 5678 1234 567")).toBe(false);
    expect(REGEX_CREDIT_CARD.test("1234 5678 1234 56789")).toBe(false);
    expect(REGEX_CREDIT_CARD.test("abcd-efgh-ijkl-mnop")).toBe(false);
  });
});
