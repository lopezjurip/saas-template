import { type CookieOptions, createServerClient as createServerClientSsr } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types.ts";

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
