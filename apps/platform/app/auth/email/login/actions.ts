"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type LoginValues, loginSchema, type MagicLinkValues, magicLinkSchema } from "./schemas";

type ActionResult = { error: string } | { ok: true };

export async function signInWithPassword(values: LoginValues): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Formulario inválido" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Correo o contraseña incorrectos" };
  }

  redirect("/");
}

export async function sendMagicLink(values: MagicLinkValues): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Correo inválido" };
  }

  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: "No pudimos enviar el enlace. Intenta de nuevo." };
  }

  return { ok: true };
}
