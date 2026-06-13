import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "./types.ts";

/**
 * Refreshes the Supabase session inside Next.js middleware.
 *
 * Mutates the request cookies and the returned response cookies so that the
 * downstream handler and the browser both see the refreshed session. Call
 * `await supabase.auth.getUser()` before returning so token rotation runs.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const cookieDomain = process.env["NEXT_PUBLIC_COOKIE_DOMAIN"];

  const supabase = createServerClient<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      auth: { experimental: { passkey: true } },
      cookieOptions: cookieDomain ? { domain: cookieDomain } : undefined,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, {
              ...options,
              domain: cookieDomain || undefined,
            });
          }
        },
      },
    },
  );

  // Required: refreshes the access token cookie if it's about to expire.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Stale cookie guard: JWT may be cryptographically valid (local instances share the same
  // secret) but the user row no longer exists (e.g. DB reset in a worktree). getUser() returns
  // null while the session cookie is still present. Clear it locally so the browser stops
  // sending the dead token on every request. Only applies in development — production Supabase
  // is never reset, so the extra getSession() round-trip would add unnecessary latency.
  if (!user && process.env.NODE_ENV === "development") {
    const { data: staleSession } = await supabase.auth.getSession();
    if (staleSession.session) {
      await supabase.auth.signOut({ scope: "local" });
    }
  }

  return { response, supabase, user };
}
