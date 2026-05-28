"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/[locale]/auth/providers";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { authedAction, formAction } from "~/lib/safe-action";

const log = debug("account");

export const actionSignOutOtherDevices = authedAction.action(async ({ ctx: { supabase, user } }) => {
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) {
    log.error("signOut others failed", { profile_id: user.id, error });
    throw new Error("No pudimos cerrar las otras sesiones");
  }
});

const updateEmailSchema = z.object({
  email: z
    .string()
    .min(1)
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().email("Correo inválido")),
});

export const actionUpdateEmail = authedAction
  .inputSchema(updateEmailSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    if (parsedInput.email === user["email"]?.toLowerCase()) {
      throw new Error("Es tu correo actual");
    }
    const { error } = await supabase.auth.updateUser({ email: parsedInput.email });
    if (error) {
      log.error("email update failed", { profile_id: user.id, error });
      throw new Error("No pudimos actualizar el correo");
    }
    log.info("email change requested", { profile_id: user.id });
  });

const normalizedPhone = z
  .string()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Formato de teléfono inválido"));

const sendPhoneOtpSchema = z.object({ phone: normalizedPhone });
const verifyPhoneOtpSchema = z.object({
  phone: normalizedPhone,
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});

export const actionSendPhoneOtp = authedAction
  .inputSchema(sendPhoneOtpSchema)
  .action(async ({ parsedInput: { phone }, ctx: { supabase, user } }) => {
    const { error } = await supabase.auth.updateUser({ phone });
    if (error) {
      if (error.message.toLowerCase().includes("sms")) {
        log.warn("SMS provider not configured", { profile_id: user.id, error });
        throw new Error("El servicio de SMS no está configurado");
      }
      log.error("phone OTP send failed", { profile_id: user.id, error });
      throw new Error("No pudimos enviar el código");
    }
  });

export const actionVerifyPhoneOtp = authedAction
  .inputSchema(verifyPhoneOtpSchema)
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
    const refresh = await supabase.auth.refreshSession();
    if (refresh.error) {
      log.warn("session refresh failed after phone verify", { profile_id: user.id, error: refresh.error });
    }
    revalidatePath(`/${await getServerLocale()}/home/account/security`);
  });

const setPasswordSchema = z.object({ password: z.string().min(8, "Mínimo 8 caracteres") });

export const actionSetPassword = authedAction
  .inputSchema(setPasswordSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase.auth.updateUser({ password: parsedInput.password });
    if (error) {
      if (error.code === "same_password") {
        throw new Error("La nueva contraseña debe ser distinta a la actual");
      }
      log.error("password update failed", { profile_id: user.id, error });
      throw new Error("No pudimos guardar la contraseña");
    }
    const refresh = await supabase.auth.refreshSession();
    if (refresh.error) {
      log.warn("session refresh failed after password change", { profile_id: user.id, error: refresh.error });
    }
    revalidatePath(`/${await getServerLocale()}/home/account/security`);
  });

const linkProviderSchema = z.object({
  provider: z.enum(OAUTH_PROVIDER_IDS),
});

const linkProviderRun = authedAction
  .inputSchema(linkProviderSchema)
  .action(async ({ parsedInput: { provider }, ctx: { supabase, user } }) => {
    const headerList = await headers();
    const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;
    const locale = await getServerLocale();

    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${origin}/${locale}/auth/callback?next=${encodeURIComponent(`/${locale}/home/account/connections`)}`,
      },
    });

    if (error || !data?.url) {
      log.error("linkIdentity failed", { profile_id: user.id, provider, error });
      redirect(`/${locale}/home/account/connections?error=${encodeURIComponent(error?.message ?? "link_failed")}`);
    }
    redirect(data.url);
  });

export const actionLinkProvider = formAction(linkProviderRun, (fd) => {
  const provider = String(fd.get("provider") ?? "");
  if (!isOAuthProvider(provider)) {
    throw new Error("Provider desconocido");
  }
  return { provider };
});
