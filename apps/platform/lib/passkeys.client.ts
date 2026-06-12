"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { debug } from "~/lib/debug";
import {
  actionCreatePasskeyChallenge,
  actionCreatePasskeySignInChallenge,
  actionVerifyPasskeyRegistration,
  actionVerifyPasskeySignIn,
} from "~/lib/passkeys.actions";
import { ErrorSafeAction } from "~/lib/safe-action.client";

const log = debug("passkeys.client");

export async function createPasskey() {
  const [challenge, challengeError] = await ErrorSafeAction.unwrap(actionCreatePasskeyChallenge());
  if (challengeError) {
    log.error("[createPasskey] Failed to create passkey challenge", challengeError);
    throw challengeError;
  }
  const credential = await startRegistration({ optionsJSON: challenge });
  const [result, verifyError] = await ErrorSafeAction.unwrap(actionVerifyPasskeyRegistration(credential));
  if (verifyError) {
    log.error("[createPasskey] Failed to verify passkey registration", verifyError);
    throw verifyError;
  }
  return result;
}

export async function signInWithPasskey(email: string) {
  const [options, challengeError] = await ErrorSafeAction.unwrap(actionCreatePasskeySignInChallenge({ email }));
  if (challengeError) {
    log.error("[signInWithPasskey] Failed to create sign-in challenge", challengeError);
    throw new Error("Failed to create sign-in challenge.");
  }

  const response = await startAuthentication({ optionsJSON: options });

  /**
   * On success, the server action redirects to /[locale]/dashboard — this call never
   * resolves normally. If it does resolve, verification failed and serverError carries
   * the reason.
   */
  const [_, verifyError] = await ErrorSafeAction.unwrap(actionVerifyPasskeySignIn(response));
  if (verifyError) {
    log.error("[signInWithPasskey] Failed to verify passkey sign-in", verifyError);
    throw verifyError;
  }
}
