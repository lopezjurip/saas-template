"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function createPasskey() {
  const options = await postJson<Parameters<typeof startRegistration>[0]["optionsJSON"]>("/api/passkeys/challenge");
  const credential = await startRegistration({ optionsJSON: options });
  return postJson<{ webauthn_credential_id: string }>("/api/passkeys/verify", credential);
}

export async function signInWithPasskey(email: string) {
  const options = await postJson<Parameters<typeof startAuthentication>[0]["optionsJSON"]>("/auth/webauthn/passkey", {
    email,
  });
  const authResponse = await startAuthentication({ optionsJSON: options });
  const verify = await postJson<{ verified: boolean; token_hash?: string; email?: string }>(
    "/auth/webauthn/passkey/verify",
    authResponse,
  );
  if (!verify.verified || !verify.token_hash || !verify.email) {
    throw new Error("La verificación del passkey falló.");
  }

  // Hand the token_hash back to Supabase so it issues a real session (the user_auth_hook
  // fires here, populating app_metadata.tenants/organizations/onboarded/is_concierge that
  // the middleware relies on). This avoids the reference doc's custom-JWT shortcut.
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: verify.token_hash,
  });
  if (error) throw new Error(error.message);
}
