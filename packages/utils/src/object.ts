/** TODO: type is wrong? */
export function OBJECT_PICK<T extends Record<string, any>, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K>,
  );
}

/**
 * Remove all undefined values from an object.
 */
export function OBJECT_NO_UNDEFINED<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T;
}

/**
 * Simple merge of objects. Will crash on circular references. Prefer using "lodash/merge".
 *
 * Use this if Vercel build fails with `Dynamic Code Evaluation (e. g. 'eval', 'new Function', 'WebAssembly.compile') not allowed in Edge Runtime. The error was caused by importing 'lodash.merge/index.js'`
 */
export function OBJECT_MERGE_DEEP<T1, T2>(obj1: T1, obj2: T2): T1 & T2;
export function OBJECT_MERGE_DEEP<T1, T2, T3>(obj1: T1, obj2: T2, obj3: T3): T1 & T2 & T3;
export function OBJECT_MERGE_DEEP<T1, T2, T3, T4>(obj1: T1, obj2: T2, obj3: T3, obj4: T4): T1 & T2 & T3 & T4;
export function OBJECT_MERGE_DEEP(target: any, ...sources: any) {
  const output = Object.assign({}, target);
  return OBJECT_MERGE_DEEP_INNER(output, ...sources);
}

/**
 * Internal recursive helper that deep-merges sources into target (mutates target).
 * @example
 * OBJECT_MERGE_DEEP_INNER({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
 * @see https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge/37164538
 */
function OBJECT_MERGE_DEEP_INNER(target: any, ...sources: any[]) {
  if (sources.length === 0) {
    return target;
  }
  const source = sources.shift();

  if (IS_OBJECT(target) && IS_OBJECT(source)) {
    // biome-ignore lint/complexity/noForEach: copy-paste from stackoverflow
    Object.keys(source).forEach((key) => {
      if (IS_OBJECT(source[key])) {
        if (!(key in target)) {
          Object.assign(target, { [key]: source[key] });
        } else {
          target[key] = OBJECT_MERGE_DEEP_INNER(target[key], source[key]);
        }
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }

  return OBJECT_MERGE_DEEP_INNER(target, ...sources);
}

function IS_OBJECT(item: unknown): item is Record<string, any> {
  return Boolean(item && typeof item === "object" && !Array.isArray(item));
}

/**
 * Check if a value is a plain object (not an array, not null, and has Object.prototype as its prototype).
 */
export function OBJECT_IS_PLAIN(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Expand dotted keys in an object into nested objects.
 * Example: { "a.b.c": 1 } becomes { a: { b: { c: 1 } } }
 */
export function OBJECT_EXPAND_DOTTED_KEYS(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key.includes(".")) {
      const segments = key.split(".");
      let cursor = result;

      segments.forEach((seg, index) => {
        if (index === segments.length - 1) {
          cursor[seg] = OBJECT_IS_PLAIN(value) ? OBJECT_EXPAND_DOTTED_KEYS(value as Record<string, unknown>) : value;
        } else {
          if (!OBJECT_IS_PLAIN(cursor[seg])) {
            cursor[seg] = {};
          }
          cursor = cursor[seg] as Record<string, unknown>;
        }
      });
    } else if (OBJECT_IS_PLAIN(value)) {
      result[key] = OBJECT_EXPAND_DOTTED_KEYS(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Deep merge source object into target object (mutates target).
 * This is a simpler version that mutates the target, unlike OBJECT_MERGE_DEEP which creates a new object.
 */
export function OBJECT_MERGE_DEEP_INTO(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  for (const [key, value] of Object.entries(source)) {
    if (OBJECT_IS_PLAIN(value)) {
      if (!OBJECT_IS_PLAIN(target[key])) {
        target[key] = {};
      }
      OBJECT_MERGE_DEEP_INTO(target[key] as Record<string, unknown>, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}
