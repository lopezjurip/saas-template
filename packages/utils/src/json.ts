import { IS_STRING } from "./string";

// https://github.com/sindresorhus/is-plain-obj
export function IS_JSON(value: unknown): value is JSON {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return (
    (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  );
}

/** @deprecated Not deprecated but this function doesn't gargantee type. */
export function JSON_PARSE<T>(str: string): T | null {
  if (!str) {
    return null;
  } else if (IS_STRING(str)) {
    return JSON.parse(str as string) as T;
  } else if (IS_JSON(str)) {
    return str as T;
  } else {
    return null;
  }
}

/** @deprecated Not deprecated but this function doesn't gargantee type. */
export function JSON_PARSE_SAFE<T>(str: unknown): T | null {
  try {
    return JSON_PARSE<T>(str as any);
  } catch (err: any) {
    return null;
  }
}
