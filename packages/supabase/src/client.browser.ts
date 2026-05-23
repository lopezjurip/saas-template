import { createBrowserClient as createBrowserClientSsr } from "@supabase/ssr";
import { type AppMetadata, AppMetadataSchema } from "./metadata";
import type { Database } from "./types.ts";

export { type AppMetadata, AppMetadataSchema } from "./metadata";

export function createBrowserClient() {
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  return createBrowserClientSsr<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieDomain ? { cookieOptions: { domain: cookieDomain } } : undefined,
  );
}

export function getSupabase() {
  const supabase = createBrowserClient();
  return supabase;
}

export async function getSupabaseUser() {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data["user"];
}

export async function getSupabaseSession() {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data["session"];
}

export async function getSupabaseUserMetadata(): Promise<AppMetadata | null> {
  const user = await getSupabaseUser();
  const result = AppMetadataSchema.safeParse(user.app_metadata);
  return result.success ? result.data : null;
}
