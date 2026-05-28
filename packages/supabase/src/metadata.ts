import { z } from "zod";

export const AppMetadataSchema = z.object({
  tenants: z.array(z.object({ id: z.number(), slug: z.string() })).optional(),
  organizations: z.array(z.object({ id: z.number(), tenant_id: z.number() })).optional(),
  agencies: z.array(z.object({ id: z.string() })).optional(),
  onboarded: z.boolean().optional(),
});

export type AppMetadata = z.infer<typeof AppMetadataSchema>;
