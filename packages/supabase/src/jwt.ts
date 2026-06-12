import { JWT_DECODE_PAYLOAD } from "@packages/utils/jwt";
import type { AppMetadata } from "./metadata";
import { AppMetadataSchema } from "./metadata";

/**
 * Claims present in a Supabase access token (JWT).
 *
 * @see https://github.com/supabase/auth/blob/master/internal/tokens/service.go
 */
export interface SupabaseJwtPayload {
  /** User ID (UUID). */
  sub: string;
  /** Issuer URL. */
  iss: string;
  /** Audience (project ref). */
  aud: string;
  /** Issued-at timestamp (seconds). */
  iat: number;
  /** Expiration timestamp (seconds). */
  exp: number;
  /** Not-before timestamp (seconds). */
  nbf?: number;
  /** JWT ID. */
  jti?: string;
  /** Postgres role used for RLS enforcement. */
  role: string;
  /** Authenticator assurance level. */
  aal: "aal1" | "aal2";
  /** Current session UUID. */
  session_id: string;
  email?: string;
  email_verified?: boolean;
  phone?: string;
  phone_verified?: boolean;
  /** Authentication time (seconds). */
  auth_time?: number;
  app_metadata?: AppMetadata;
  user_metadata?: Record<string, unknown>;
  is_anonymous?: boolean;
  /** Authentication methods reference. */
  amr?: Array<{ method: string; timestamp: number }>;
  /** MFA factor ID when verified at aal2. */
  factor_id?: string;
  /** OAuth client ID. */
  client_id?: string;
  /** OAuth scopes. */
  scope?: string;
}

/**
 * Decodes the payload of a Supabase access token without verifying its signature.
 * Returns `null` for malformed input.
 *
 * Use only after Supabase has already validated the token upstream (e.g. via `updateSession`).
 *
 * @see https://github.com/supabase/auth/blob/master/internal/tokens/service.go
 */
export function SUPABASE_JWT_DECODE_PAYLOAD(token: string): SupabaseJwtPayload | null {
  return JWT_DECODE_PAYLOAD(token) as SupabaseJwtPayload | null;
}

/**
 * Parses `app_metadata` from a decoded Supabase JWT payload.
 * Returns the validated `AppMetadata` or `null` if absent or invalid.
 */
export function SUPABASE_JWT_METADATA(payload: SupabaseJwtPayload): AppMetadata | null {
  const result = AppMetadataSchema.safeParse(payload["app_metadata"]);
  return result.success ? result.data : null;
}
