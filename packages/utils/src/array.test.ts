import { describe, expect, it } from "vitest";
import { SINGLE } from "./array";

describe("SINGLE", () => {
  it("should return the first item of an array", () => {
    const input = [1, 2, 3];
    const result = SINGLE(input);
    expect(result).toBe(1);
  });

  it("should return the input if it's not an array", () => {
    const input = 42;
    const result = SINGLE(input);
    expect(result).toBe(42);
  });

  it("should return undefined if the input is undefined", () => {
    const input = undefined;
    const result = SINGLE(input);
    expect(result).toBeUndefined();
  });

  it("should not treat string as an array of chars", () => {
    const input = "hello";
    const result = SINGLE(input);
    expect(result).toBe("hello");
    expect(result).not.toBe("h");
  });

  it("should return undefined if the input is an empty array", () => {
    const input: boolean[] = [];
    const result = SINGLE(input);
    expect(result).toBeUndefined();
  });
});
