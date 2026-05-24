"use server";

import { z } from "zod";
import { debug } from "~/lib/debug";
import { authedAction } from "~/lib/safe-action";

const log = debug("onboarding:email");

const normalizedEmail = z
  .string()
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.email("Correo inválido"));

const emailSchema = z.object({ email: normalizedEmail });
const verifySchema = z.object({
  email: normalizedEmail,
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});

export const sendEmailOtp = authedAction
  .inputSchema(emailSchema)
  .action(async ({ parsedInput: { email }, ctx: { supabase, user } }) => {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      log.error("email OTP send failed", { profile_id: user.id, error });
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        throw new Error("Ese correo ya está en uso por otra cuenta.");
      }
      throw new Error("No pudimos enviar el código");
    }
    log.info("email OTP sent", { profile_id: user.id });
  });

export const verifyEmailOtp = authedAction
  .inputSchema(verifySchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase.auth.verifyOtp({
      type: "email_change",
      email: parsedInput.email,
      token: parsedInput.token,
    });
    if (error) {
      log.info("email OTP rejected", { profile_id: user.id, reason: error.message });
      throw new Error("Código incorrecto o expirado");
    }
    // Refresh so the rotated session lands in cookies before this action's response is sent.
    const refresh = await supabase.auth.refreshSession();
    if (refresh.error) {
      log.warn("session refresh failed after email verify", { profile_id: user.id, error: refresh.error });
    }
    log.info("email verified", { profile_id: user.id });
  });
