"use server";

import { z } from "zod";
import { debug } from "~/lib/debug";
import { authedAction } from "~/lib/safe-action";

const log = debug("onboarding:phone");

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
  .action(async ({ parsedInput: { phone }, ctx: { supabase, user } }) => {
    const { error } = await supabase.auth.updateUser({ phone });
    if (error) {
      if (error.message.toLowerCase().includes("sms")) {
        log.warn("SMS provider not configured", { profile_id: user.id, error });
        throw new Error("El servicio de SMS no está configurado. Omite por ahora.");
      }
      log.error("phone OTP send failed", { profile_id: user.id, error });
      throw new Error("No pudimos enviar el código");
    }
    log.info("phone OTP sent", { profile_id: user.id });
  });

export const verifyPhoneOtp = authedAction
  .inputSchema(verifySchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase.auth.verifyOtp({
      type: "phone_change",
      phone: parsedInput.phone,
      token: parsedInput.token,
    });
    if (error) {
      log.info("phone OTP rejected", { profile_id: user.id, reason: error.message });
      throw new Error("Código incorrecto o expirado");
    }
    // Refresh so the rotated session lands in cookies before this action's response is sent.
    const refresh = await supabase.auth.refreshSession();
    if (refresh.error) {
      log.warn("session refresh failed after phone verify", { profile_id: user.id, error: refresh.error });
    }
    log.info("phone verified", { profile_id: user.id });
  });
