"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { getSupabaseClient, getSupabaseClientUser } from "./client.browser";

/**
 * Returns the Supabase browser client (stable reference via useMemo).
 *
 * @example
 * const supabase = useSupabase();
 * await supabase.from("posts").select("*");
 */
export function useSupabase() {
  return useMemo(getSupabaseClient, []);
}

/**
 * Returns the currently authenticated Supabase user via SWR.
 *
 * @example
 * const { data: user } = useSupabaseUser();
 * if (user) console.log(user.email);
 */
export function useSupabaseUser() {
  return useSWR("supabase-user", getSupabaseClientUser);
}
