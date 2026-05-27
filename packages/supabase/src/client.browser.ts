import { JWT_DECODE_PAYLOAD } from "@packages/utils/jwt";
import { createBrowserClient as createBrowserClientSsr } from "@supabase/ssr";
import { type AppMetadata, AppMetadataSchema } from "./metadata";
import type { Database } from "./types.ts";

export { type AppMetadata, AppMetadataSchema } from "./metadata";

export function createBrowserClient() {
  const cookieDomain = process.env["NEXT_PUBLIC_COOKIE_DOMAIN"];
  return createBrowserClientSsr<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    cookieDomain ? { cookieOptions: { domain: cookieDomain } } : undefined,
  );
}

export function getSupabaseClient() {
  const supabase = createBrowserClient();
  return supabase;
}

export async function getSupabaseClientUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data["user"];
}

export async function getSupabaseClientSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data["session"];
}

/**
 * Reads hook-injected claims (tenants, organizations, onboarded) by decoding the access token,
 * since they live only in the JWT and not on the persisted user record.
 * @example
 * const metadata = await getSupabaseClientUserMetadata();
 */
export async function getSupabaseClientUserMetadata(): Promise<AppMetadata | null> {
  const session = await getSupabaseClientSession();
  if (!session) return null;
  const payload = JWT_DECODE_PAYLOAD(session["access_token"]) as { app_metadata?: unknown } | null;
  const result = AppMetadataSchema.safeParse(payload?.["app_metadata"]);
  return result.success ? result.data : null;
}
