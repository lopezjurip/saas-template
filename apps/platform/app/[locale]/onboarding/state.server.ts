import "server-only";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { getServerLocale } from "~/lib/i18n.server";
import type { OnboardingState } from "./state";

export async function loadOnboardingState(): Promise<OnboardingState> {
  const supabase = await createServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;
  if (!user) {
    const locale = await getServerLocale();
    redirect(`/${locale}/auth`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_name_full, profile_onboarded_at")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { count: passkeyCount } = await supabase
    .from("webauthn_credentials")
    .select("webauthn_credential_id", { head: true, count: "exact" })
    .eq("profile_id", user.id);
  const hasPasskey = (passkeyCount ?? 0) > 0;

  const hasPassword = (user["identities"] ?? []).some((i) => i["provider"] === "email");
  const profile_name_full = profile?.["profile_name_full"] || "";
  const hasName = profile_name_full.trim().length >= 2;
  const hasEmail = Boolean(user["email_confirmed_at"]);
  const hasPhone = Boolean(user["phone_confirmed_at"]);

  return {
    profile_id: user.id,
    email: user["email"],
    phone: user["phone"],
    profile_name_full,
    hasName,
    hasEmail,
    hasPhone,
    hasPasskey,
    hasPassword,
    profile_onboarded_at: profile?.["profile_onboarded_at"],
  };
}
