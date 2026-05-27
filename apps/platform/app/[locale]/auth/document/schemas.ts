import { RUT_NORMALIZE, RUT_VALIDATE } from "@packages/utils/rut";
import { z } from "zod";

// Submitted from the triplet form. Must always carry all three fields.
export const checkDocumentSchema = z
  .object({
    address_level0_id: z.string().min(2).max(2),
    profile_identity_document_kind: z.enum(["nin", "passport"]),
    profile_identity_document_value: z.string().min(1).max(40),
  })
  .superRefine((vals, ctx) => {
    const country = vals.address_level0_id;
    const kind = vals.profile_identity_document_kind;
    const value = vals.profile_identity_document_value.trim();
    if (country === "CL" && kind === "nin") {
      if (!RUT_VALIDATE(RUT_NORMALIZE(value))) {
        ctx.addIssue({
          code: "custom",
          path: ["profile_identity_document_value"],
          message: "RUT inválido (verifica el dígito verificador)",
        });
      }
    } else {
      const cleaned = value.replace(/[^0-9a-zA-Z]/g, "");
      if (cleaned.length < 4 || cleaned.length > 32) {
        ctx.addIssue({
          code: "custom",
          path: ["profile_identity_document_value"],
          message: "El documento debe tener entre 4 y 32 caracteres",
        });
      }
    }
  });

export type CheckDocumentValues = z.infer<typeof checkDocumentSchema>;

export const verifyLoginOtpSchema = z.object({
  address_level0_id: z.string().min(2).max(2),
  profile_identity_document_kind: z.enum(["nin", "passport"]),
  profile_identity_document_value: z.string().min(1).max(40),
  channel: z.enum(["sms", "email"]),
  contact: z.string().min(1),
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});
export type VerifyLoginOtpValues = z.infer<typeof verifyLoginOtpSchema>;
