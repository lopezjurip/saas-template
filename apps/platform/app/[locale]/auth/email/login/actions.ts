"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { action } from "~/lib/safe-action";
import { loginSchema, magicLinkSchema } from "./schemas";

const log = debug("auth:login");

export const signInWithPassword = action.inputSchema(loginSchema).action(async ({ parsedInput }) => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsedInput);
  if (error) {
    log.info("password login rejected", { email: parsedInput.email, reason: error.message });
    throw new Error("Correo o contraseña incorrectos");
  }
  log.info("password login succeeded", { email: parsedInput.email });
  const locale = await getServerLocale();
  redirect(`/${locale}/dashboard`);
});

export const sendMagicLink = action.inputSchema(magicLinkSchema).action(async ({ parsedInput: { email } }) => {
  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;
  const locale = await getServerLocale();

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/${locale}/auth/callback`,
    },
  });
  if (error) {
    log.error("signInWithOtp failed", { email, error });
    throw new Error("No pudimos enviar el enlace. Intenta de nuevo.");
  }
  log.info("magic link sent", { email });
  return { sentTo: email };
});
