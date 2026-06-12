import "server-only";
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { URL_NEW } from "@packages/utils/url";
import { cache } from "react";

/**
 * Service-role graphy: bypasses RLS by sending the service-role key as both the apikey
 * header and the Authorization Bearer token. Use ONLY in trusted server-side contexts —
 * Server Actions, route handlers, jobs — that have already validated the caller.
 * Wrapped in React `cache()` so multiple calls within one render reuse the same instance.
 */
export const getGraphyServiceRole = cache(() => {
  return new GraphyClientSupabase(
    URL_NEW("/graphql/v1", process.env["NEXT_PUBLIC_SUPABASE_URL"]),
    process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    process.env["SUPABASE_SERVICE_ROLE_KEY"],
  );
});
