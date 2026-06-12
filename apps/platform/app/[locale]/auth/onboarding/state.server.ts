import "server-only";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { METHOD_ORDER, type OnboardingMethodStatus, type OnboardingState } from "./state";

// Document doesn't have a backend yet — there's no `profile_identity_documents` row for the
// user-supplied document, only the lookup helpers for staff invites. We treat it as always
// "pending" so the chip stays clickable; the substep page will say "próximamente".
const DOCUMENT_STATUS: OnboardingMethodStatus = "pending";

export async function getViewerOnboardingState(): Promise<OnboardingState> {
  const supabase = await createServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;
  if (!user) {
    redirect("/[locale]/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_name_full, profile_onboarded_at")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { count: passkeyCount } = await supabase
    .from("profile_webauthn_credentials")
    .select("webauthn_credential_id", { head: true, count: "exact" })
    .eq("profile_id", user.id);

  const profile_name_full = profile?.["profile_name_full"] ?? "";
  const identities = user["identities"] ?? [];
  const hasPassword = identities.some((i) => i["provider"] === "email");
  const hasPasskey = (passkeyCount ?? 0) > 0;
  const hasEmail = Boolean(user["email_confirmed_at"]);
  const hasPhone = Boolean(user["phone_confirmed_at"]);
  const hasName = profile_name_full.trim().length >= 2;

  return {
    profile_id: user.id,
    email: user["email"] ?? null,
    phone: user["phone"] ?? null,
    profile_name_full,
    profile_onboarded_at: profile?.["profile_onboarded_at"] ?? null,
    methods: {
      passkey: hasPasskey ? "done" : "pending",
      password: hasPassword ? "done" : "pending",
      phone: hasPhone ? "done" : "pending",
      email: hasEmail ? "done" : "pending",
      document: DOCUMENT_STATUS,
      profile: hasName ? "done" : "pending",
    },
  };
}

export function ASSERT_KNOWN_METHOD(id: string): id is (typeof METHOD_ORDER)[number] {
  return (METHOD_ORDER as readonly string[]).includes(id);
}
