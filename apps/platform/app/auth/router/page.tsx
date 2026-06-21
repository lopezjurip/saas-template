import { getSupabaseServerUserRedirect } from "@packages/supabase/client.server";
import { SINGLE } from "@packages/utils/array";
import { HOST_FROM_HEADERS } from "@packages/utils/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RESOLVE_AUTH_NEXT } from "~/lib/auth-next";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { getViewerOnboardingState } from "../onboarding/state.server";

/**
 * Post-auth deciding route. Every auth entry point (OAuth callback, magic-link confirm,
 * document/phone OTP) lands here instead of jumping straight to /home. It decides where the
 * freshly-authenticated user belongs:
 *
 * - not authenticated → /auth (shouldn't normally happen here, but we never assume a session)
 * - onboarding not finished (`profile_onboarded_at` is null) → /auth/onboarding
 * - otherwise → the validated `next` target, falling back to /home
 *
 * `next` is re-validated here with RESOLVE_AUTH_NEXT even though callers already validate it —
 * this route is a public path (PUBLIC_PATH_REGEX matches /auth/*) and directly reachable, so a
 * raw `?next=https://evil.com` would be an open redirect if trusted. Validate, then redirect.
 *
 * This page only redirects; it renders no UI.
 */
export default async function AuthRouterPage(props: PageProps<"/auth/router">) {
  await getSupabaseServerUserRedirect();

  const sp = await props.searchParams;
  const origin = HOST_FROM_HEADERS(await headers()).origin;
  const rawNext = SINGLE(sp["next"]) ?? null;
  // Self-reference guard: treat "/auth/router" as "no preference" to avoid a redirect loop.
  const next = rawNext === "/auth/router" ? `${origin}/home` : RESOLVE_AUTH_NEXT(rawNext, origin);

  const state = await getViewerOnboardingState();
  if (!state.profile_onboarded_at) {
    redirect("/auth/onboarding");
  }

  // `next` is a validated same-origin URL string; UNSAFE_ROUTE + ROUTE_HREF give it the
  // `Route` type that the typed `redirect` requires (same pattern as phone-step-form).
  redirect(ROUTE_HREF(UNSAFE_ROUTE(next)));
}
