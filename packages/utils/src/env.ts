import { IS_NILL } from "@packages/utils/nil";

/**
 * Strictly require and env var.
 */
export function ENV(key: string): string {
  const value = process.env[key];
  if (IS_NILL(value)) {
    throw new Error(`[ENV] missing required env var: "${key}"`);
  }
  return value;
}
