import { z } from "zod";

export const normalizedPhone = z
  .string()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Usa formato internacional, e.g. +56 9 90511003"));

export const sendOtpSchema = z.object({ phone: normalizedPhone });
export type SendOtpValues = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  phone: normalizedPhone,
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
