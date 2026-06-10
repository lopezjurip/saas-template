import { JWT_DECODE_PAYLOAD } from "@packages/utils/jwt";
import { type CookieOptions, createServerClient as createServerClientSsr } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { type AppMetadata, AppMetadataSchema } from "./metadata";
import type { Database } from "./types.ts";

export { type AppMetadata, AppMetadataSchema } from "./metadata";

// All exports are wrapped in React's `cache()` so that within a single RSC render pass
// a request only hits Supabase Auth once for the user, and reads cookies once for the session.
// `cache()` is per-request: nothing leaks across requests or between users.

export const createServerClient = cache(async () => {
  const cookieStore = await cookies();
  const cookieDomain = process.env["NEXT_PUBLIC_COOKIE_DOMAIN"];
  return createServerClientSsr<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      ...(cookieDomain ? { cookieOptions: { domain: cookieDomain } } : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, {
                ...options,
                ...(cookieDomain ? { domain: cookieDomain } : {}),
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

// Returns the authenticated user (validated against Supabase Auth) or null.
// Safe to read `.email`, `.identities`, etc. — unlike `session.user`, this object is verified.
export const getSupabaseServerUser = cache(async () => {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

// Returns the cookie-backed session (or null). Use this only when you need the raw
// `access_token` (e.g. to forward to a downstream API). For the user identity, prefer
// `getSupabaseServerUser()` — `session.user` is not authenticated.
export const getSupabaseServerSession = cache(async () => {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

// Hook-injected claims (tenants, organizations, agencies, onboarded) live only in the JWT —
// `auth.getUser()` hits /auth/v1/user which returns the persisted user record without them.
// Decode the access_token directly. updateSession() in the proxy already validates the JWT.
export const getSupabaseServerUserMetadata = cache(async (): Promise<AppMetadata | null> => {
  const session = await getSupabaseServerSession();
  if (!session) return null;
  const payload = JWT_DECODE_PAYLOAD(session.access_token) as { app_metadata?: unknown } | null;
  const result = AppMetadataSchema.safeParse(payload?.["app_metadata"]);
  return result.success ? result.data : null;
});
