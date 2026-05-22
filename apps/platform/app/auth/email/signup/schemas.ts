import { z } from "zod";

export const signupSchema = z.object({
  full_name: z.string().min(2, "Ingresa tu nombre completo").max(256),
  email: z.email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type SignupValues = z.infer<typeof signupSchema>;
