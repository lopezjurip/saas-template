import { z } from "zod";

const slugRegex = /^[a-z0-9]([a-z0-9_]{1,38}[a-z0-9])?$/;

export const PERMISSION_SLUG_WILDCARD = "*";

export const permissionSlugSchema = z
  .string()
  .min(1)
  .refine((value) => value === PERMISSION_SLUG_WILDCARD || slugRegex.test(value), "Permiso inválido");

// Step 1 of the invite flow: collect the identifier only. Permissions are set on the
// follow-up edit page (`settings/members/[membership_id]/edit`) so the invitee row exists
// before the admin commits to a permission shape.
export const inviteMemberSchema = z
  .object({
    channel: z.enum(["email", "document"]),
    organization_id: z.number().int().positive(),
    invitation_email: z.string().optional().or(z.literal("")),
    address_level0_id: z.string().max(2).optional().or(z.literal("")),
    profile_identity_document_kind: z.enum(["nin", "passport"]).optional().or(z.literal("")),
    profile_identity_document_value: z.string().max(40).optional().or(z.literal("")),
  })
  .superRefine((vals, ctx) => {
    if (vals.channel === "email") {
      const raw = (vals.invitation_email || "").trim().toLowerCase();
      if (raw.length < 3 || raw.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw)) {
        ctx.addIssue({ code: "custom", path: ["invitation_email"], message: "Correo inválido" });
      }
    } else {
      if (!vals.address_level0_id || vals.address_level0_id.length !== 2) {
        ctx.addIssue({ code: "custom", path: ["address_level0_id"], message: "Selecciona un país" });
      }
      if (!vals.profile_identity_document_kind) {
        ctx.addIssue({
          code: "custom",
          path: ["profile_identity_document_kind"],
          message: "Selecciona un tipo de documento",
        });
      }
      const v = (vals.profile_identity_document_value || "").trim();
      if (v.length < 4 || v.length > 40) {
        ctx.addIssue({
          code: "custom",
          path: ["profile_identity_document_value"],
          message: "El documento debe tener entre 4 y 40 caracteres",
        });
      }
    }
  });
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;

export const cancelInvitationSchema = z.object({
  membership_id: z.number().int().positive(),
});
export type CancelInvitationValues = z.infer<typeof cancelInvitationSchema>;

export const togglePermissionSchema = z.object({
  membership_id: z.number().int().positive(),
  permission_id: permissionSlugSchema,
  granted: z.boolean(),
});
export type TogglePermissionValues = z.infer<typeof togglePermissionSchema>;

export const demoteWildcardSchema = z.object({
  membership_id: z.number().int().positive(),
});
export type DemoteWildcardValues = z.infer<typeof demoteWildcardSchema>;

export const removeMemberSchema = z.object({
  membership_id: z.number().int().positive(),
});
export type RemoveMemberValues = z.infer<typeof removeMemberSchema>;
