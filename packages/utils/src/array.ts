import type { Maybe } from "@packages/utils/maybe";

export function ARRAY_CREATE<T = undefined>(length: number, content?: T): T[] {
  const array = Array.from<T>({ length }); // starts with empty array (undefined values)
  return content !== undefined ? array.fill(content) : array;
}

/** Array util with type-guard */
export function ARRAY_AT_LEAST<T>(array: Maybe<ArrayLike<T>>, count: number): array is ArrayLike<T> {
  return Boolean(array && array.length >= count);
}

/** Array util with type-guard */
export function ARRAY_NOT_EMPTY<T>(array: Maybe<ArrayLike<T>>): array is ArrayLike<T> {
  return ARRAY_AT_LEAST(array, 1);
}

export function ARRAY_IS_EMPTY<T>(array: Maybe<ArrayLike<T>>): boolean {
  return !array || array.length === 0;
}

/** Order is not guaranteed to be preserved. */
export function ARRAY_UNIQUE<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Returns a new array with the same items in random order (Fisher–Yates).
 * @example
 * const shuffled = ARRAY_SHUFFLE([1, 2, 3]);
 * @see https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
export function ARRAY_SHUFFLE<T>(array: T[]) {
  const next = array.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    // @ts-expect-error: type
    [next[i], next[rand]] = [next[rand], next[i]];
  }
  return next;
}

/**
 * If `input` is array, return first item. Otherwise return `input` (singular item becase is not an array).
 * Utility to check supabase type compiler when fails to identify single or plural relationship.
 * It's safe for strings.
 */
export function SINGLE<T>(input: Maybe<T | T[] | Set<T>>): T | undefined {
  if (input instanceof Set) {
    return input.values().next().value;
  } else if (input) {
    return Array.isArray(input) ? input[0] : input;
  } else {
    return undefined;
  }
}

export function ARRAY_IS_EQUAL<T, K>(a: T[], b: K[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function TRANSPOSE<T>(matrix: T[][]): T[][] {
  const firstRow = matrix[0];
  if (matrix.length === 0 || !firstRow) return [];
  const numCols = firstRow.length;
  const result: T[][] = [];
  for (let col = 0; col < numCols; col++) {
    const newRow: T[] = [];
    for (const row of matrix) {
      const cell = row[col];
      if (cell !== undefined) newRow.push(cell);
    }
    result.push(newRow);
  }
  return result;
}
