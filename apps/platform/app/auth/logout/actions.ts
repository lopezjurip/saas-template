"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/auth");
}
