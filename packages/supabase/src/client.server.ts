import { type CookieOptions, createServerClient as createServerClientSsr } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type AppMetadata, AppMetadataSchema } from "./metadata";
import type { Database } from "./types.ts";

export { type AppMetadata, AppMetadataSchema } from "./metadata";

function decodeJwtPayload(token: string): unknown {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(segment.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

// Hook-injected claims (tenants, organizations, onboarded, is_concierge) live only in the JWT —
// auth.getUser() hits /auth/v1/user which returns the persisted user record without them.
// Decode the access_token directly. updateSession() in the proxy already validates the JWT.
export async function getSupabaseUserMetadata(): Promise<AppMetadata | null> {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  const payload = decodeJwtPayload(session.access_token) as { app_metadata?: unknown } | null;
  const result = AppMetadataSchema.safeParse(payload?.app_metadata);
  return result.success ? result.data : null;
}

export async function createServerClient() {
  const cookieStore = await cookies();
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  return createServerClientSsr<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
}
