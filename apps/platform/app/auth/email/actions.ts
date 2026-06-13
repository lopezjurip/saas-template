"use server";
import "server-only";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AUTH_EXPOSE_ACCOUNT_EXISTENCE } from "~/lib/constants";
import { action, formAction } from "~/lib/safe-action.server";

const checkEmailSchema = z.object({
  email: z
    .string()
    .min(1)
    .transform((v) => v.trim().toLowerCase()),
  next: z.string().default("/"),
});

/**
 * Step-1 → step-2 dispatcher. Resolves availability flags then redirects to the same
 * /auth/email route with `value=` + flags so the page renders the method picker.
 */
const checkEmailRun = action.inputSchema(checkEmailSchema).action(async ({ parsedInput }) => {
  const supabase = await createServerClient();
  const email = parsedInput["email"];
  const next = parsedInput["next"];

  if (!email.includes("@")) {
    redirect(`/auth/email?error=invalid_email&next=${encodeURIComponent(next)}`);
  }

  if (!AUTH_EXPOSE_ACCOUNT_EXISTENCE) {
    const qs = new URLSearchParams({ value: email, next });
    redirect(`/auth/email?${qs.toString()}`);
  }

  const { data: exists } = await supabase.rpc("email_exists", { email_to_check: email });
  if (!exists) {
    const qs = new URLSearchParams({ value: email, exists: "0", next });
    redirect(`/auth/email?${qs.toString()}`);
  }

  const { data: hasPassword } = await supabase.rpc("email_has_password", { email_to_check: email });

  const qs = new URLSearchParams({
    value: email,
    exists: "1",
    has_password: hasPassword ? "1" : "0",
    next,
  });
  redirect(`/auth/email?${qs.toString()}`);
});

export const checkEmail = formAction(checkEmailRun, (fd) => ({
  email: String(fd.get("email") ?? ""),
  next: String(fd.get("next") ?? "/"),
}));
