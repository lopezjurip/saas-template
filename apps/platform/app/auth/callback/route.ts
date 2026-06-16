import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { type NextRequest, NextResponse } from "next/server";
import { RESOLVE_AUTH_NEXT } from "~/lib/auth-next";
import { debug } from "~/lib/debug";
import { captureUserSignedIn } from "~/lib/posthog/events.server";

const log = debug("auth:callback");

export async function GET(request: NextRequest, ctx: RouteContext<"/auth/callback">) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = RESOLVE_AUTH_NEXT(searchParams.get("next"), origin);
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    log.warn("provider returned an error", { errorDescription });
    return NextResponse.redirect(`${origin}/auth/error?reason=${encodeURIComponent(errorDescription)}`);
  } else if (!code) {
    log.warn("callback hit without a code param");
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    error,
    data: { user },
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    log.error("exchangeCodeForSession failed", { error });
    return NextResponse.redirect(`${origin}/auth/error?reason=${encodeURIComponent(error.message)}`);
  }

  if (user) {
    const provider = user.app_metadata?.["provider"];
    if (provider) {
      void captureUserSignedIn(user.id, { provider });
    }
  }

  // Hand off to the post-auth router, which decides onboarding-vs-next. `next` is already
  // same-origin-validated; the router re-validates it before honouring it.
  const router = new URL("/auth/router", origin);
  router.searchParams.set("next", next);
  return NextResponse.redirect(router);
}
