import { notFound, redirect, unauthorized } from "next/navigation";
import type { z } from "zod";

type OnFailure = "notFound" | "redirect" | "unauthorized";

/**
 * Parses route params with a Zod schema and triggers a Next.js navigation response on failure.
 *
 * @example
 * const { organization_id } = assertParams(
 *   await props.params,
 *   z.object({ organization_id: z.coerce.number().int().positive() }),
 *   "notFound",
 * );
 */
export function assertParams<S extends z.ZodTypeAny>(params: unknown, schema: S, on: "notFound"): z.infer<S>;
export function assertParams<S extends z.ZodTypeAny>(params: unknown, schema: S, on: "unauthorized"): z.infer<S>;
export function assertParams<S extends z.ZodTypeAny>(
  params: unknown,
  schema: S,
  on: "redirect",
  to: string,
): z.infer<S>;
export function assertParams<S extends z.ZodTypeAny>(
  params: unknown,
  schema: S,
  on: OnFailure,
  to?: string,
): z.infer<S> {
  const result = schema.safeParse(params);
  if (!result.success) {
    if (on === "notFound") notFound();
    if (on === "unauthorized") unauthorized();
    if (on === "redirect") {
      // @ts-expect-error: route strong typed.
      redirect(to);
    }
  }
  return result.data!;
}
