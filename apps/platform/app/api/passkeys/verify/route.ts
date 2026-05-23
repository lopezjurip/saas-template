import { createServerClient } from "@packages/supabase/client.server";
import type { Database } from "@packages/supabase/types";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { type NextRequest, NextResponse } from "next/server";
import { debug } from "~/lib/debug";
import { deleteWebAuthnChallenge, getWebAuthnChallengeByProfile, saveWebAuthnCredential } from "~/lib/passkeys.server";

const log = debug("passkeys:register");

type CredentialInsert = Database["public"]["Tables"]["webauthn_credentials"]["Insert"];

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    log.warn("verify requested without a session");
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const challenge = await getWebAuthnChallengeByProfile(supabase, user.id);
  if (!challenge) {
    log.warn("verify requested but no pending challenge", { profile_id: user.id });
    return NextResponse.json({ message: "Desafío no encontrado" }, { status: 400 });
  }
  await deleteWebAuthnChallenge(supabase, challenge.webauthn_challenge_id);

  const data = await request.json();
  let verification: Awaited<ReturnType<typeof verifyRegistrationResponse>>;
  try {
    verification = await verifyRegistrationResponse({
      response: data,
      expectedChallenge: challenge.webauthn_challenge_value,
      expectedOrigin: process.env.WEBAUTHN_RELYING_PARTY_ORIGIN!,
      expectedRPID: process.env.WEBAUTHN_RELYING_PARTY_ID!,
    });
  } catch (error) {
    log.error("verifyRegistrationResponse threw", { profile_id: user.id, error });
    return NextResponse.json({ message: "Verificación fallida" }, { status: 400 });
  }

  const { registrationInfo, verified } = verification;
  if (!verified || !registrationInfo) {
    log.warn("registration verification rejected", { profile_id: user.id, verified });
    return NextResponse.json({ message: "Verificación fallida" }, { status: 400 });
  }

  const values: CredentialInsert = {
    profile_id: user.id,
    webauthn_credential_friendly_name: `Passkey creado ${new Date().toLocaleDateString("es-CL")}`,
    webauthn_credential_type: registrationInfo.credentialType,
    webauthn_credential_external_id: registrationInfo.credential.id,
    webauthn_credential_public_key: Buffer.from(registrationInfo.credential.publicKey).toString("base64"),
    webauthn_credential_aaguid: registrationInfo.aaguid,
    webauthn_credential_sign_count: registrationInfo.credential.counter,
    webauthn_credential_transports: (data.response?.transports ?? []) as string[],
    webauthn_credential_user_verification_status: registrationInfo.userVerified ? "verified" : "unverified",
    webauthn_credential_device_type:
      registrationInfo.credentialDeviceType === "singleDevice" ? "single_device" : "multi_device",
    webauthn_credential_backup_state: registrationInfo.credentialBackedUp ? "backed_up" : "not_backed_up",
  };

  let saved: Awaited<ReturnType<typeof saveWebAuthnCredential>>;
  try {
    saved = await saveWebAuthnCredential(supabase, values);
  } catch (error) {
    log.error("credential insert failed", { profile_id: user.id, error });
    return NextResponse.json({ message: "No pudimos guardar el passkey" }, { status: 500 });
  }

  log.info("passkey registered", {
    profile_id: user.id,
    webauthn_credential_id: saved?.webauthn_credential_id,
  });

  return NextResponse.json(
    {
      webauthn_credential_id: saved?.webauthn_credential_id,
      webauthn_credential_friendly_name: saved?.webauthn_credential_friendly_name,
      webauthn_credential_device_type: saved?.webauthn_credential_device_type,
      webauthn_credential_backup_state: saved?.webauthn_credential_backup_state,
      webauthn_credential_created_at: saved?.webauthn_credential_created_at,
    },
    { status: 201 },
  );
}
