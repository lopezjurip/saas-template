/**
 * No-op function — does nothing (Simpsons meme reference).
 * @example
 * const handler = props.onClick ?? NOOP;
 */
export function NOOP() {}

/**
 * This is the recommended way to check if a variable is a function.
 */
export function IS_FUNCTION(fn: unknown): fn is Function {
  return typeof fn === "function";
}
