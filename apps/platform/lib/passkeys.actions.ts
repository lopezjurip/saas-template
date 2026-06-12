"use server";
import "server-only";

import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import {
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyServiceRole } from "~/lib/graphy/graphy.service";
import { action, authedAction } from "~/lib/safe-action.server";

const log = debug("passkeys");

const WEBAUTHN_STATE_COOKIE = "webauthn_state";

function REQUIRE_ENV(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

const RP_NAME = REQUIRE_ENV("WEBAUTHN_RELYING_PARTY_NAME");
const RP_ID = REQUIRE_ENV("WEBAUTHN_RELYING_PARTY_ID");
const RP_ORIGIN = REQUIRE_ENV("WEBAUTHN_RELYING_PARTY_ORIGIN");

/**
 * simplewebauthn does the real cryptographic validation; zod just gates the shape.
 */
const registrationResponseSchema = z.custom<RegistrationResponseJSON>(
  (value) => typeof value === "object" && value !== null && typeof (value as { id?: unknown })["id"] === "string",
);

const authenticationResponseSchema = z.custom<AuthenticationResponseJSON>(
  (value) => typeof value === "object" && value !== null && typeof (value as { id?: unknown })["id"] === "string",
);

const signInChallengeSchema = z.object({
  email: z.email("Correo inválido"),
});

/**
 * Generic CRUD documents — one Collection / Insert / Update / Delete per table.
 * Action code shapes the behavior by passing different `filter` / `set` objects.
 */

const PasskeyCredentialFragment = /*#__PURE__*/ gql(`
  fragment PasskeyCredentialFragment on profile_webauthn_credentials {
    profile_id
    webauthn_credential_external_id
    webauthn_credential_type
    webauthn_credential_transports
    webauthn_credential_public_key
    webauthn_credential_sign_count
  }
`);

const PasskeyCredentialsCollectionQuery = /*#__PURE__*/ gql(`
  query PasskeyCredentialsCollectionQuery(
    $first: Int
    $filter: profile_webauthn_credentialsFilter
    $orderBy: [profile_webauthn_credentialsOrderBy!]
  ) {
    profile_webauthn_credentialsCollection(first: $first, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          ...PasskeyCredentialFragment
        }
      }
    }
  }
`);

const PasskeyCredentialsInsertMutation = /*#__PURE__*/ gql(`
  mutation PasskeyCredentialsInsertMutation($objects: [profile_webauthn_credentialsInsertInput!]!) {
    insertIntoprofile_webauthn_credentialsCollection(objects: $objects) {
      records {
        webauthn_credential_id
        webauthn_credential_friendly_name
        webauthn_credential_device_type
        webauthn_credential_backup_state
        webauthn_credential_created_at
      }
    }
  }
`);

const PasskeyCredentialsUpdateMutation = /*#__PURE__*/ gql(`
  mutation PasskeyCredentialsUpdateMutation(
    $atMost: Int! = 1
    $filter: profile_webauthn_credentialsFilter
    $set: profile_webauthn_credentialsUpdateInput!
  ) {
    updateprofile_webauthn_credentialsCollection(atMost: $atMost, filter: $filter, set: $set) {
      affectedCount
    }
  }
`);

const PasskeyChallengesCollectionQuery = /*#__PURE__*/ gql(`
  query PasskeyChallengesCollectionQuery(
    $first: Int
    $filter: profile_webauthn_challengesFilter
    $orderBy: [profile_webauthn_challengesOrderBy!]
  ) {
    profile_webauthn_challengesCollection(first: $first, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          webauthn_challenge_id
          webauthn_challenge_value
        }
      }
    }
  }
`);

const PasskeyChallengesInsertMutation = /*#__PURE__*/ gql(`
  mutation PasskeyChallengesInsertMutation($objects: [profile_webauthn_challengesInsertInput!]!) {
    insertIntoprofile_webauthn_challengesCollection(objects: $objects) {
      records {
        webauthn_challenge_id
        webauthn_challenge_value
      }
    }
  }
`);

const PasskeyChallengesDeleteMutation = /*#__PURE__*/ gql(`
  mutation PasskeyChallengesDeleteMutation(
    $atMost: Int! = 1
    $filter: profile_webauthn_challengesFilter
  ) {
    deleteFromprofile_webauthn_challengesCollection(atMost: $atMost, filter: $filter) {
      affectedCount
    }
  }
`);

const PasskeyProfileIdByEmailQuery = /*#__PURE__*/ gql(`
  query PasskeyProfileIdByEmailQuery($email_to_check: String!) {
    profile_id_by_email(email_to_check: $email_to_check)
  }
`);

export const actionCreatePasskeyChallenge = authedAction.action(
  async ({ ctx: { user } }): Promise<PublicKeyCredentialCreationOptionsJSON> => {
    const graphy = getGraphyServiceRole();

    const list = await graphy.query({
      query: PasskeyCredentialsCollectionQuery,
      variables: { filter: { profile_id: { eq: user.id } } },
    });
    if (list.error) {
      log.error("list credentials failed", { profile_id: user.id, error: list.error });
      throw new Error("No pudimos iniciar el registro");
    }
    const credentials = list.data["profile_webauthn_credentialsCollection"]?.["edges"] ?? [];

    const userName = user["email"] ?? user["phone"] ?? user["id"];
    const displayName = (user["user_metadata"]?.["full_name"] as string | undefined) ?? userName;

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName,
      userID: isoUint8Array.fromASCIIString(user.id),
      userDisplayName: displayName,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
      excludeCredentials: credentials.map((edge) => {
        const node = edge["node"];
        return {
          id: node["webauthn_credential_external_id"],
          type: node["webauthn_credential_type"] as "public-key",
          transports: (node["webauthn_credential_transports"] ?? undefined) as
            | AuthenticatorTransportFuture[]
            | undefined,
        };
      }),
    });

    /**
     * pg_graphql doesn't support ON CONFLICT upserts, so this one call drops back to the
     * service-role SDK. Registration uniqueness (one challenge per profile) is enforced by
     * a unique constraint on profile_webauthn_challenges.profile_id.
     */
    const admin = createServiceRoleClient();
    const { error: upsertError } = await admin
      .from("profile_webauthn_challenges")
      .upsert([{ profile_id: user.id, webauthn_challenge_value: options.challenge }], { onConflict: "profile_id" });
    if (upsertError) {
      log.error("challenge upsert failed", { profile_id: user.id, error: upsertError });
      throw new Error("No pudimos iniciar el registro");
    }

    log.info("registration challenge issued", { profile_id: user.id });
    return options;
  },
);

export const actionVerifyPasskeyRegistration = authedAction
  .inputSchema(registrationResponseSchema)
  .action(async ({ ctx: { user }, parsedInput: response }) => {
    const graphy = getGraphyServiceRole();

    const challengeRes = await graphy.query({
      query: PasskeyChallengesCollectionQuery,
      variables: { first: 1, filter: { profile_id: { eq: user.id } } },
    });
    if (challengeRes.error) {
      log.error("challenge fetch failed", { profile_id: user.id, error: challengeRes.error });
      throw new Error("Desafío no encontrado");
    }
    const challenge = challengeRes.data["profile_webauthn_challengesCollection"]?.["edges"]?.[0]?.["node"];
    if (!challenge) {
      log.warn("verify requested but no pending challenge", { profile_id: user.id });
      throw new Error("Desafío no encontrado");
    }

    await graphy.mutate({
      query: PasskeyChallengesDeleteMutation,
      variables: { filter: { webauthn_challenge_id: { eq: challenge["webauthn_challenge_id"] } } },
    });

    let verification: Awaited<ReturnType<typeof verifyRegistrationResponse>>;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challenge["webauthn_challenge_value"],
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
      });
    } catch (error) {
      log.error("verifyRegistrationResponse threw", { profile_id: user.id, error });
      throw new Error("Verificación fallida");
    }

    const { registrationInfo, verified } = verification;
    if (!verified || !registrationInfo) {
      log.warn("registration verification rejected", { profile_id: user.id, verified });
      throw new Error("Verificación fallida");
    }

    const insertRes = await graphy.mutate({
      query: PasskeyCredentialsInsertMutation,
      variables: {
        objects: [
          {
            profile_id: user.id,
            webauthn_credential_friendly_name: `Passkey creado ${new Date().toLocaleDateString("es-CL")}`,
            webauthn_credential_type: registrationInfo.credentialType,
            webauthn_credential_external_id: registrationInfo.credential.id,
            webauthn_credential_public_key: Buffer.from(registrationInfo.credential.publicKey).toString("base64"),
            webauthn_credential_aaguid: registrationInfo.aaguid,
            webauthn_credential_sign_count: registrationInfo.credential.counter,
            webauthn_credential_transports: (response["response"]?.["transports"] ?? []) as string[],
            webauthn_credential_user_verification_status: registrationInfo.userVerified ? "verified" : "unverified",
            webauthn_credential_device_type:
              registrationInfo.credentialDeviceType === "singleDevice" ? "single_device" : "multi_device",
            webauthn_credential_backup_state: registrationInfo.credentialBackedUp ? "backed_up" : "not_backed_up",
          },
        ],
      },
    });
    if (insertRes.error) {
      log.error("credential insert failed", { profile_id: user.id, error: insertRes.error });
      throw new Error("No pudimos guardar el passkey");
    }

    const saved = insertRes.data["insertIntoprofile_webauthn_credentialsCollection"]?.["records"]?.[0];
    log.info("passkey registered", { profile_id: user.id, webauthn_credential_id: saved?.["webauthn_credential_id"] });
    return {
      webauthn_credential_id: saved?.["webauthn_credential_id"],
      webauthn_credential_friendly_name: saved?.["webauthn_credential_friendly_name"],
      webauthn_credential_device_type: saved?.["webauthn_credential_device_type"],
      webauthn_credential_backup_state: saved?.["webauthn_credential_backup_state"],
      webauthn_credential_created_at: saved?.["webauthn_credential_created_at"],
    };
  });

export const actionCreatePasskeySignInChallenge = action
  .inputSchema(signInChallengeSchema)
  .action(async ({ parsedInput: { email: rawEmail } }): Promise<PublicKeyCredentialRequestOptionsJSON> => {
    const email = rawEmail.trim().toLowerCase();
    const graphy = getGraphyServiceRole();

    const profileRes = await graphy.query({
      query: PasskeyProfileIdByEmailQuery,
      variables: { email_to_check: email },
    });
    if (profileRes.error) {
      log.error("profile_id_by_email failed", { email, error: profileRes.error });
      throw new Error("Error al buscar usuario");
    }
    const profile_id = profileRes.data["profile_id_by_email"];
    if (!profile_id) {
      log.info("sign-in challenge for unknown email", { email });
      throw new Error("Usuario sin passkey");
    }

    const credsRes = await graphy.query({
      query: PasskeyCredentialsCollectionQuery,
      variables: { filter: { profile_id: { eq: profile_id } } },
    });
    if (credsRes.error) {
      log.error("list credentials failed", { profile_id, error: credsRes.error });
      throw new Error("Error al buscar credenciales");
    }
    const edges = credsRes.data["profile_webauthn_credentialsCollection"]?.["edges"] ?? [];
    if (edges.length === 0) {
      log.info("sign-in challenge for user with no passkeys", { email, profile_id });
      throw new Error("Usuario sin passkey");
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "preferred",
      allowCredentials: edges.map((edge) => {
        const node = edge["node"];
        return {
          id: node["webauthn_credential_external_id"],
          type: node["webauthn_credential_type"] as "public-key",
          transports: (node["webauthn_credential_transports"] ?? undefined) as
            | AuthenticatorTransportFuture[]
            | undefined,
        };
      }),
    });

    const insertRes = await graphy.mutate({
      query: PasskeyChallengesInsertMutation,
      variables: { objects: [{ webauthn_challenge_value: options.challenge }] },
    });
    if (insertRes.error) {
      log.error("anonymous challenge insert failed", { email, profile_id, error: insertRes.error });
      throw new Error("No se pudo crear el desafío");
    }
    const challenge = insertRes.data["insertIntoprofile_webauthn_challengesCollection"]?.["records"]?.[0];
    if (!challenge?.["webauthn_challenge_id"]) {
      log.error("anonymous challenge insert returned no row", { email, profile_id });
      throw new Error("No se pudo crear el desafío");
    }

    const cookieStore = await cookies();
    cookieStore.set(WEBAUTHN_STATE_COOKIE, challenge["webauthn_challenge_id"], {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
      path: "/",
      maxAge: 300, // 5 minutes — challenges are short-lived
    });

    log.info("sign-in challenge issued", { email, profile_id, credential_count: edges.length });
    return options;
  });

export const actionVerifyPasskeySignIn = action
  .inputSchema(authenticationResponseSchema)
  .action(async ({ parsedInput: response }) => {
    const graphy = getGraphyServiceRole();

    const cookieStore = await cookies();
    const webauthn_challenge_id = cookieStore.get(WEBAUTHN_STATE_COOKIE)?.value;
    cookieStore.delete(WEBAUTHN_STATE_COOKIE);
    if (!webauthn_challenge_id) {
      log.warn("verify hit without webauthn_state cookie");
      throw new Error("Desafío expirado");
    }

    const challengeRes = await graphy.query({
      query: PasskeyChallengesCollectionQuery,
      variables: { first: 1, filter: { webauthn_challenge_id: { eq: webauthn_challenge_id } } },
    });
    if (challengeRes.error) {
      log.error("challenge fetch failed", { webauthn_challenge_id, error: challengeRes.error });
      throw new Error("Desafío no encontrado");
    }
    const challenge = challengeRes.data["profile_webauthn_challengesCollection"]?.["edges"]?.[0]?.["node"];

    await graphy.mutate({
      query: PasskeyChallengesDeleteMutation,
      variables: { filter: { webauthn_challenge_id: { eq: webauthn_challenge_id } } },
    });

    if (!challenge) {
      log.warn("verify hit with cookie but no matching challenge row", { webauthn_challenge_id });
      throw new Error("Desafío no encontrado");
    }

    const credRes = await graphy.query({
      query: PasskeyCredentialsCollectionQuery,
      variables: { first: 1, filter: { webauthn_credential_external_id: { eq: response["id"] } } },
    });
    if (credRes.error) {
      log.error("credential fetch failed", { external_id: response["id"], error: credRes.error });
      throw new Error("Credencial no encontrada");
    }
    const credential = credRes.data["profile_webauthn_credentialsCollection"]?.["edges"]?.[0]?.["node"];
    if (!credential) {
      log.warn("verify hit with unknown credential id", { external_id: response["id"] });
      throw new Error("Credencial no encontrada");
    }

    let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: challenge["webauthn_challenge_value"],
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: credential["webauthn_credential_external_id"],
          publicKey: new Uint8Array(Buffer.from(credential["webauthn_credential_public_key"], "base64")),
          counter: credential["webauthn_credential_sign_count"],
          transports: (credential["webauthn_credential_transports"] ?? undefined) as
            | AuthenticatorTransportFuture[]
            | undefined,
        },
        requireUserVerification: false,
      });
    } catch (error) {
      log.error("verifyAuthenticationResponse threw", {
        profile_id: credential["profile_id"],
        external_id: credential["webauthn_credential_external_id"],
        error,
      });
      throw new Error("Verificación fallida");
    }

    if (!verification.verified) {
      log.warn("authentication verification rejected", {
        profile_id: credential["profile_id"],
        external_id: credential["webauthn_credential_external_id"],
      });
      throw new Error("Verificación fallida");
    }

    /**
     * Sign-count update is non-fatal — drift doesn't block sign-in.
     */
    const updateRes = await graphy.mutate({
      query: PasskeyCredentialsUpdateMutation,
      variables: {
        filter: { webauthn_credential_external_id: { eq: credential["webauthn_credential_external_id"] } },
        set: {
          webauthn_credential_sign_count: verification.authenticationInfo.newCounter,
          webauthn_credential_last_used_at: new Date().toISOString(),
        },
      },
    });
    if (updateRes.error) {
      log.warn("sign-count update failed; continuing", {
        profile_id: credential["profile_id"],
        external_id: credential["webauthn_credential_external_id"],
        error: updateRes.error,
      });
    }

    /**
     * Auth admin + verifyOtp stay on the SDK — pg_graphql doesn't expose Supabase auth API.
     * admin.generateLink + verifyOtp fires user_auth_hook so the JWT carries tenants/
     * organizations/onboarded — without it the proxy bounces the user to /onboarding.
     */
    const admin = createServiceRoleClient();
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(credential["profile_id"]);
    if (userError || !userData.user?.email) {
      log.error("admin.getUserById failed for verified credential", {
        profile_id: credential["profile_id"],
        error: userError,
      });
      throw new Error("Usuario inválido");
    }
    const email = userData.user.email;

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (linkError || !link.properties?.hashed_token) {
      log.error("admin.generateLink failed", { profile_id: credential["profile_id"], email, error: linkError });
      throw new Error(linkError?.message ?? "No se pudo crear la sesión");
    }

    const supabase = await createServerClient();
    const { error: otpError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: link.properties.hashed_token,
    });
    if (otpError) {
      log.error("verifyOtp failed", { profile_id: credential["profile_id"], email, error: otpError });
      throw new Error("No se pudo crear la sesión");
    }

    log.info("passkey sign-in succeeded", {
      profile_id: credential["profile_id"],
      email,
      external_id: credential["webauthn_credential_external_id"],
    });

    redirect("/[locale]/home");
  });
