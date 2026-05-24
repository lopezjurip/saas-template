"use server";

import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action";

const log = debug("onboarding:finish");

export const finishOnboarding = authedAction.action(async ({ ctx: { supabase, user } }) => {
  const locale = await getServerLocale();
  const { error } = await supabase
    .from("profiles")
    .update({ profile_onboarded_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  if (error) {
    log.error("profile_onboarded_at update failed", { profile_id: user.id, error });
    redirect(`/${locale}/auth/error?reason=onboarding_save_failed`);
  }

  // Refresh the session so the next request sees app_metadata.onboarded = true.
  const refresh = await supabase.auth.refreshSession();
  if (refresh.error) {
    log.warn("session refresh failed after onboarding; claim may lag", {
      profile_id: user.id,
      error: refresh.error,
    });
  }

  log.info("onboarding finished", { profile_id: user.id });
  redirect(`/${locale}/dashboard`);
});
