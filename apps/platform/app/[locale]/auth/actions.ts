"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/[locale]/auth/providers";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { action } from "~/lib/safe-action";

const log = debug("auth:oauth");

const signInWithOAuthSchema = z.object({
  provider: z.enum(OAUTH_PROVIDER_IDS),
  next: z.string().default("/"),
});

const signInWithOAuthRun = action
  .inputSchema(signInWithOAuthSchema)
  .action(async ({ parsedInput: { provider, next } }) => {
    const headerList = await headers();
    const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;
    const locale = await getServerLocale();

    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}` },
    });

    if (error || !data?.url) {
      log.error("signInWithOAuth failed", { provider, error });
      redirect(`/${locale}/auth/error?reason=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`);
    }
    redirect(data.url);
  });

export async function signInWithOAuth(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  if (!isOAuthProvider(provider)) {
    const locale = await getServerLocale();
    redirect(`/${locale}/auth/error?reason=unknown_provider`);
  }
  await signInWithOAuthRun({
    provider,
    next: String(formData.get("next") ?? "/"),
  });
}
