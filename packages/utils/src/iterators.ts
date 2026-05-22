import { BOOLEAN } from "./boolean";
import type { Maybe } from "./maybe";
import { IS_NILL } from "./nil";

// type KeyType = string | number | bigint;

export function* CONCAT<V>(...yieldables: Maybe<Iterable<V>>[]) {
  let i = 0;
  for (const yieldable of yieldables) {
    if (yieldable) {
      for (const item of yieldable) {
        yield item;
        i += 1;
      }
    }
  }
  return i; // length
}

export const ITERABLE = /*#__PURE__*/ CONCAT;

export function IDENTITY<T>(val: T): T {
  return val;
}
export function SHALLOW_COMPARE<T>(a: T, b: T): boolean {
  return a === b;
}

export function* YIELD<V>(iterable: Iterable<V>) {
  for (const item of iterable) {
    if (Array.isArray(item)) {
      yield item[1]; // is a `Map`, take value
    } else {
      yield item; // probably a `Set` or an array-like
    }
  }
}
export async function* YIELD_ASYNC<V>(iterable: Iterable<V>) {
  for await (const value of iterable) {
    if (Array.isArray(value)) {
      yield value[1]; // is a `Map`, take value
    } else {
      yield value; // probably a `Set`
    }
  }
}

export function EVERY<T>(iterable: Iterable<T>, fn: (value: T, index: number, obj: Iterable<T>) => any): boolean {
  // type fn = Parameters<Array<T>["every"]>[0]
  let i = 0;
  for (const iterator of iterable) {
    if (!fn(iterator, i, iterable)) {
      return false;
    }
    i += 1;
  }
  return true;
}
export function SOME<T>(iterable: Iterable<T>, fn: (value: T, index: number, obj: Iterable<T>) => any): boolean {
  // type fn = Parameters<Array<T>["some"]>[0]
  let i = 0;
  for (const iterator of iterable) {
    if (fn(iterator, i, iterable)) {
      return true;
    }
    i += 1;
  }
  return false;
}

export function* INTERSECTION<T>(
  iterableA: Iterable<T>,
  iterableB: Iterable<T>,
  fn: (a: T, b: T) => any = SHALLOW_COMPARE,
) {
  // type fn = Parameters<Array<T>["every"]>[0]
  let intersected = false;
  let i = 0;
  for (const iteratorA of iterableA) {
    let j = 0;
    for (const iteratorB of iterableB) {
      if (fn(iteratorA, iteratorB)) {
        intersected = true;
        yield iteratorA;
      }
      j += 1;
    }
    i += 1;
  }
  return intersected;
}

export function IS_INTERSECTION<T>(
  iterableA: Iterable<T>,
  iterableB: Iterable<T>,
  fn: (a: T, b: T) => any = SHALLOW_COMPARE,
): boolean {
  // type fn = Parameters<Array<T>["every"]>[0]
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of INTERSECTION(iterableA, iterableB, fn)) {
    return true;
  }
  return false;
}

// TODO: not optimal
export function* NOT_IN<T>(iterableA: Iterable<T>, iterableB: Iterable<T>, fn: (a: T, b: T) => any = SHALLOW_COMPARE) {
  // type fn = Parameters<Array<T>["every"]>[0]
  let exclusive = false;
  let i = 0;
  for (const iteratorA of iterableA) {
    const notPresent = EVERY(iterableB, (iteratorB) => !fn(iteratorA, iteratorB));
    if (notPresent) {
      exclusive = true;
      yield iteratorA;
      i += 1;
    }
  }
  return exclusive;
}

export function FIND<T>(
  iterable: Iterable<T>,
  fn: (value: T, index: number, iterable: Iterable<T>) => unknown,
): T | undefined {
  // type fn = Parameters<Array<T>["find"]>[0]
  let i = 0;
  for (const iterator of iterable) {
    if (fn(iterator, i, iterable)) {
      return iterator;
    }
    i += 1;
  }
  return undefined;
}

/** TODO: Missing implementation with missing initialValue */
export function REDUCE<T, U>(
  iterable: Iterable<T>,
  fn: (previousValue: U, currentValue: T, currentIndex: number, iterable: Iterable<T>) => U,
  initialValue: U,
): U {
  // type fn = Parameters<Array<T>["reduce"]>[0];
  let i = 0;
  let value = initialValue;
  for (const iterator of iterable) {
    value = fn(value, iterator, i, iterable);
    i += 1;
  }
  return value;
}

/** When no second argument it takes first element. */
export function AT<V>(iterable: Iterable<V>, position = 0): V | undefined {
  let index = 0;
  for (const item of iterable) {
    if (index === position) {
      return item;
    }
    index += 1;
  }
  return undefined;
}

export function FIRST<V>(iterable: Iterable<V>): V | undefined {
  return AT(iterable, 0);
}
export function LAST<V>(iterable: Iterable<V>): V | undefined {
  let value: V | undefined;
  for (const item of iterable) {
    value = item;
  }
  return value;
}

export function* TRANSFORM<V, N>(yieldable: Iterable<V>, fn: (value: V, index: number, obj: Iterable<V>) => N) {
  let i = 0;
  for (const item of yieldable) {
    const next = fn(item, i, yieldable);
    yield next;
    i += 1;
  }
  return i; // length
}

export function* FILTER<V>(
  yieldable: Iterable<V>,
  fn: (value: V, index: number, obj: Iterable<V>) => any = BOOLEAN<V>,
) {
  let i = 0;
  for (const item of yieldable) {
    if (fn(item, i, yieldable)) {
      yield item;
    }
    i += 1;
  }
  return i; // length
}

export function* TAKE<V>(yieldable: Iterable<V>, limit: number) {
  let i = 0;
  for (const item of yieldable) {
    if (i < limit) {
      yield item;
    } else {
      break;
    }
    i += 1;
  }
  return i; // length
}

export function* SKIP<V>(yieldable: Iterable<V>, number: number) {
  let i = 0;
  for (const item of yieldable) {
    if (i >= number) {
      yield item;
    }
    i += 1;
  }
  return i; // length
}

/**
 * @example
 * for (const [i, item] of ENUMERATE(["a", "b", "c"])) {
 *   console.log(i, item);
 * }
 */
export function* ENUMERATE<V>(yieldable: Iterable<V>) {
  let i = 0;
  for (const item of yieldable) {
    yield [i, item] as const;
    i += 1;
  }
  return i; // length
}

export function COUNT<V>(yieldable: Iterable<V>): number {
  let i = 0;
  for (const _ of yieldable) {
    i += 1;
  }
  return i;
}

export const ARRAY = /*#__PURE__*/ Array.from; // TODO: Array.from.bind(Array); ?

// export function ARRAY<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[] {
//   return Array.from(iterable, mapfn, thisArg);
// }

export function IS_GT<V extends number | bigint>(a: V, b: V): boolean {
  return a > b;
}
export function IS_LT<V extends number | bigint>(a: V, b: V): boolean {
  return a < b;
}
export function IS_GTE<V extends number | bigint>(a: V, b: V): boolean {
  return a >= b;
}
export function IS_LTE<V extends number | bigint>(a: V, b: V): boolean {
  return a <= b;
}

/**
 * Use this to implement MAX or MIN function.
 */
export function* MOST<T>(iterable: Iterable<T>, compare: (a: T, b: T) => boolean) {
  let result: T | undefined;
  for (const item of iterable) {
    if (result === undefined || compare(item, result)) {
      result = item;
    }
  }
  yield result;
}

/** Batch iterator */
export async function* ASYNC_BATCH<T = unknown, TReturn = any>(
  gen: Generator<T, TReturn> | AsyncGenerator<T, TReturn>,
  size: number,
  limit?: Maybe<number>,
) {
  let i = 0;
  if (limit === 0 || size === 0) {
    return i;
  }

  let batch: T[] = [];
  for await (const iterator of gen) {
    batch.push(iterator);
    if (batch.length === size) {
      yield batch;
      batch = [];
      i += 1;
      if (limit === i) {
        return i;
      }
    }
  }
  // flush remaining
  if (batch.length > 0) {
    yield batch;
  }
  return i;
}

/**
 * Batch iterator
 * @example
 * const size = 2;
 * for (const batch of BATCH([1, 2, 3, 4, 5], size)) {
 *   console.log(batch); // [1, 2], [3, 4], [5]
 * }
 */
export function* BATCH<T = unknown>(gen: Iterable<T>, size: number, limit?: Maybe<number>) {
  let i = 0;
  if (limit === 0 || size === 0) {
    return i;
  }

  let batch: T[] = [];
  for (const iterator of gen) {
    batch.push(iterator);
    if (batch.length === size) {
      yield batch;
      batch = [];
      i += 1;
      if (limit === i) {
        return i;
      }
    }
  }
  // flush remaining
  if (batch.length > 0) {
    yield batch;
  }
  return i;
}

/**
 * @example
 * const [set, setSet] = useState<Set<string>>(INITIAL_SET);
 */
export function INITIAL_SET<T>(): Set<T> {
  return new Set<T>();
}

export function COMPARE_SETS<T>(a: Set<T>, b: Set<T>) {
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}

type ObjectEntry<T> = {
  [K in keyof T]: readonly [K, T[K]];
}[keyof T];
export function* OBJECT_ENTRIES<T extends {}>(...objects: T[]) {
  for (const object of objects) {
    for (const pair of Object.entries(object)) {
      // @ts-expect-error: Expect error
      yield pair as NonNullable<ObjectEntry<T>>;
    }
  }
}

type ObjectEntryKV<T> = {
  [K in keyof T]: { key: K; value: T[K] };
}[keyof T];
export function* OBJECT_ENTRIES_KV<T extends {}>(...objects: T[]) {
  for (const object of objects) {
    for (const [key, value] of Object.entries(object)) {
      yield { key, value } as NonNullable<ObjectEntryKV<T>>;
    }
  }
}

export function* OBJECT_KEYS<T extends {}>(...objects: T[]) {
  for (const object of objects) {
    for (const [key] of Object.entries(object)) {
      yield key as keyof T;
    }
  }
}

export function* OBJECT_VALUES<T extends {}>(...objects: T[]) {
  for (const object of objects) {
    for (const [, value] of Object.entries(object)) {
      yield value as T[keyof T];
    }
  }
}

/**
 * @example
 * const prefixed = OBJECT_PREFIX({ a: 1, b: 2 }, "data-");
 */
export function OBJECT_PREFIX<T extends {}>(object: T, prefix: string): T {
  const result = {} as T;
  for (const [key, value] of OBJECT_ENTRIES(object)) {
    result[`${prefix}${key as string}` as keyof T] = value;
  }
  return result;
}

/** For Relay-like collections (GraphQL) */
export function* ITER_EDGES<T>(edges: Maybe<{ node: T }[]>) {
  if (edges) {
    for (const edge of edges) {
      yield edge["node"];
    }
  }
}

/**
 * Chunks an array into multiple slices of specified sizes.
 * @example
 * // make two chunks of 2 and 3 elements respectively.
 * for (const chunk of CHUNK([1, 2, 3, 4, 5], [2, 3])) {
 *   console.log(chunk); // [1, 2], [3, 4, 5]
 * }
 */
export function* CHUNK<T>(array: T[], slices: number[], fillFallback?: T) {
  let i = 0;
  for (const slice of slices) {
    const chunk: T[] = [];
    for (let index = 0; index < slice; index++) {
      const item = array[i];
      if (item) {
        chunk.push(item);
      } else if (fillFallback !== undefined) {
        chunk.push(fillFallback);
      }
      i += 1;
    }
    yield chunk;
  }
}

/** When you are not sure if input value is an array or a single value use this function to force an array. */
export function ARRAY_FORCED<T>(singleOrArray: T | T[] | null | undefined): T[] {
  if (Array.isArray(singleOrArray)) {
    return singleOrArray;
  } else if (!IS_NILL(singleOrArray)) {
    return [singleOrArray];
  } else {
    return [];
  }
}

/**
 * Make an iterable range of numbers with optional step (default is 1).
 * @example
 * for (const i of RANGE(0, 10)) {
 *  console.log(i); // 0...9
 * }
 */
export function* RANGE(start: number, end: number, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}
