import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { getSupabaseSession } from "@packages/supabase/client.browser";
import { URL_NEW } from "@packages/utils/url";

const NEXT_PUBLIC_SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"];

export function createGraphy(session?: { access_token?: string | null } | null) {
  return new GraphyClientSupabase(
    URL_NEW("/graphql/v1", NEXT_PUBLIC_SUPABASE_URL),
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    session?.access_token,
  );
}

export async function getGraphy() {
  const session = await getSupabaseSession();
  return createGraphy(session);
}
