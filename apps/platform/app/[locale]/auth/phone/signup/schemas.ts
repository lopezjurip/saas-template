import { z } from "zod";
import { documentTripletShape, REFINE_DOCUMENT_TRIPLET } from "~/app/[locale]/auth/_components/document-triplet-schema";

// Strip whitespace, dashes, dots, parens before E.164 validation — users naturally type "+56 9 9051 1003".
export const normalizedPhone = z
  .string()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Usa formato internacional, e.g. +56 9 90511003"));

export const sendOtpSchema = z
  .object({
    phone: normalizedPhone,
    full_name: z.string().min(2, "Ingresa tu nombre completo").max(256),
    ...documentTripletShape,
  })
  .superRefine(REFINE_DOCUMENT_TRIPLET);
export type SendOtpValues = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  phone: normalizedPhone,
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
