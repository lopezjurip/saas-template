"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OAUTH_PROVIDER_IDS } from "~/app/auth/providers";

export async function signInWithOAuth(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!OAUTH_PROVIDER_IDS.has(provider)) {
    redirect(`/auth/error?reason=unknown_provider`);
  }

  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    // biome-ignore lint/suspicious/noExplicitAny: provider validated above
    provider: provider as any,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data?.url) {
    redirect(`/auth/error?reason=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`);
  }

  redirect(data.url);
}

export async function checkEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect(`/auth?error=invalid_email`);
  }

  const supabase = await createServerClient();
  // biome-ignore lint/suspicious/noExplicitAny: TS6 + supabase-js 2.106 overload resolution loses Args type here
  const { data: exists } = await (supabase.rpc as any)("email_exists", { email_to_check: email });

  const target = exists ? "/auth/email/login" : "/auth/email/signup";
  redirect(`${target}?email=${encodeURIComponent(email)}`);
}
