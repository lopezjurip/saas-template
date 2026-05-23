"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { action } from "~/lib/safe-action";

export const signOut = action.action(async () => {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/auth");
});

// `<form action={...}>` requires (FormData) => void; the safe-action signOut takes no args.
export async function signOutForm(_: FormData) {
  await signOut();
}
