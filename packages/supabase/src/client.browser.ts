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

function decodeJwtPayload(token: string): unknown {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const padded = segment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(segment.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

// Hook-injected claims live only in the JWT — decode the access_token directly.
export async function getSupabaseUserMetadata(): Promise<AppMetadata | null> {
  const session = await getSupabaseSession();
  if (!session) return null;
  const payload = decodeJwtPayload(session.access_token) as { app_metadata?: unknown } | null;
  const result = AppMetadataSchema.safeParse(payload?.app_metadata);
  return result.success ? result.data : null;
}
