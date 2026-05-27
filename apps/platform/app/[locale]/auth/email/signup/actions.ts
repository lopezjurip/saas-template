"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { EXTRACT_DOCUMENT_TRIPLET } from "~/app/[locale]/auth/_components/document-triplet-schema";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { action } from "~/lib/safe-action";
import { signupSchema } from "./schemas";

const log = debug("auth:signup");

export const signUp = action.inputSchema(signupSchema).action(async ({ parsedInput }) => {
  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;
  const locale = await getServerLocale();
  const triplet = EXTRACT_DOCUMENT_TRIPLET(parsedInput);

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsedInput.email,
    password: parsedInput.password,
    options: {
      data: {
        full_name: parsedInput.full_name,
        ...(triplet ? { profile_identity: triplet } : {}),
      },
      emailRedirectTo: `${origin}/${locale}/onboarding`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("registered")) {
      log.info("signup attempt for existing email", { email: parsedInput.email });
      throw new Error("Ese correo ya tiene una cuenta. Inicia sesión.");
    }
    if (error.message.toLowerCase().includes("invalid") && triplet) {
      log.info("signup rejected by trigger (invalid document)", { email: parsedInput.email, triplet });
      throw new Error("El documento ingresado no es válido o ya pertenece a otro perfil.");
    }
    log.error("signUp failed", { email: parsedInput.email, error });
    throw new Error("No pudimos crear la cuenta. Intenta de nuevo.");
  }

  log.info("signup confirmation email sent", { email: parsedInput.email, withDocument: triplet !== null });
  return { email: parsedInput.email };
});
