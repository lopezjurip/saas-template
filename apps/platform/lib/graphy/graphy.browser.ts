import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { getSupabaseClientSession } from "@packages/supabase/client.browser";
import { URL_NEW } from "@packages/utils/url";

const NEXT_PUBLIC_SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"];

export function createGraphy(accessToken?: string) {
  return new GraphyClientSupabase(
    URL_NEW("/graphql/v1", NEXT_PUBLIC_SUPABASE_URL),
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    accessToken,
  );
}

export async function getGraphy() {
  const session = await getSupabaseClientSession();
  return createGraphy(session?.access_token);
}
