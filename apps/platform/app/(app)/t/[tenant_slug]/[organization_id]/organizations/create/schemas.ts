import { SLUG_REGEX } from "@packages/utils/slug";
import { z } from "zod";

/**
 * Org-slug shape validation runs client-side (UX); the DB enforces the real rules via
 * `internal.slug_validate()` plus the `unique (tenant_id, organization_slug)` constraint.
 * Unlike the tenant slug, an org slug is not a subdomain, so reserved slugs don't apply.
 */
export const createOrganizationSchema = z.object({
  organization_name: z.string().min(1, "Ingresa el nombre de la organización").max(256),
  organization_slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(SLUG_REGEX, "Sólo minúsculas, números y guiones"),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
