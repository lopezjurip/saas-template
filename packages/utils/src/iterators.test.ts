import { describe, expect, it } from "vitest";
import {
  AT,
  BATCH,
  CHUNK,
  EVERY,
  FIND,
  FIRST,
  INTERSECTION,
  IS_INTERSECTION,
  ITERABLE,
  LAST,
  OBJECT_PREFIX,
  REDUCE,
  SOME,
} from "./iterators";

describe("ITERABLE", () => {
  it("should return an iterable object", () => {
    const input = [1, 2, 3];
    const result = ITERABLE(input);
    expect(result[Symbol.iterator]).toBeDefined();
    expect(Array.from(result)).toEqual(input);
  });

  it("should return an iterable object for empty array", () => {
    const input: number[] = [];
    const result = ITERABLE(input);
    expect(result[Symbol.iterator]).toBeDefined();
    expect(Array.from(result)).toEqual(input);
  });

  it("should work with idempotency", () => {
    const array = [1, 2, 3];
    expect(Array.from(ITERABLE(array))).toEqual([1, 2, 3]);
    expect(Array.from(ITERABLE(ITERABLE(array)))).toEqual([1, 2, 3]);
  });
});

describe("BATCH", () => {
  it("should yield correct batches for given input", () => {
    const input = ITERABLE([1, 2, 3, 4, 5]);
    const size = 2;
    const result = Array.from(BATCH(input, size));
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should respect the limit parameter", () => {
    const input = ITERABLE([1, 2, 3, 4, 5, 6]);
    const size = 2;
    const limit = 2;
    const result = Array.from(BATCH(input, size, limit));
    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("should handle size being 0", () => {
    const input = ITERABLE([1, 2, 3]);
    const size = 0;
    const result = Array.from(BATCH(input, size));
    expect(result).toEqual([]);
  });

  it("should handle limit being 0", () => {
    const input = ITERABLE([1, 2, 3]);
    const size = 2;
    const limit = 0;
    const result = Array.from(BATCH(input, size, limit));
    expect(result).toEqual([]);
  });

  it("should yield remaining items as the last batch", () => {
    const input = ITERABLE([1, 2, 3, 4, 5]);
    const size = 3;
    const result = Array.from(BATCH(input, size));
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });
});

describe("OBJECT_PREFIX", () => {
  it("should prefix all keys in the object", () => {
    const input = { a: 1, b: 2, c: 3 };
    const prefix = "x_";
    const result = OBJECT_PREFIX(input, prefix);
    expect(result).toEqual({ x_a: 1, x_b: 2, x_c: 3 });
  });

  it("should handle empty object", () => {
    const input = {};
    const prefix = "x_";
    const result = OBJECT_PREFIX(input, prefix);
    expect(result).toEqual({});
  });

  it("should handle empty prefix", () => {
    const input = { a: 1, b: 2, c: 3 };
    const prefix = "";
    const result = OBJECT_PREFIX(input, prefix);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
});

describe("CHUNK", () => {
  it("should correctly divide array into chunks based on slices array", () => {
    const array = [1, 2, 3, 4, 5, 6];
    const slices = [2, 3, 1];
    const result = Array.from(CHUNK(array, slices));
    expect(result).toEqual([[1, 2], [3, 4, 5], [6]]);
  });

  it("should fill missing items with fillFallback when array is shorter than total slices", () => {
    const array = [1, 2, 3];
    const slices = [2, 2, 2];
    const fillFallback = 0;
    const result = Array.from(CHUNK(array, slices, fillFallback));
    expect(result).toEqual([
      [1, 2],
      [3, 0],
      [0, 0],
    ]);
  });

  it("should not fill missing items if fillFallback is not provided", () => {
    const array = [1, 2, 3, 4];
    const slices = [2, 3];
    const result = Array.from(CHUNK(array, slices));
    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("should handle empty array input", () => {
    const array: number[] = [];
    const slices = [2, 2];
    const fillFallback = 0;
    const result = Array.from(CHUNK(array, slices, fillFallback));
    expect(result).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  it("should handle slices array with zeros", () => {
    const array = [1, 2, 3, 4];
    const slices = [0, 2, 0, 2];
    const result = Array.from(CHUNK(array, slices));
    expect(result).toEqual([[], [1, 2], [], [3, 4]]);
  });
});

describe("EVERY", () => {
  it("should return true if every element passes the test", () => {
    const result = EVERY([1, 2, 3], (value) => value < 4);
    expect(result).toBe(true);
  });

  it("should return false if any element fails the test", () => {
    const result = EVERY([1, 2, 3], (value) => value < 3);
    expect(result).toBe(false);
  });
});

describe("SOME", () => {
  it("should return true if any element passes the test", () => {
    const result = SOME([1, 2, 3], (value) => value === 2);
    expect(result).toBe(true);
  });

  it("should return false if no elements pass the test", () => {
    const result = SOME([1, 2, 3], (value) => value === 4);
    expect(result).toBe(false);
  });
});

describe("INTERSECTION", () => {
  it("should yield intersection of two iterables based on custom comparison", () => {
    const arrayA = [1, 2, 3];
    const arrayB = [2, 3, 4];
    const result = Array.from(INTERSECTION(arrayA, arrayB, (a, b) => a === b));
    expect(result).toEqual([2, 3]);
  });

  it("should yield an empty array if there is no intersection", () => {
    const arrayA = [1, 2, 3];
    const arrayB = [4, 5, 6];
    const result = Array.from(INTERSECTION(arrayA, arrayB, (a, b) => a === b));
    expect(result).toEqual([]);
  });
});

describe("IS_INTERSECTION", () => {
  it("should return true if there is at least one intersection", () => {
    const arrayA = [1, 2, 3];
    const arrayB = [3, 4, 5];
    const result = IS_INTERSECTION(arrayA, arrayB, (a, b) => a === b);
    expect(result).toBe(true);
  });

  it("should return false if there is no intersection", () => {
    const arrayA = [1, 2, 3];
    const arrayB = [4, 5, 6];
    const result = IS_INTERSECTION(arrayA, arrayB, (a, b) => a === b);
    expect(result).toBe(false);
  });
});

describe("FIND", () => {
  it("should find the first item that satisfies the condition", () => {
    const result = FIND(ITERABLE([1, 2, 3, 4, 5]), (value) => value > 2);
    expect(result).toBe(3);
  });

  it("should return undefined if no item satisfies the condition", () => {
    const result = FIND(ITERABLE([1, 2, 3, 4, 5]), (value) => value > 5);
    expect(result).toBeUndefined();
  });
});

describe("REDUCE", () => {
  it("should reduce the iterable correctly with an initial value", () => {
    const result = REDUCE(ITERABLE([1, 2, 3, 4, 5]), (acc, curr) => acc + curr, 0);
    expect(result).toBe(15);
  });

  it("should work with an initial value of a different type", () => {
    const result = REDUCE(ITERABLE([1, 2, 3, 4, 5]), (acc, curr) => acc + curr.toString(), "");
    expect(result).toBe("12345");
  });
});

describe("AT", () => {
  it("should return the item at the specified position", () => {
    const result = AT(ITERABLE([1, 2, 3, 4, 5]), 2);
    expect(result).toBe(3);
  });

  it("should return undefined if the position is out of bounds", () => {
    const result = AT(ITERABLE([1, 2, 3, 4, 5]), 10);
    expect(result).toBeUndefined();
  });
});

describe("FIRST", () => {
  it("should return the first item of the iterable", () => {
    const result = FIRST(ITERABLE([1, 2, 3, 4, 5]));
    expect(result).toBe(1);
  });

  it("should return undefined for an empty iterable", () => {
    function* EMPTY_ITERABLE() {}
    const result = FIRST(EMPTY_ITERABLE());
    expect(result).toBeUndefined();
  });
});

describe("LAST", () => {
  it("should return the last item of the iterable", () => {
    const result = LAST(ITERABLE([1, 2, 3, 4, 5]));
    expect(result).toBe(5);
  });

  it("should return undefined for an empty iterable", () => {
    function* EMPTY_ITERABLE() {}
    const result = LAST(EMPTY_ITERABLE());
    expect(result).toBeUndefined();
  });
});
