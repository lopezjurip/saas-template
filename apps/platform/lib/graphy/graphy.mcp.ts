import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { URL_NEW } from "@packages/utils/url";

const NEXT_PUBLIC_SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

/**
 * Returns a graphy client authenticated with the given Supabase access token.
 * The token is sent as `Authorization: Bearer <token>` so pg_graphql resolves
 * the `sub` claim and all RLS `viewer_*` helpers scope to that user.
 *
 * @example
 * const graphy = createGraphyMcp(authInfo.token);
 * const { data } = await graphy.query({ query: ViewerProfileGetDocument });
 */
export function createGraphyMcp(accessToken?: string): GraphyClientSupabase {
  return new GraphyClientSupabase(
    URL_NEW("/graphql/v1", NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken,
  );
}
