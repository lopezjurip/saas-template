"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/[locale]/auth/providers";
import { AUTH_EXPOSE_ACCOUNT_EXISTENCE } from "~/lib/constants";
import { debug } from "~/lib/debug";
import { action } from "~/lib/safe-action";

const log = debug("auth");

const signInWithOAuthSchema = z.object({
  provider: z.enum(OAUTH_PROVIDER_IDS),
  next: z.string().default("/"),
});

// NOTE (Opus analysis): signInWithOAuthRun is technically client-side compatible (pure SDK call, anon key).
// Can be refactored to client-side hook in future. Currently kept server for logging patterns.
// The rest of this file (continueWith*) MUST stay server because they call enumeration RPCs
// (email_exists, phone_exists, phone_normalize, *_has_passkey, *_has_password) which expose
// account enumeration and should only be callable by authenticated/authorized sources.
const signInWithOAuthRun = action
  .inputSchema(signInWithOAuthSchema)
  .action(async ({ parsedInput: { provider, next } }) => {
    const headerList = await headers();
    const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/[locale]/auth/callback?next=${encodeURIComponent(next)}` },
    });

    if (error || !data?.url) {
      log.error("signInWithOAuth failed", { provider, error });
      redirect(`/[locale]/auth/error?reason=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`);
    }
    redirect(data.url);
  });

export async function signInWithOAuth(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  if (!isOAuthProvider(provider)) {
    redirect("/[locale]/auth/error?reason=unknown_provider");
  }
  await signInWithOAuthRun({
    provider,
    next: String(formData.get("next") ?? "/"),
  });
}

// Single entry-point dispatcher for the unified Paso 1 form (selector + smart variants).
// Detects which field was filled and delegates to a per-method check that resolves the
// account's available methods, then redirects to the consolidated /auth/{kind} page
// with everything pre-populated so step-2 renders without an extra round-trip.
async function continueWithEmail(value: string, next: string): Promise<never> {
  const email = value.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect(`/[locale]/auth/email?error=invalid_email&next=${encodeURIComponent(next)}`);
  }
  if (!AUTH_EXPOSE_ACCOUNT_EXISTENCE) {
    const qs = new URLSearchParams({ value: email, next });
    redirect(`/[locale]/auth/email?${qs.toString()}`);
  }
  const supabase = await createServerClient();
  const { data: exists } = await supabase.rpc("email_exists", { email_to_check: email });
  if (!exists) {
    const qs = new URLSearchParams({ value: email, exists: "0", next });
    redirect(`/[locale]/auth/email?${qs.toString()}`);
  }
  const [passkeyRes, passwordRes] = await Promise.all([
    supabase.rpc("email_has_passkey", { email_to_check: email }),
    supabase.rpc("email_has_password", { email_to_check: email }),
  ]);
  const qs = new URLSearchParams({
    value: email,
    exists: "1",
    has_passkey: passkeyRes.data ? "1" : "0",
    has_password: passwordRes.data ? "1" : "0",
    next,
  });
  redirect(`/[locale]/auth/email?${qs.toString()}`);
}

async function continueWithPhone(value: string, next: string): Promise<never> {
  const phone = value.trim();
  if (!phone) redirect(`/[locale]/auth/phone?error=invalid_phone&next=${encodeURIComponent(next)}`);
  const supabase = await createServerClient();
  const { data: normalized } = await supabase.rpc("phone_normalize", { value: phone, default_code: "+56" });
  if (!normalized) {
    redirect(`/[locale]/auth/phone?error=invalid_phone&next=${encodeURIComponent(next)}`);
  }
  if (!AUTH_EXPOSE_ACCOUNT_EXISTENCE) {
    const qs = new URLSearchParams({ value: normalized as string, channels: "sms,whatsapp", next });
    redirect(`/[locale]/auth/phone?${qs.toString()}`);
  }
  const { data: exists } = await supabase.rpc("phone_exists", { phone_to_check: phone, default_code: "+56" });
  if (!exists) {
    const qs = new URLSearchParams({
      value: normalized as string,
      exists: "0",
      channels: "sms,whatsapp",
      next,
    });
    redirect(`/[locale]/auth/phone?${qs.toString()}`);
  }
  const [passkeyRes, passwordRes] = await Promise.all([
    supabase.rpc("phone_has_passkey", { phone_to_check: phone, default_code: "+56" }),
    supabase.rpc("phone_has_password", { phone_to_check: phone, default_code: "+56" }),
  ]);
  const qs = new URLSearchParams({
    value: normalized as string,
    exists: "1",
    has_passkey: passkeyRes.data ? "1" : "0",
    has_password: passwordRes.data ? "1" : "0",
    channels: "sms,whatsapp",
    next,
  });
  redirect(`/[locale]/auth/phone?${qs.toString()}`);
}

async function continueWithDocument(value: string, next: string): Promise<never> {
  const doc = value.trim();
  if (!doc) redirect(`/[locale]/auth/document?error=invalid_document&next=${encodeURIComponent(next)}`);
  redirect(`/[locale]/auth/document?value=${encodeURIComponent(doc)}&next=${encodeURIComponent(next)}`);
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
  redirect("/[locale]/auth?error=empty");
}
