"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/auth/providers";
import { action, formAction } from "~/lib/safe-action";

const signInWithOAuthSchema = z.object({
  provider: z.enum(OAUTH_PROVIDER_IDS),
  next: z.string().default("/"),
});

const checkEmailSchema = z.object({
  email: z
    .string()
    .min(1)
    .transform((v) => v.trim().toLowerCase()),
});

const signInWithOAuthRun = action
  .inputSchema(signInWithOAuthSchema)
  .action(async ({ parsedInput: { provider, next } }) => {
    const headerList = await headers();
    const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });

    if (error || !data?.url) {
      redirect(`/auth/error?reason=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`);
    }
    redirect(data.url);
  });

const checkEmailRun = action.inputSchema(checkEmailSchema).action(async ({ parsedInput: { email } }) => {
  if (!email.includes("@")) redirect("/auth?error=invalid_email");

  const supabase = await createServerClient();
  const { data: exists } = await supabase.rpc("email_exists", { email_to_check: email });

  const target = exists ? "/auth/email/login" : "/auth/email/signup";
  redirect(`${target}?email=${encodeURIComponent(email)}`);
});

// HTML form adapters for <form action={...}> usage in app/auth/page.tsx.
export async function signInWithOAuth(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  if (!isOAuthProvider(provider)) redirect("/auth/error?reason=unknown_provider");
  await signInWithOAuthRun({
    provider,
    next: String(formData.get("next") ?? "/"),
  });
}

export const checkEmail = formAction(checkEmailRun, (fd) => ({
  email: String(fd.get("email") ?? ""),
}));
