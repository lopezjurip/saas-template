import { z } from "zod";

export const sendOtpSchema = z
  .object({
    invitation_token: z.string().min(8).max(256),
    full_name: z.string().min(2, "Ingresa tu nombre completo").max(256),
    channel: z.enum(["sms", "email"]),
    phone: z
      .string()
      .transform((v) => v.replace(/[\s\-().]/g, ""))
      .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Usa formato internacional, e.g. +56 9 90511003"))
      .optional()
      .or(z.literal("")),
    email: z.email("Correo inválido").optional().or(z.literal("")),
  })
  .superRefine((vals, ctx) => {
    if (vals.channel === "sms" && !vals.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Ingresa tu teléfono" });
    }
    if (vals.channel === "email" && !vals.email) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Ingresa tu correo" });
    }
  });

export type SendOtpValues = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  invitation_token: z.string().min(8).max(256),
  channel: z.enum(["sms", "email"]),
  contact: z.string().min(1),
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
