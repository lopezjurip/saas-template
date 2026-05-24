import { createServerClient } from "@packages/supabase/client.server";
import { type NextRequest, NextResponse } from "next/server";
import { debug } from "~/lib/debug";

const log = debug("auth:callback");

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? `/${locale}/dashboard`;
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    log.warn("provider returned an error", { errorDescription });
    return NextResponse.redirect(`${origin}/${locale}/auth/error?reason=${encodeURIComponent(errorDescription)}`);
  }

  if (!code) {
    log.warn("callback hit without a code param");
    return NextResponse.redirect(`${origin}/${locale}/auth/error?reason=missing_code`);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    log.error("exchangeCodeForSession failed", { error });
    return NextResponse.redirect(`${origin}/${locale}/auth/error?reason=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : `/${locale}/dashboard`}`);
}
