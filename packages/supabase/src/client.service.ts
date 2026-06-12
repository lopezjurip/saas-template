import "server-only";

import { ENV } from "@packages/utils/env";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types.ts";

export function createServiceRoleClient() {
  return createClient<Database>(ENV("NEXT_PUBLIC_SUPABASE_URL"), ENV("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
