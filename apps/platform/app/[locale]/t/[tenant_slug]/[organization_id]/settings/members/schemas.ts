import { z } from "zod";

export const PERMISSION_SLUG_WILDCARD = "*";

// Step 1 of the invite flow: collect the identifier only. Permissions are set on the
// follow-up edit page (`settings/members/[organization_membership_id]/edit`) so the invitee row exists
// before the admin commits to a permission shape.
export const inviteMemberSchema = z
  .object({
    channel: z.enum(["email", "document", "phone"]),
    organization_id: z.number().int().positive(),
    invitation_email: z.string().optional().or(z.literal("")),
    invitation_phone: z.string().optional().or(z.literal("")),
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
    } else if (vals.channel === "phone") {
      const digits = (vals.invitation_phone || "").replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        ctx.addIssue({ code: "custom", path: ["invitation_phone"], message: "Teléfono inválido" });
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
