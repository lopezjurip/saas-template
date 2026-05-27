import "server-only";
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { getSupabaseServerSession } from "@packages/supabase/client.server";
import { URL_NEW } from "@packages/utils/url";
import { cache } from "react";

const NEXT_PUBLIC_SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"];

/**
 * Returns a graphy client authenticated with the current request's Supabase session.
 * Wrapped in React `cache()` so multiple calls within one RSC render reuse the same instance.
 */
export const getGraphySession = cache(async () => {
  const session = await getSupabaseServerSession();
  return new GraphyClientSupabase(
    URL_NEW("/graphql/v1", NEXT_PUBLIC_SUPABASE_URL),
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    session?.access_token,
  );
});
