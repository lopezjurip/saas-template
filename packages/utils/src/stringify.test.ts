import { describe, expect, it } from "vitest";
import { STRINGIFY_STABLE } from "./stringify";

describe("STRINGIFY_STABLE", () => {
  it("should stringify objects consistently", () => {
    const obj = { b: 2, a: 1 };
    expect(STRINGIFY_STABLE(obj)).toBe('{"a":1,"b":2}');
  });
});

it("should return the same string for the same object", () => {
  const obj = { b: 2, a: 1 };
  expect(STRINGIFY_STABLE(obj)).toBe(STRINGIFY_STABLE(obj));
});

it("should handle nested objects", () => {
  const obj = { a: { b: 2 }, c: 3 };
  expect(STRINGIFY_STABLE(obj)).toBe('{"a":{"b":2},"c":3}');
});

it("should return the same string for the same object even if different order", () => {
  const obj1 = { b: 2, a: 1 };
  const obj2 = { a: 1, b: 2 };
  expect(STRINGIFY_STABLE(obj1)).toBe(STRINGIFY_STABLE(obj2));
});
