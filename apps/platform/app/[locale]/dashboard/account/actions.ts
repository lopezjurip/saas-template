"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action";

const log = debug("account");

const updateNameSchema = z.object({
  full_name: z.string().min(2, "Mínimo 2 caracteres").max(256),
});

export const actionUpdateName = authedAction
  .inputSchema(updateNameSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase
      .from("profiles")
      .update({ profile_name_full: parsedInput.full_name })
      .eq("profile_id", user.id);

    if (error) {
      log.error("profile_name_full update failed", { profile_id: user.id, error });
      throw new Error("No pudimos guardar tu nombre");
    }
    revalidatePath(`/${await getServerLocale()}/dashboard/account`);
  });

const deletePasskeySchema = z.object({
  webauthn_credential_id: z.string().uuid(),
});

export const actionDeletePasskey = authedAction
  .inputSchema(deletePasskeySchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase
      .from("webauthn_credentials")
      .delete()
      .eq("webauthn_credential_id", parsedInput.webauthn_credential_id)
      .eq("profile_id", user.id);

    if (error) {
      log.error("passkey delete failed", { profile_id: user.id, error });
      throw new Error("No pudimos eliminar el passkey");
    }
    revalidatePath(`/${await getServerLocale()}/dashboard/account`);
  });

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
    revalidatePath(`/${await getServerLocale()}/dashboard/account`);
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
    // Supabase may rotate the session token after a password change. Force a synchronous
    // refresh so the new cookies are written before the action response is sent.
    const refresh = await supabase.auth.refreshSession();
    if (refresh.error) {
      log.warn("session refresh failed after password change", { profile_id: user.id, error: refresh.error });
    }
    revalidatePath(`/${await getServerLocale()}/dashboard/account`);
  });
