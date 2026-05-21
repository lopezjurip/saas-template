import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types.ts";

export function createBrowserClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createServerClient(supabaseUrl: string, supabaseServiceKey: string) {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
