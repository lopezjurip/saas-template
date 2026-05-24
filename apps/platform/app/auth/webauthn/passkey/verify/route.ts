import { createServiceRoleClient } from "@packages/supabase/client.service";
import { type AuthenticatorTransportFuture, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { debug } from "~/lib/debug";
import {
  deleteWebAuthnChallenge,
  getWebAuthnChallengeById,
  getWebAuthnCredentialByExternalId,
  updateWebAuthnCredentialByExternalId,
} from "~/lib/passkeys.server";

const log = debug("passkeys:signin");

export async function POST(request: NextRequest) {
  const supabase = createServiceRoleClient();

  const cookieStore = await cookies();
  const webauthn_challenge_id = cookieStore.get("webauthn_state")?.value;
  cookieStore.delete("webauthn_state");
  if (!webauthn_challenge_id) {
    log.warn("verify hit without webauthn_state cookie");
    return NextResponse.json({ message: "Desafío expirado" }, { status: 400 });
  }

  const challenge = await getWebAuthnChallengeById(supabase, webauthn_challenge_id);
  await deleteWebAuthnChallenge(supabase, webauthn_challenge_id);
  if (!challenge) {
    log.warn("verify hit with cookie but no matching challenge row", { webauthn_challenge_id });
    return NextResponse.json({ message: "Desafío no encontrado" }, { status: 400 });
  }

  const data = await request.json();
  const credential = await getWebAuthnCredentialByExternalId(supabase, data["id"]);
  if (!credential) {
    log.warn("verify hit with unknown credential id", { external_id: data["id"] });
    return NextResponse.json({ message: "Credencial no encontrada" }, { status: 404 });
  }

  let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>;
  try {
    verification = await verifyAuthenticationResponse({
      response: data,
      expectedChallenge: challenge.webauthn_challenge_value,
      expectedOrigin: process.env["WEBAUTHN_RELYING_PARTY_ORIGIN"]!,
      expectedRPID: process.env["WEBAUTHN_RELYING_PARTY_ID"]!,
      credential: {
        id: credential.webauthn_credential_external_id,
        publicKey: new Uint8Array(Buffer.from(credential.webauthn_credential_public_key, "base64")),
        counter: credential.webauthn_credential_sign_count,
        transports: credential.webauthn_credential_transports as AuthenticatorTransportFuture[],
      },
      requireUserVerification: false,
    });
  } catch (error) {
    log.error("verifyAuthenticationResponse threw", {
      profile_id: credential.profile_id,
      external_id: credential.webauthn_credential_external_id,
      error,
    });
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  if (!verification.verified) {
    log.warn("authentication verification rejected", {
      profile_id: credential.profile_id,
      external_id: credential.webauthn_credential_external_id,
    });
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  try {
    await updateWebAuthnCredentialByExternalId(supabase, credential.webauthn_credential_external_id, {
      webauthn_credential_sign_count: verification.authenticationInfo.newCounter,
      webauthn_credential_last_used_at: new Date().toISOString(),
    });
  } catch (error) {
    // Non-fatal — sign-count drift doesn't block this sign-in.
    log.warn("sign-count update failed; continuing", {
      profile_id: credential.profile_id,
      external_id: credential.webauthn_credential_external_id,
      error,
    });
  }

  // Trade the verified passkey for a real Supabase session. Using admin.generateLink +
  // client-side verifyOtp means the user_auth_hook fires and the JWT carries tenants/
  // organizations/onboarded — without it the proxy bounces the user to /onboarding.
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(credential.profile_id);
  if (userError || !userData.user?.email) {
    log.error("admin.getUserById failed for verified credential", {
      profile_id: credential.profile_id,
      error: userError,
    });
    return NextResponse.json({ message: "Usuario inválido" }, { status: 500 });
  }
  const email = userData.user.email;

  const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !link.properties?.hashed_token) {
    log.error("admin.generateLink failed", { profile_id: credential.profile_id, email, error: linkError });
    return NextResponse.json({ message: linkError?.message ?? "No se pudo crear la sesión" }, { status: 500 });
  }

  log.info("passkey sign-in succeeded", {
    profile_id: credential.profile_id,
    email,
    external_id: credential.webauthn_credential_external_id,
  });
  return NextResponse.json({ verified: true, token_hash: link.properties.hashed_token, email }, { status: 200 });
}
