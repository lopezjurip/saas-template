"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { type SignupValues, signupSchema } from "./schemas";

type ActionResult = { error: string } | { ok: true; email: string };

export async function signUp(values: SignupValues): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Formulario inválido" };
  }

  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("registered")) {
      return { error: "Ese correo ya tiene una cuenta. Inicia sesión." };
    }
    return { error: "No pudimos crear la cuenta. Intenta de nuevo." };
  }

  return { ok: true, email: parsed.data.email };
}
