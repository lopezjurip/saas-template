"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { debug } from "~/lib/debug";

const log = debug("passkeys.client");

export async function createPasskey() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.registerPasskey();
  if (error) {
    log.error("[createPasskey] Failed to register passkey", error);
    throw error;
  }
  return data;
}

export async function signInWithPasskey() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithPasskey();
  if (error) {
    log.error("[signInWithPasskey] Failed to sign in with passkey", error);
    throw error;
  }
  return data;
}
