"use server";

import { z } from "zod";
import { authedAction } from "~/lib/safe-action";

const normalizedPhone = z
  .string()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Formato de teléfono inválido"));

const phoneSchema = z.object({ phone: normalizedPhone });
const verifySchema = z.object({
  phone: normalizedPhone,
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});

export const sendPhoneOtp = authedAction
  .inputSchema(phoneSchema)
  .action(async ({ parsedInput: { phone }, ctx: { supabase } }) => {
    const { error } = await supabase.auth.updateUser({ phone });
    if (error) {
      if (error.message.toLowerCase().includes("sms")) {
        throw new Error("El servicio de SMS no está configurado. Omite por ahora.");
      }
      throw new Error("No pudimos enviar el código");
    }
  });

export const verifyPhoneOtp = authedAction
  .inputSchema(verifySchema)
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { error } = await supabase.auth.verifyOtp({
      type: "phone_change",
      phone: parsedInput.phone,
      token: parsedInput.token,
    });
    if (error) throw new Error("Código incorrecto o expirado");
    // Refresh so the rotated session lands in cookies before this action's response is sent.
    await supabase.auth.refreshSession();
  });
