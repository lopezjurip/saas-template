import "server-only";

import { getPostHogClient } from "./posthog.server";

/**
 * Captures a PostHog event from a Server Action. Never throws — PostHog failures must not
 * interrupt critical flows. Errors are swallowed here so callers don't need .catch().
 * @example captureEvent("user_signed_in", userId, { provider: "email" })
 */
async function captureEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>,
  groups?: Record<string, string>,
): Promise<void> {
  try {
    const ph = getPostHogClient();
    ph.capture({ distinctId, event, properties, groups });
    await ph.flush();
  } catch {
    // Analytics failures are non-fatal.
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * @example captureUserSignedIn(profile_id, { provider: "email" })
 */
export async function captureUserSignedIn(profile_id: string, properties: { provider?: string }): Promise<void> {
  await captureEvent("user_signed_in", profile_id, properties);
}

/**
 * Fires on first successful auth after onboarding completion.
 * @example captureUserSignedUp(profile_id, { provider: "google" })
 */
export async function captureUserSignedUp(profile_id: string, properties: { provider?: string }): Promise<void> {
  await captureEvent("user_signed_up", profile_id, properties);
}

/**
 * @example captureUserSignedOut(profile_id)
 */
export async function captureUserSignedOut(profile_id: string): Promise<void> {
  await captureEvent("user_signed_out", profile_id);
}

/**
 * @example capturePasskeyCreated(profile_id)
 */
export async function capturePasskeyCreated(profile_id: string): Promise<void> {
  await captureEvent("passkey_created", profile_id);
}

/**
 * @example capturePasskeyDeleted(profile_id)
 */
export async function capturePasskeyDeleted(profile_id: string): Promise<void> {
  await captureEvent("passkey_deleted", profile_id);
}

// ─── Tenant / Org ─────────────────────────────────────────────────────────────

/**
 * @example captureTenantCreated(profile_id, { tenant_id: 1, tenant_slug: "acme", organization_id: 1 })
 */
export async function captureTenantCreated(
  profile_id: string,
  properties: { tenant_id: number; tenant_slug: string; organization_id: number },
): Promise<void> {
  await captureEvent("tenant_created", profile_id, properties, {
    tenant: String(properties.tenant_id),
    organization: String(properties.organization_id),
  });
}

/**
 * @example captureMemberInvited(profile_id, { organization_id: 1, tenant_id: 1, channel: "email" })
 */
export async function captureMemberInvited(
  profile_id: string,
  properties: { organization_id: number; tenant_id: number; channel: "email" | "phone" | "document" },
): Promise<void> {
  await captureEvent("member_invited", profile_id, properties, {
    tenant: String(properties.tenant_id),
    organization: String(properties.organization_id),
  });
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

/**
 * @example captureOnboardingCompleted(profile_id)
 */
export async function captureOnboardingCompleted(profile_id: string): Promise<void> {
  await captureEvent("onboarding_completed", profile_id);
}
