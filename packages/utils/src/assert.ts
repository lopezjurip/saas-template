import { IS_NOT_NILL } from "./nil";
import { FORMAT } from "./string";
import { IS_EMAIL } from "./url";

/**
 * Same as `assert.ok` from "node:assert", reimplemented so it works on non-node environments.
 * This function throws an Error when the provided value is falsy (for example: false, 0, '', null, undefined, NaN).
 *
 * @example
 * function process(input?: string) {
 *   ASSERT(input, "input is required");
 *   // From here on, `input` is treated as a truthy string by TypeScript.
 *   console.log(input.length);
 * }
 */
export function ASSERT(value: unknown, message?: string, ...params: any[]): asserts value {
  if (!value) {
    throw new Error(message ? FORMAT(message, ...params) : "Assertion failed");
  }
}

/**
 * @example
 * // Instead of:
 * ASSERT(socio.nombre);
 * const partner = {
 *   name: socio.nombre,
 *   ...
 * };
 *
 * // Use:
 * const partner = {
 *   name: ASSERT_NOT_NIL(socio.nombre),
 *   ...
 * };
 */
export function ASSERT_NOT_NIL<T>(value: T, message?: string, ...params: any[]): Exclude<T, null | undefined> {
  ASSERT(IS_NOT_NILL(value), message, ...params);
  return value;
}

/**
 * Asserts that the provided value is one of the supported SPA currencies: "CLP", "USD", or "EUR".
 */
export function ASSERT_SPA_CURRENCY(value: unknown): asserts value is "CLP" | "USD" | "EUR" {
  if (value !== "CLP" && value !== "USD" && value !== "EUR") {
    throw new Error(`Assertion failed: Unsupported currency ${value}`);
  }
}

export function ASSERT_EMAIL(value: unknown): asserts value is string {
  if (!IS_EMAIL(value)) {
    throw new Error(`Assertion failed: Invalid email ${value}`);
  }
}
