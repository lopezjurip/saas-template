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
