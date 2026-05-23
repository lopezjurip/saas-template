"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { action } from "~/lib/safe-action";
import { loginSchema, magicLinkSchema } from "./schemas";

export const signInWithPassword = action.inputSchema(loginSchema).action(async ({ parsedInput }) => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsedInput);
  if (error) throw new Error("Correo o contraseña incorrectos");
  redirect("/dashboard");
});

export const sendMagicLink = action.inputSchema(magicLinkSchema).action(async ({ parsedInput: { email } }) => {
  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) throw new Error("No pudimos enviar el enlace. Intenta de nuevo.");
  return { sentTo: email };
});
