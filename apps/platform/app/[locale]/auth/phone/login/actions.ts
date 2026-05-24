"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { action } from "~/lib/safe-action";
import { sendOtpSchema, verifyOtpSchema } from "./schemas";

const log = debug("auth:phone:login");

export const sendLoginOtp = action.inputSchema(sendOtpSchema).action(async ({ parsedInput: { phone } }) => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: false },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("not found") || msg.includes("signups not allowed")) {
      log.info("login attempt for unknown phone", { phone });
      throw new Error("No encontramos una cuenta con ese teléfono.");
    }
    if (msg.includes("sms") || msg.includes("provider")) {
      log.warn("SMS provider not configured", { phone, error });
      throw new Error("El servicio de SMS no está configurado.");
    }
    log.error("login OTP send failed", { phone, error });
    throw new Error("No pudimos enviar el código. Intenta de nuevo.");
  }

  log.info("login OTP sent", { phone });
  return { phone };
});

export const verifyLoginOtp = action.inputSchema(verifyOtpSchema).action(async ({ parsedInput }) => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "sms",
    phone: parsedInput.phone,
    token: parsedInput.token,
  });

  if (error) {
    log.info("login OTP rejected", { phone: parsedInput.phone, reason: error.message });
    throw new Error("Código incorrecto o expirado");
  }

  log.info("phone login succeeded", { phone: parsedInput.phone });
  const locale = await getServerLocale();
  redirect(`/${locale}/dashboard`);
});
