import { SLUG_REGEX } from "@packages/utils/slug";
import { z } from "zod";

// Slugs that would shadow first-party routes if used as a tenant_slug.
// Keep in sync with apps/platform/app/* top-level segments and any reserved subdomains.
export const RESERVED_TENANT_SLUGS = new Set<string>([
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "cdn",
  "dashboard",
  "health",
  "me",
  "notifications",
  "onboarding",
  "public",
  "static",
  "support",
  "tenants",
  "www",
  "_next",
]);

export const createTenantSchema = z.object({
  tenant_name: z.string().min(1, "Ingresa el nombre de tu empresa").max(256),
  tenant_slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(SLUG_REGEX, "Sólo minúsculas, números y guiones")
    .refine((slug) => !RESERVED_TENANT_SLUGS.has(slug), "Ese identificador está reservado"),
});

export type CreateTenantValues = z.infer<typeof createTenantSchema>;
