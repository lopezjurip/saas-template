"use server";

import { redirect } from "next/navigation";
import { authedAction } from "~/lib/safe-action";

export const finishOnboarding = authedAction.action(async ({ ctx: { supabase, user } }) => {
  const { error } = await supabase
    .from("profiles")
    .update({ profile_onboarded_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  if (error) redirect("/auth/error?reason=onboarding_save_failed");

  // Refresh the session so the next request sees app_metadata.onboarded = true.
  await supabase.auth.refreshSession();
  redirect("/dashboard");
});
