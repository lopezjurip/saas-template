"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";

export async function finishOnboarding(): Promise<void> {
  const supabase = await createServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;
  if (!user) redirect("/auth");

  // biome-ignore lint/suspicious/noExplicitAny: TS6 + supabase-js 2.106 inference loses Update type
  const { error } = await (supabase.from("profiles") as any)
    .update({ profile_onboarded_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  if (error) {
    redirect("/auth/error?reason=onboarding_save_failed");
  }

  // Refresh the session so the next request sees app_metadata.onboarded = true.
  await supabase.auth.refreshSession();
  redirect("/");
}
