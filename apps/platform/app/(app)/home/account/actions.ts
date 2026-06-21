"use server";
import "server-only";

import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/auth/providers";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { authedAction, formAction } from "~/lib/safe-action.server";

const log = debug("account");

export const actionSignOutOtherDevices = authedAction.action(async ({ ctx: { supabase, user } }) => {
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) {
    log.error("signOut others failed", { profile_id: user.id, error });
    throw new Error("No pudimos cerrar las otras sesiones");
  }
});

const revokeSessionSchema = z.object({ sessionId: z.string().uuid() });

export const actionRevokeSession = authedAction
  .inputSchema(revokeSessionSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase.rpc("revoke_session", { session_id: parsedInput.sessionId });
    if (error) {
      log.error("revoke session failed", { profile_id: user.id, sessionId: parsedInput.sessionId, error });
      throw new Error("No pudimos cerrar esa sesión");
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

const deleteAccountSchema = z.object({ password: z.string().min(1) });

/**
 * Permanently deletes the signed-in user's account. Re-verifies the current
 * password on a stateless client, then cascade-deletes via service-role
 * (`auth.users` → `profiles` → memberships → permissions), clears the cookie
 * session, and redirects home. The last-admin triggers bypass service-role, so
 * orphaning an org doesn't block the delete.
 */
export const actionDeleteAccount = authedAction
  .inputSchema(deleteAccountSchema)
  .action(async ({ parsedInput: { password }, ctx: { supabase, user } }) => {
    const email = user["email"];
    if (!email) {
      throw new Error("Tu cuenta no tiene contraseña; no podemos verificar la eliminación");
    }
    // Verify the password on a throwaway client so we don't touch the cookie session.
    const verifier = createSupabaseServiceRoleClient();
    const { error: verifyError } = await verifier.auth.signInWithPassword({ email, password });
    if (verifyError) {
      log.info("delete account password check failed", { profile_id: user.id });
      throw new Error("Contraseña incorrecta");
    }

    const admin = createSupabaseServiceRoleClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      log.error("delete account failed", { profile_id: user.id, error: deleteError });
      throw new Error("No pudimos eliminar la cuenta");
    }

    log.info("account deleted", { profile_id: user.id });
    await supabase.auth.signOut({ scope: "local" });
    redirect("/");
  });

const linkProviderSchema = z.object({
  provider: z.enum(OAUTH_PROVIDER_IDS),
});

const linkProviderRun = authedAction
  .inputSchema(linkProviderSchema)
  .action(async ({ parsedInput: { provider }, ctx: { supabase, user } }) => {
    const headerList = await headers();
    const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/home/account/connections")}`,
      },
    });

    if (error || !data?.url) {
      log.error("linkIdentity failed", { profile_id: user.id, provider, error });
      redirect(`/home/account/connections?error=${encodeURIComponent(error?.message ?? "link_failed")}`);
    }
    redirect(ROUTE_HREF(UNSAFE_ROUTE(data["url"])));
  });

export const actionLinkProvider = formAction(linkProviderRun, (fd) => {
  const provider = String(fd.get("provider") ?? "");
  if (!isOAuthProvider(provider)) {
    throw new Error("Provider desconocido");
  }
  return { provider };
});
