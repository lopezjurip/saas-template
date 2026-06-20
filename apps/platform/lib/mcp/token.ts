/**
 * MCP bearer token verification.
 *
 * Two-phase validation:
 * 1. Local JWKS (jose) — RS256/ES256: verifies signature, iss, exp; then strict `aud` check.
 * 2. GoTrue getUser() fallback — HS256: server-side signature validation; permissive `aud` check.
 *
 * Audience policy (RFC 8707 resource indicators):
 * - RS256 tokens MUST include the request resource URL (e.g. `https://lvh.me:7003`) in `aud`.
 *   Missing or wrong `aud` → anonymous. No legacy grace on the verified path.
 * - HS256 fallback: missing `aud` is accepted (GoTrue HS256 may omit the resource URL);
 *   explicit non-resource `aud` (e.g. `"authenticated"` from password-grant) → anonymous.
 * - Net effect: password-grant and magic-link tokens are rejected; OAuth server tokens pass.
 *
 * ponytail: HS256 fallback + permissive aud exist until GoTrue enforces RS256 + RFC 8707 aud
 * for all environments. Remove `createAnonClientForValidation` + the catch block when done.
 */

import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createClient } from "@supabase/supabase-js";
import { ARRAY_FORCED } from "@packages/utils/iterators";
import { HOST_FROM_HEADERS } from "@packages/utils/headers";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { debug } from "~/lib/debug";

const log = debug("app:api:mcp:verify-token");

const SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const SUPABASE_ANON_KEY = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

// Module-level JWKS cache — jose refreshes keys automatically on rotation
const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

function createAnonClientForValidation() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}

/**
 * Validates a bearer token for the MCP endpoint.
 * Returns AuthInfo when valid; `undefined` degrades the caller to anonymous (never throws).
 * With `required: false` on `withMcpAuth`, undefined does NOT 401 — tools opt in via `*Assert` helpers.
 *
 * @example
 * const info = await mcpTokenVerify(req, bearerToken);
 * // undefined → anonymous caller; info.extra.user_id → authenticated
 */
export async function mcpTokenVerify(req: Request, bearerToken?: string): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  const origin = HOST_FROM_HEADERS(req.headers);
  const resourceUrl = origin.origin;
  const host = origin.host;

  let user_id: string;

  try {
    // Phase 1: local JWKS verification — eliminates GoTrue round-trip per call
    const { payload } = await jwtVerify(bearerToken, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
    });

    // Strict aud check on the verified RS256 path
    if (!ARRAY_FORCED(payload.aud).some((a) => a === resourceUrl)) {
      log.warn("[mcpTokenVerify] RS256: aud mismatch %o", { aud: payload.aud, resourceUrl });
      return undefined;
    }
    if (!payload.sub) return undefined;
    user_id = payload.sub;
  } catch {
    // Phase 2: HS256 fallback — GoTrue validates the signature server-side
    // ponytail: remove when RS256 is enforced across all environments
    try {
      const { data, error } = await createAnonClientForValidation().auth.getUser(bearerToken);
      if (error || !data["user"]) {
        log.warn("[mcpTokenVerify] HS256 fallback: invalid token %o", { error: error?.message ?? "no user" });
        return undefined;
      }
      // Decode without re-verifying (getUser already validated the signature above)
      // Permissive aud: missing aud passes; explicit wrong aud (e.g. "authenticated") is rejected
      const aud = ARRAY_FORCED(decodeJwt(bearerToken).aud);
      if (aud.length > 0 && !aud.some((a) => a === resourceUrl)) {
        log.warn("[mcpTokenVerify] HS256 fallback: aud mismatch %o", { aud, resourceUrl });
        return undefined;
      }
      user_id = data["user"]["id"];
    } catch (err) {
      log.error("[mcpTokenVerify] unexpected error: %o", { err });
      return undefined;
    }
  }

  return {
    token: bearerToken,
    scopes: [],
    clientId: "mcp",
    extra: { user_id, host },
  };
}
