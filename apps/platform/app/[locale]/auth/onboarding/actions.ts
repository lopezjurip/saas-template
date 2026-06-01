"use server";

import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { authedAction, formAction } from "~/lib/safe-action";

const log = debug("onboarding:finish");

// Stamps `profile_onboarded_at` and sends the user to /home. Onboarding isn't a hard gate
// anymore — they could leave the hub without this — but pressing "continuar" makes the
// transition explicit and stops the /home banner from re-appearing.
const finishOnboardingRun = authedAction.action(async ({ ctx: { supabase, user } }) => {
  const { error } = await supabase
    .from("profiles")
    .update({ profile_onboarded_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  if (error) {
    log.error("profile_onboarded_at update failed", { profile_id: user.id, error });
    redirect("/[locale]/auth/error?reason=onboarding_save_failed");
  }

  const refresh = await supabase.auth.refreshSession();
  if (refresh.error) {
    log.warn("session refresh failed after onboarding", { profile_id: user.id, error: refresh.error });
  }

  log.info("onboarding finished", { profile_id: user.id });
  redirect("/[locale]/home");
});

// The hub passes this as a `<form action>`, so we adapt via formAction.
export const actionFinishOnboarding = formAction(finishOnboardingRun, () => undefined);
