import "server-only";

import { type CookieOptions, createServerClient as createServerClientSsr } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { SUPABASE_JWT_DECODE_PAYLOAD, SUPABASE_JWT_METADATA } from "./jwt";
import type { AppMetadata } from "./metadata";
import type { Database } from "./types.ts";

export { type AppMetadata, AppMetadataSchema } from "./metadata";

/**
 * All exports are wrapped in React's `cache()` so that within a single RSC render pass
 * a request only hits Supabase Auth once for the user, and reads cookies once for the session.
 * `cache()` is per-request: nothing leaks across requests or between users.
 */

/**
 * Creates a Supabase server client with per-request caching.
 * @returns Cached Supabase client instance with cookie management.
 */
export const createSupabaseServerClient = cache(async () => {
  const cookieStore = await cookies();
  const cookieDomain = process.env["NEXT_PUBLIC_COOKIE_DOMAIN"];
  return createServerClientSsr<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      auth: { experimental: { passkey: true } },
      cookieOptions: cookieDomain ? { domain: cookieDomain } : undefined,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, {
                ...options,
                domain: cookieDomain || undefined,
              });
            }
          } catch {
            // setAll was called from a Server Component — cookies cannot be set there.
            // The middleware refresh path will keep the session current.
          }
        },
      },
    },
  );
});

/**
 * Gets the authenticated user from Supabase Auth.
 * @returns Verified user object or null. Safe to read `.email`, `.identities`, etc.
 * @example
 * const user = await getSupabaseServerUser();
 * if (user) {
 *   console.log("User email:", user.email);
 * }
 */
export const getSupabaseServerUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

/**
 * Gets the authenticated user or redirects to auth if not found.
 * @example
 * const user = await getSupabaseServerUserRedirect();
 */
export async function getSupabaseServerUserRedirect() {
  const user = await getSupabaseServerUser();
  if (!user) {
    // Short circuit.
    redirect("/auth");
  }
  return user;
}

/**
 * Gets the authenticated user or throws a 404 if not found.
 * @returns Verified user object. Safe to read `.email`, `.identities`, etc.
 * @example
 * const user = await getSupabaseServerUserAssert();
 */
export async function getSupabaseServerUserAssert() {
  const user = await getSupabaseServerUser();
  if (!user) {
    // Short circuit.
    notFound();
  }
  return user;
}

/**
 * Gets the cookie-backed session (or null).
 * Use only when you need the raw `access_token`. For user identity, prefer `getSupabaseServerUser()`.
 * @returns Session with auth token or null. Note: `session.user` is not authenticated.
 */
export const getSupabaseServerSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

/**
 * Gets hook-injected claims from the JWT (tenants, organizations, agencies, onboarded).
 * These claims live only in the JWT; use this instead of `auth.getUser()` for them.
 * @returns Parsed app metadata or null if session unavailable.
 */
export const getSupabaseServerUserMetadata = cache(async (): Promise<AppMetadata | null> => {
  const session = await getSupabaseServerSession();
  if (!session) return null;
  const payload = SUPABASE_JWT_DECODE_PAYLOAD(session["access_token"]);
  return payload ? SUPABASE_JWT_METADATA(payload) : null;
});
