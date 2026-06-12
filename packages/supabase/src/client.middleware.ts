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
  await supabase.auth.getUser();

  return { response, supabase };
}
