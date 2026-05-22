/** Check if value is null or undefined */
export function IS_NILL(value: unknown): value is null | undefined {
  return value === undefined || value === null;
}

/** Check if value is not null nor undefined */
export function IS_NOT_NILL<T>(value: T): value is Exclude<T, null | undefined> {
  return !IS_NILL(value);
}
