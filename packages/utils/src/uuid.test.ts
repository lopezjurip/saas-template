import { describe, expect, it } from "vitest";
import { UUID_FORMAT } from "./uuid";

describe("UUID_FORMAT", () => {
  it("should format UUID with first strategy", () => {
    expect(UUID_FORMAT("1234567890abcdef1234567890abcdef", { n: 8, strategy: "first", dots: true })).toBe(
      "12345678...",
    );
    expect(UUID_FORMAT("1234567890abcdef1234567890abcdef", { n: 8, strategy: "first", dots: false })).toBe("12345678");
  });

  it("should format UUID with last strategy", () => {
    expect(UUID_FORMAT("1234567890abcdef1234567890abcdef", { n: 8, strategy: "last", dots: true })).toBe("...90abcdef");
    expect(UUID_FORMAT("1234567890abcdef1234567890abcdef", { n: 8, strategy: "last", dots: false })).toBe("90abcdef");
  });

  it("should format UUID with middle strategy", () => {
    expect(UUID_FORMAT("1234567890abcdef1234567890abcdef", { n: 8, strategy: "middle", dots: true })).toBe(
      "...cdef1234...",
    );
    expect(UUID_FORMAT("1234567890abcdef1234567890abcdef", { n: 8, strategy: "middle", dots: false })).toBe("cdef1234");
  });

  it("should return original UUID if shorter than n", () => {
    expect(UUID_FORMAT("1234", { n: 8 })).toBe("1234");
  });
});
