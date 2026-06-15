import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { RESOLVE_AUTH_NEXT } from "~/lib/auth-next";
import { debug } from "~/lib/debug";

const log = debug("auth:confirm");

const ALLOWED_TYPES: ReadonlySet<EmailOtpType> = new Set([
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email",
  "email_change",
]);

function IS_ALLOWED_TYPE(value: string | null): value is EmailOtpType {
  return !!value && ALLOWED_TYPES.has(value as EmailOtpType);
}

export async function GET(request: NextRequest, ctx: RouteContext<"/auth/confirm">) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const next = RESOLVE_AUTH_NEXT(searchParams.get("next"), origin);

  if (!token_hash || !IS_ALLOWED_TYPE(rawType)) {
    log.warn("confirm hit with missing or invalid params", { has_token: !!token_hash, type: rawType });
    return NextResponse.redirect(`${origin}/auth/error?reason=invalid_confirmation_link`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ type: rawType, token_hash });

  if (error) {
    log.error("verifyOtp failed", { type: rawType, error });
    return NextResponse.redirect(`${origin}/auth/error?reason=${encodeURIComponent(error.message)}`);
  }

  log.info("verifyOtp succeeded", { type: rawType });
  return NextResponse.redirect(next);
}
