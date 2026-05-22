// do nothing (Simpsons meme reference)
export function NOOP() {}

/**
 * This is the recommended way to check if a variable is a function.
 */
export function IS_FUNCTION(fn: unknown): fn is Function {
  return typeof fn === "function";
}
