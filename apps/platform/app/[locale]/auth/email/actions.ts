"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerLocale } from "~/lib/i18n.server";
import { action, formAction } from "~/lib/safe-action";

const checkEmailSchema = z.object({
  email: z
    .string()
    .min(1)
    .transform((v) => v.trim().toLowerCase()),
  next: z.string().default("/"),
});

const checkEmailRun = action.inputSchema(checkEmailSchema).action(async ({ parsedInput }) => {
  const locale = await getServerLocale();
  const supabase = await createServerClient();
  const email = parsedInput["email"];

  if (!email.includes("@")) {
    redirect(`/${locale}/auth/email?error=invalid_email`);
  }

  const { data: exists } = await supabase.rpc("email_exists", { email_to_check: email });
  if (!exists) {
    redirect(`/${locale}/auth/email/signup?email=${encodeURIComponent(email)}`);
  }

  const { data: hasPasskey } = await supabase.rpc("email_has_passkey", { email_to_check: email });
  const passkeySuffix = hasPasskey ? "&has_passkey=1" : "";
  redirect(`/${locale}/auth/email/login?email=${encodeURIComponent(email)}${passkeySuffix}`);
});

export const checkEmail = formAction(checkEmailRun, (fd) => ({
  email: String(fd.get("email") ?? ""),
  next: String(fd.get("next") ?? "/"),
}));
