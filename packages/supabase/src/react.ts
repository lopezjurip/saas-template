"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { getSupabase, getSupabaseUser } from "./client.browser";

export function useSupabase() {
  return useMemo(getSupabase, []);
}

export function useSupabaseUser() {
  return useSWR("supabase-user", getSupabaseUser);
}
