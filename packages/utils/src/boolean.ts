import type { Maybe } from "@packages/utils/maybe";

/**
 * TypeScript-friendly filter to remove falsy values from arrays.
 * @example
 * const filtered = [true, null, 1, 0].filter(BOOLEAN); // [true, 1]
 */
export function BOOLEAN<S>(item: Maybe<S> | false | 0 | ""): item is S {
  return Boolean(item);
}
