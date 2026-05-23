"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { action } from "~/lib/safe-action";
import { signupSchema } from "./schemas";

export const signUp = action.inputSchema(signupSchema).action(async ({ parsedInput }) => {
  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsedInput.email,
    password: parsedInput.password,
    options: {
      data: { full_name: parsedInput.full_name },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("registered")) {
      throw new Error("Ese correo ya tiene una cuenta. Inicia sesión.");
    }
    throw new Error("No pudimos crear la cuenta. Intenta de nuevo.");
  }

  return { email: parsedInput.email };
});
