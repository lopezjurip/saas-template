import { SLUG_REGEX } from "@packages/utils/slug";
import { z } from "zod";

// Slug-shape validation runs client-side (UX); the reserved-slug check is enforced
// by the DB via `internal.reserved_slug_validate()` (see schema.sql + seed.sql).
// The INSERT raises a check_violation if the slug is reserved — `actionCreateTenant`
// maps that to "Ese identificador está reservado".
export const createTenantSchema = z.object({
  tenant_name: z.string().min(1, "Ingresa el nombre de tu empresa").max(256),
  tenant_slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(SLUG_REGEX, "Sólo minúsculas, números y guiones"),
});

export type CreateTenantValues = z.infer<typeof createTenantSchema>;
