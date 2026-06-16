import "server-only";

import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { cache } from "react";

/**
 * Fetches the agency for the current viewer by slug, RLS-scoped to accepted
 * members via the `viewer_agency_by_slug` RPC. Wrapped in React `cache()` so the
 * shared agency layout and each child page dedupe to a single DB round-trip per
 * request (layouts cannot pass data down to pages). Returns the full agency row
 * — including `agency_disabled_at`, which the GraphQL fragment lacks — or `null`
 * when the caller is not an accepted affiliate (the page should then `notFound()`).
 *
 * The supabase client is created *inside* the cached function on purpose: the only
 * argument is `agency_slug`, so the cache key matches across layout and page calls.
 *
 * @example const agency = await getAgencyBySlug(agency_slug); if (!agency) notFound();
 */
export const getAgencyBySlug = cache(async (agency_slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("viewer_agency_by_slug", { agency_slug }).maybeSingle();
  return data;
});
