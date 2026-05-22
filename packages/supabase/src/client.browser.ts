import { createBrowserClient as createBrowserClientSsr } from "@supabase/ssr";
import type { Database } from "./types.ts";

export function createBrowserClient() {
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  return createBrowserClientSsr<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieDomain
      ? { cookieOptions: { domain: cookieDomain } }
      : undefined,
  );
}
