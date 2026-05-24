"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/[locale]/auth/providers";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { action, formAction } from "~/lib/safe-action";

const log = debug("auth:oauth");

const signInWithOAuthSchema = z.object({
  provider: z.enum(OAUTH_PROVIDER_IDS),
  next: z.string().default("/"),
});

const checkIdentifierSchema = z.object({
  identifier: z
    .string()
    .min(1)
    .transform((v) => v.trim()),
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

const checkIdentifierRun = action.inputSchema(checkIdentifierSchema).action(async ({ parsedInput: { identifier } }) => {
  const locale = await getServerLocale();
  const supabase = await createServerClient();

  if (identifier.includes("@")) {
    const email = identifier.toLowerCase();
    const { data: exists } = await supabase.rpc("email_exists", { email_to_check: email });

    if (!exists) {
      redirect(`/${locale}/auth/email/signup?email=${encodeURIComponent(email)}`);
    }

    const { data: hasPasskey } = await supabase.rpc("email_has_passkey", { email_to_check: email });
    const passkeySuffix = hasPasskey ? "&has_passkey=1" : "";
    redirect(`/${locale}/auth/email/login?email=${encodeURIComponent(email)}${passkeySuffix}`);
  }

  const { data: normalized } = await supabase.rpc("phone_normalize", {
    value: identifier,
    default_code: "+56",
  });
  if (!normalized) redirect(`/${locale}/auth?error=invalid_identifier`);

  const { data: exists } = await supabase.rpc("phone_exists", {
    phone_to_check: identifier,
    default_code: "+56",
  });
  if (!exists) {
    redirect(`/${locale}/auth/phone/signup?phone=${encodeURIComponent(normalized)}`);
  }
  redirect(`/${locale}/auth/phone/login?phone=${encodeURIComponent(normalized)}`);
});

// HTML form adapters for <form action={...}> usage in app/[locale]/auth/page.tsx.
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

export const checkIdentifier = formAction(checkIdentifierRun, (fd) => ({
  identifier: String(fd.get("identifier") ?? ""),
}));
