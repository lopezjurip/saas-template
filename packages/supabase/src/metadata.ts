import { z } from "zod";

export const AppMetadataSchema = z.object({
  tenants: z.array(z.object({ id: z.number(), slug: z.string() })).optional(),
  organizations: z.array(z.object({ id: z.number(), tenant_id: z.number() })).optional(),
  is_concierge: z.boolean().optional(),
  onboarded: z.boolean().optional(),
});

export type AppMetadata = z.infer<typeof AppMetadataSchema>;
