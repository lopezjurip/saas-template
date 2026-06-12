import { createBrowserClient as createBrowserClientSsr } from "@supabase/ssr";
import { SUPABASE_JWT_DECODE_PAYLOAD, SUPABASE_JWT_METADATA } from "./jwt";
import type { AppMetadata } from "./metadata";
import type { Database } from "./types.ts";

export { type AppMetadata, AppMetadataSchema } from "./metadata";

/**
 * Creates a Supabase browser client configured with env vars and optional cookie domain.
 *
 * @example
 * const supabase = createBrowserClient();
 * await supabase.from("posts").select("*");
 */
export function createBrowserClient() {
  const cookieDomain = process.env["NEXT_PUBLIC_COOKIE_DOMAIN"];
  return createBrowserClientSsr<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    cookieDomain ? { cookieOptions: { domain: cookieDomain } } : undefined,
  );
}

/**
 * Returns a Supabase browser client instance.
 *
 * @example
 * const supabase = getSupabaseClient();
 */
export function getSupabaseClient() {
  const supabase = createBrowserClient();
  return supabase;
}

/**
 * Returns the authenticated browser user. Throws if auth fails.
 *
 * @example
 * const user = await getSupabaseClientUser();
 * console.log(user.email);
 */
export async function getSupabaseClientUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data["user"];
}

/**
 * Returns the current browser session. Throws if auth fails.
 *
 * @example
 * const session = await getSupabaseClientSession();
 * console.log(session?.access_token);
 */
export async function getSupabaseClientSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data["session"];
}

/**
 * Returns app metadata (tenants, orgs, etc.) decoded from the browser session JWT.
 *
 * @example
 * const meta = await getSupabaseClientUserMetadata();
 * console.log(meta?.tenants);
 */
export async function getSupabaseClientUserMetadata(): Promise<AppMetadata | null> {
  const session = await getSupabaseClientSession();
  if (!session) return null;
  const payload = SUPABASE_JWT_DECODE_PAYLOAD(session["access_token"]);
  return payload ? SUPABASE_JWT_METADATA(payload) : null;
}
