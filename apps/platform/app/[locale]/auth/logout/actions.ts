"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { action } from "~/lib/safe-action.server";

const log = debug("auth:logout");

export const signOut = action.action(async () => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    // Don't block the redirect — sign-out is best-effort. Cookies are cleared either way.
    log.warn("signOut returned an error; redirecting anyway", { error });
  }
  redirect("/[locale]/auth");
});

/**
 * `<form action={...}>` adapter for `signOut`, which takes no args.
 * @example
 * <form action={signOutForm}><button type="submit">Cerrar sesión</button></form>
 */
export async function signOutForm(_: FormData) {
  await signOut();
}
