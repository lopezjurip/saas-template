import "server-only";
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { ENV } from "@packages/utils/env";
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
    URL_NEW("/graphql/v1", ENV("NEXT_PUBLIC_SUPABASE_URL")),
    ENV("SUPABASE_SERVICE_ROLE_KEY"),
  );
});
