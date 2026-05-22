import { SLUG_REGEX } from "@packages/utils/slug";
import { z } from "zod";

export const createTenantSchema = z.object({
  tenant_name: z.string().min(1, "Ingresa el nombre de tu empresa").max(256),
  tenant_slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(SLUG_REGEX, "Sólo minúsculas, números y guiones"),
});

export type CreateTenantValues = z.infer<typeof createTenantSchema>;
