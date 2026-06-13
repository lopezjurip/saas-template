"use server";
import "server-only";

import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { captureOnboardingCompleted, captureUserSignedUp } from "~/lib/posthog/events.server";
import { authedAction, formAction } from "~/lib/safe-action.server";

const log = debug("onboarding:finish");

/**
 * Stamps `profile_onboarded_at` and sends the user to the success screen. Onboarding isn't
 * a hard gate anymore — they could leave the hub without this — but pressing "continuar"
 * makes the transition explicit and stops the /home banner from re-appearing.
 */
const finishOnboardingRun = authedAction.action(async ({ ctx: { supabase, user } }) => {
  const { error } = await supabase
    .from("profiles")
    .update({ profile_onboarded_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  if (error) {
    log.error("profile_onboarded_at update failed", { profile_id: user.id, error });
    redirect("/auth/error?reason=onboarding_save_failed");
  }

  const refresh = await supabase.auth.refreshSession();
  if (refresh.error) {
    log.warn("session refresh failed after onboarding", { profile_id: user.id, error: refresh.error });
  }

  log.info("onboarding finished", { profile_id: user.id });

  const provider = user.app_metadata?.["provider"];
  void Promise.allSettled([captureUserSignedUp(user.id, { provider }), captureOnboardingCompleted(user.id)]);

  redirect("/auth/success");
});

/** The hub passes this as a `<form action>`, so we adapt via formAction. */
export const actionFinishOnboarding = formAction(finishOnboardingRun, () => undefined);
