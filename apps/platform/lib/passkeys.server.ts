import "server-only";

import type { Database } from "@packages/supabase/types";
import {
  type AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
} from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type Client = SupabaseClient<Database>;
type CredentialRow = Database["public"]["Tables"]["webauthn_credentials"]["Row"];
type CredentialInsert = Database["public"]["Tables"]["webauthn_credentials"]["Insert"];

const rpName = process.env["WEBAUTHN_RELYING_PARTY_NAME"]!;
const rpID = process.env["WEBAUTHN_RELYING_PARTY_ID"]!;

export async function listWebAuthnCredentialsForProfile(client: Client, profile_id: string) {
  const { data, error } = await client.from("webauthn_credentials").select("*").eq("profile_id", profile_id);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getWebAuthnCredentialByExternalId(
  client: Client,
  webauthn_credential_external_id: string,
): Promise<CredentialRow | null> {
  const { data } = await client
    .from("webauthn_credentials")
    .select("*")
    .eq("webauthn_credential_external_id", webauthn_credential_external_id)
    .maybeSingle();
  return data;
}

export async function updateWebAuthnCredentialByExternalId(
  client: Client,
  webauthn_credential_external_id: string,
  updates: Database["public"]["Tables"]["webauthn_credentials"]["Update"],
) {
  const { error } = await client
    .from("webauthn_credentials")
    .update(updates)
    .eq("webauthn_credential_external_id", webauthn_credential_external_id);
  if (error) throw new Error(error.message);
}

export async function insertWebAuthnChallenge(client: Client, params: { profile_id?: string; value: string }) {
  if (params.profile_id) {
    const { data, error } = await client
      .from("webauthn_challenges")
      .upsert([{ profile_id: params.profile_id, webauthn_challenge_value: params["value"] }], {
        onConflict: "profile_id",
      })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await client
    .from("webauthn_challenges")
    .insert([{ webauthn_challenge_value: params["value"] }])
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getWebAuthnChallengeByProfile(client: Client, profile_id: string) {
  const { data } = await client.from("webauthn_challenges").select("*").eq("profile_id", profile_id).maybeSingle();
  return data;
}

export async function getWebAuthnChallengeById(client: Client, webauthn_challenge_id: string) {
  const { data } = await client
    .from("webauthn_challenges")
    .select("*")
    .eq("webauthn_challenge_id", webauthn_challenge_id)
    .maybeSingle();
  return data;
}

export async function deleteWebAuthnChallenge(client: Client, webauthn_challenge_id: string) {
  await client.from("webauthn_challenges").delete().eq("webauthn_challenge_id", webauthn_challenge_id);
}

export async function getRegistrationOptions(client: Client, user: User) {
  const credentials = await listWebAuthnCredentialsForProfile(client, user.id);
  const userName = user["email"] ?? user["phone"] ?? user["id"];
  const displayName = (user["user_metadata"]?.["full_name"] as string | undefined) ?? userName;
  return generateRegistrationOptions({
    rpName,
    rpID,
    userName,
    userID: isoUint8Array.fromASCIIString(user["id"]),
    userDisplayName: displayName,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
    excludeCredentials: credentials.map((c) => ({
      id: c["webauthn_credential_external_id"],
      type: c["webauthn_credential_type"] as "public-key",
      transports: c["webauthn_credential_transports"] as AuthenticatorTransportFuture[],
    })),
  });
}

export function getAuthenticationOptions(allow: CredentialRow[]) {
  return generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: allow.map((c) => ({
      id: c["webauthn_credential_external_id"],
      type: c["webauthn_credential_type"] as "public-key",
      transports: c["webauthn_credential_transports"] as AuthenticatorTransportFuture[],
    })),
  });
}

export async function saveWebAuthnCredential(client: Client, credential: CredentialInsert) {
  const { data, error } = await client.from("webauthn_credentials").insert([credential]).select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
