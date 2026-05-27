"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { EXTRACT_DOCUMENT_TRIPLET } from "~/app/[locale]/auth/_components/document-triplet-schema";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { action } from "~/lib/safe-action";
import { sendOtpSchema, verifyOtpSchema } from "./schemas";

const log = debug("auth:phone:signup");

export const sendSignupOtp = action.inputSchema(sendOtpSchema).action(async ({ parsedInput }) => {
  const supabase = await createServerClient();
  const triplet = EXTRACT_DOCUMENT_TRIPLET(parsedInput);

  const { error } = await supabase.auth.signInWithOtp({
    phone: parsedInput.phone,
    options: {
      shouldCreateUser: true,
      data: {
        full_name: parsedInput.full_name,
        ...(triplet ? { profile_identity: triplet } : {}),
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("registered") || msg.includes("already")) {
      log.info("signup attempt for existing phone", { phone: parsedInput.phone });
      throw new Error("Ese teléfono ya tiene una cuenta. Inicia sesión.");
    }
    if (msg.includes("sms") || msg.includes("provider")) {
      log.warn("SMS provider not configured", { phone: parsedInput.phone, error });
      throw new Error("El servicio de SMS no está configurado.");
    }
    if (msg.includes("invalid") && triplet) {
      log.info("signup rejected by trigger (invalid document)", { phone: parsedInput.phone, triplet });
      throw new Error("El documento ingresado no es válido o ya pertenece a otro perfil.");
    }
    log.error("signup OTP send failed", { phone: parsedInput.phone, error });
    throw new Error("No pudimos enviar el código. Intenta de nuevo.");
  }

  log.info("signup OTP sent", { phone: parsedInput.phone, withDocument: triplet !== null });
  return { phone: parsedInput.phone };
});

export const verifySignupOtp = action.inputSchema(verifyOtpSchema).action(async ({ parsedInput }) => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "sms",
    phone: parsedInput.phone,
    token: parsedInput.token,
  });

  if (error) {
    log.info("signup OTP rejected", { phone: parsedInput.phone, reason: error.message });
    throw new Error("Código incorrecto o expirado");
  }

  log.info("phone signup verified", { phone: parsedInput.phone });
  const locale = await getServerLocale();
  redirect(`/${locale}/onboarding`);
});
