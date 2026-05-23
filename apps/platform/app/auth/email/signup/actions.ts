"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { debug } from "~/lib/debug";
import { action } from "~/lib/safe-action";
import { signupSchema } from "./schemas";

const log = debug("auth:signup");

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
      log.info("signup attempt for existing email", { email: parsedInput.email });
      throw new Error("Ese correo ya tiene una cuenta. Inicia sesión.");
    }
    log.error("signUp failed", { email: parsedInput.email, error });
    throw new Error("No pudimos crear la cuenta. Intenta de nuevo.");
  }

  log.info("signup confirmation email sent", { email: parsedInput.email });
  return { email: parsedInput.email };
});
