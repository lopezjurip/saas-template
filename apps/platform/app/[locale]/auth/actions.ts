"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/[locale]/auth/providers";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { action } from "~/lib/safe-action";

const log = debug("auth");

const signInWithOAuthSchema = z.object({
  provider: z.enum(OAUTH_PROVIDER_IDS),
  next: z.string().default("/"),
});

// NOTE (Opus analysis): signInWithOAuthRun is technically client-side compatible (pure SDK call, anon key).
// Can be refactored to client-side hook in future. Currently kept server for logging patterns.
// The rest of this file (continueWith*) MUST stay server because they call enumeration RPCs
// (email_exists, phone_exists, phone_normalize, email_has_passkey) which expose account enumeration
// and should only be callable by authenticated/authorized sources, not anon clients.
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

// Single entry-point dispatcher for the unified Paso 1 form (selector + smart variants).
// Detects which field was filled and delegates to the same per-method check actions
// that the deeper /auth/{method} pages would call on their own.
async function continueWithEmail(value: string, next: string): Promise<never> {
  const locale = await getServerLocale();
  const email = value.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect(`/${locale}/auth/email?error=invalid_email&next=${encodeURIComponent(next)}`);
  }
  const supabase = await createServerClient();
  const { data: exists } = await supabase.rpc("email_exists", { email_to_check: email });
  if (!exists) {
    redirect(`/${locale}/auth/email/signup?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
  }
  const { data: hasPasskey } = await supabase.rpc("email_has_passkey", { email_to_check: email });
  const passkeySuffix = hasPasskey ? "&has_passkey=1" : "";
  redirect(
    `/${locale}/auth/email/login?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}${passkeySuffix}`,
  );
}

async function continueWithPhone(value: string, next: string): Promise<never> {
  const locale = await getServerLocale();
  const phone = value.trim();
  if (!phone) redirect(`/${locale}/auth/phone?error=invalid_phone`);
  const supabase = await createServerClient();
  const { data: normalized } = await supabase.rpc("phone_normalize", { value: phone, default_code: "+56" });
  if (!normalized) redirect(`/${locale}/auth/phone?error=invalid_phone`);
  const { data: exists } = await supabase.rpc("phone_exists", { phone_to_check: phone, default_code: "+56" });
  if (!exists) {
    redirect(
      `/${locale}/auth/phone/signup?phone=${encodeURIComponent(normalized as string)}&next=${encodeURIComponent(next)}`,
    );
  }
  redirect(
    `/${locale}/auth/phone/login?phone=${encodeURIComponent(normalized as string)}&next=${encodeURIComponent(next)}`,
  );
}

async function continueWithDocument(value: string, next: string): Promise<never> {
  const locale = await getServerLocale();
  const doc = value.trim();
  if (!doc) redirect(`/${locale}/auth/document?error=invalid_document`);
  redirect(`/${locale}/auth/document?value=${encodeURIComponent(doc)}&next=${encodeURIComponent(next)}`);
}

// Form action consumed by the unified /auth entry form. The form submits with one of
// `email | phone | document` filled; we route to the right per-method check action.
export async function actionContinueAuth(formData: FormData): Promise<never> {
  const next = String(formData.get("next") ?? "/");
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const document = String(formData.get("document") ?? "").trim();

  if (email) await continueWithEmail(email, next);
  if (phone) await continueWithPhone(phone, next);
  if (document) await continueWithDocument(document, next);

  log.warn("actionContinueAuth: empty payload");
  const locale = await getServerLocale();
  redirect(`/${locale}/auth?error=empty`);
}
