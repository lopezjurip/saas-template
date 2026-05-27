import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const magicLinkSchema = z.object({
  email: z.email("Correo inválido"),
});

export type MagicLinkValues = z.infer<typeof magicLinkSchema>;

export const verifyMagicOtpSchema = z.object({
  email: z.email("Correo inválido"),
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});

export type VerifyMagicOtpValues = z.infer<typeof verifyMagicOtpSchema>;
