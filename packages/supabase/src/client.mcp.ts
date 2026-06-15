import "server-only";

import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import type { Database } from "./types.ts";

/**
 * Creates a Supabase client scoped to a bearer token from an MCP request.
 * Auth is disabled (no session refresh, no persistence) — token is forwarded
 * as-is via Authorization header. RLS applies via the token's `sub` claim.
 *
 * @example
 * const supabase = createSupabaseMcpClient(authInfo.token);
 * const { data } = await supabase.rpc("viewer_has_permission", { ... });
 */
export function createSupabaseMcpClient(accessToken?: string) {
  const options: SupabaseClientOptions<any> = {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  };

  if (accessToken) {
    options.global = {
      headers: {
        ["Authorization"]: `Bearer ${accessToken}`,
      },
    };
  }

  return createClient<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    options,
  );
}
