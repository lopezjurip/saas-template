import { z } from "zod";

const slugRegex = /^[a-z0-9]([a-z0-9_]{1,38}[a-z0-9])?$/;
// Loose UUID shape — `z.string().uuid()` rejects nil-like seed IDs (version digit ≠ 1-5).
// Accept any 8-4-4-4-12 hex string and let the DB reject mismatches.
const uuidShape = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidLike = z.string().regex(uuidShape, "Identificador inválido");

export const PERMISSION_SLUG_WILDCARD = "*";

export const permissionSlugSchema = z
  .string()
  .min(1)
  .refine((value) => value === PERMISSION_SLUG_WILDCARD || slugRegex.test(value), "Permiso inválido");

export const inviteMemberSchema = z.object({
  organization_id: z.number().int().positive(),
  invitation_email: z
    .string()
    .min(3)
    .max(254)
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().email("Correo inválido")),
  invitation_permission_slugs: z.array(permissionSlugSchema).min(1, "Selecciona al menos un permiso").max(64),
});
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;

export const cancelInvitationSchema = z.object({
  invitation_id: uuidLike,
});
export type CancelInvitationValues = z.infer<typeof cancelInvitationSchema>;

export const togglePermissionSchema = z.object({
  organization_id: z.number().int().positive(),
  profile_id: uuidLike,
  permission_id: permissionSlugSchema,
  granted: z.boolean(),
});
export type TogglePermissionValues = z.infer<typeof togglePermissionSchema>;

export const demoteWildcardSchema = z.object({
  organization_id: z.number().int().positive(),
  profile_id: uuidLike,
});
export type DemoteWildcardValues = z.infer<typeof demoteWildcardSchema>;

export const removeMemberSchema = z.object({
  organization_id: z.number().int().positive(),
  profile_id: uuidLike,
});
export type RemoveMemberValues = z.infer<typeof removeMemberSchema>;
