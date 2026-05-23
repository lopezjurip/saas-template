import type { infer as ZodInfer, ZodType } from "zod";

export function JWT_ENCODE(payload: unknown): string {
  const segment = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `header.${segment}.signature`;
}

export function JWT_DECODE<T = unknown>(token: string): T | null {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const padded = segment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(segment.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function JWT_DECODE_ZOD<T extends ZodType>(token: string, schema: T): ZodInfer<T> | null {
  const raw = JWT_DECODE(token);
  if (raw === null) return null;
  const result = schema.safeParse(raw);
  return result.success ? result.data : null;
}
