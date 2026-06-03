import { createServerClient } from "@packages/supabase/client.server";
import { type NextRequest, NextResponse } from "next/server";
import { RESOLVE_AUTH_NEXT } from "~/lib/auth-next";
import { debug } from "~/lib/debug";

const log = debug("auth:callback");

export async function GET(request: NextRequest, _ctx: RouteContext<"/[locale]/auth/callback">) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = RESOLVE_AUTH_NEXT(searchParams.get("next"), origin);
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    log.warn("provider returned an error", { errorDescription });
    return NextResponse.redirect(`${origin}/[locale]/auth/error?reason=${encodeURIComponent(errorDescription)}`);
  } else if (!code) {
    log.warn("callback hit without a code param");
    return NextResponse.redirect(`${origin}/[locale]/auth/error?reason=missing_code`);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    log.error("exchangeCodeForSession failed", { error });
    return NextResponse.redirect(`${origin}/[locale]/auth/error?reason=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(next);
}
