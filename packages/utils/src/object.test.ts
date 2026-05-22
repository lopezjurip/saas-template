import { describe, expect, it } from "vitest";
import {
  OBJECT_EXPAND_DOTTED_KEYS,
  OBJECT_IS_PLAIN,
  OBJECT_MERGE_DEEP,
  OBJECT_MERGE_DEEP_INTO,
  OBJECT_NO_UNDEFINED,
  OBJECT_PICK,
} from "./object";

describe("OBJECT_PICK", () => {
  it("should pick keys from object", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const keys = ["a", "b"] as const;
    const result = OBJECT_PICK(obj, keys);
    expect(result).toEqual({ a: 1, b: 2 });
  });
});

describe("OBJECT_NO_UNDEFINED", () => {
  it("should remove undefined values from object", () => {
    const obj = { a: 1, b: undefined, c: 3 };
    const result = OBJECT_NO_UNDEFINED(obj);
    expect(result).toEqual({ a: 1, c: 3 });
  });
});

describe("OBJECT_MERGE_DEEP", () => {
  it("should deeply merge two objects", () => {
    expect(
      OBJECT_MERGE_DEEP(
        {
          sky: {
            bird: 1,
          },
          ground: {
            dog: 2,
          },
          sea: {
            fish: 3,
          },
        },
        {
          sky: {
            plane: 4,
          },
          sea: {
            fish: 300,
          },
        },
      ),
    ).toEqual({
      sky: {
        bird: 1,
        plane: 4,
      },
      ground: {
        dog: 2,
      },
      sea: {
        fish: 300,
      },
    });
  });

  it("should deeply merge three objects", () => {
    expect(OBJECT_MERGE_DEEP({ a: { b: 1, c: 2 } }, { a: { b: 10 } }, { a: { d: 3 } })).toEqual({
      a: { b: 10, c: 2, d: 3 },
    });
  });
});

describe("OBJECT_IS_PLAIN", () => {
  it("should return true for plain objects", () => {
    expect(OBJECT_IS_PLAIN({})).toBe(true);
    expect(OBJECT_IS_PLAIN({ a: 1 })).toBe(true);
    expect(OBJECT_IS_PLAIN({ a: { b: 2 } })).toBe(true);
  });

  it("should return false for non-plain objects", () => {
    expect(OBJECT_IS_PLAIN(null)).toBe(false);
    expect(OBJECT_IS_PLAIN(undefined)).toBe(false);
    expect(OBJECT_IS_PLAIN([])).toBe(false);
    expect(OBJECT_IS_PLAIN([1, 2, 3])).toBe(false);
    expect(OBJECT_IS_PLAIN("string")).toBe(false);
    expect(OBJECT_IS_PLAIN(123)).toBe(false);
    expect(OBJECT_IS_PLAIN(new Date())).toBe(false);
    expect(OBJECT_IS_PLAIN(/test/)).toBe(false);
  });
});

describe("OBJECT_EXPAND_DOTTED_KEYS", () => {
  it("should expand simple dotted keys", () => {
    expect(OBJECT_EXPAND_DOTTED_KEYS({ "a.b": 1 })).toEqual({ a: { b: 1 } });
  });

  it("should expand nested dotted keys", () => {
    expect(OBJECT_EXPAND_DOTTED_KEYS({ "a.b.c": 1 })).toEqual({ a: { b: { c: 1 } } });
  });

  it("should expand multiple dotted keys", () => {
    expect(OBJECT_EXPAND_DOTTED_KEYS({ "a.b": 1, "a.c": 2 })).toEqual({ a: { b: 1, c: 2 } });
  });

  it("should handle mixed dotted and non-dotted keys", () => {
    expect(OBJECT_EXPAND_DOTTED_KEYS({ "a.b": 1, d: 2 })).toEqual({ a: { b: 1 }, d: 2 });
  });

  it("should recursively expand nested objects", () => {
    expect(OBJECT_EXPAND_DOTTED_KEYS({ "a.b": { "c.d": 1 } })).toEqual({ a: { b: { c: { d: 1 } } } });
  });

  it("should handle empty objects", () => {
    expect(OBJECT_EXPAND_DOTTED_KEYS({})).toEqual({});
  });

  it("should handle objects without dotted keys", () => {
    expect(OBJECT_EXPAND_DOTTED_KEYS({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

describe("OBJECT_MERGE_DEEP_INTO", () => {
  it("should merge source into target", () => {
    const target = { a: { b: 1 } };
    const source = { a: { c: 2 } };
    const result = OBJECT_MERGE_DEEP_INTO(target, source);
    expect(result).toEqual({ a: { b: 1, c: 2 } });
    expect(result).toBe(target); // Should mutate target
  });

  it("should overwrite non-object values", () => {
    const target = { a: { b: 1 } };
    const source = { a: { b: 2 } };
    OBJECT_MERGE_DEEP_INTO(target, source);
    expect(target).toEqual({ a: { b: 2 } });
  });

  it("should handle nested merges", () => {
    const target = { a: { b: { c: 1 } } };
    const source = { a: { b: { d: 2 } } };
    OBJECT_MERGE_DEEP_INTO(target, source);
    expect(target).toEqual({ a: { b: { c: 1, d: 2 } } });
  });

  it("should create new objects when target key doesn't exist", () => {
    const target = { a: 1 };
    const source = { b: { c: 2 } };
    OBJECT_MERGE_DEEP_INTO(target, source);
    expect(target).toEqual({ a: 1, b: { c: 2 } });
  });
});
