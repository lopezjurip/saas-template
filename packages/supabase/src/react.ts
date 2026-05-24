"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { getSupabaseClient, getSupabaseClientUser } from "./client.browser";

export function useSupabase() {
  return useMemo(getSupabaseClient, []);
}

export function useSupabaseUser() {
  return useSWR("supabase-user", getSupabaseClientUser);
}
