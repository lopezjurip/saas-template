"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import {
  actionCreatePasskeyChallenge,
  actionCreatePasskeySignInChallenge,
  actionVerifyPasskeyRegistration,
  actionVerifyPasskeySignIn,
} from "~/lib/passkeys.actions";

type SafeActionResult<T> =
  | {
      data?: T;
      serverError?: string;
      validationErrors?: unknown;
    }
  | undefined;

function UNWRAP<T>(res: SafeActionResult<T>, fallback: string): T {
  if (!res) throw new Error(fallback);
  if (res.serverError) throw new Error(res.serverError);
  if (res.validationErrors) throw new Error(fallback);
  if (res.data === undefined) throw new Error(fallback);
  return res.data;
}

export async function createPasskey() {
  const options = UNWRAP(await actionCreatePasskeyChallenge(), "No pudimos iniciar el registro");
  const credential = await startRegistration({ optionsJSON: options });
  return UNWRAP(await actionVerifyPasskeyRegistration(credential), "Verificación fallida");
}

export async function signInWithPasskey(email: string) {
  const options = UNWRAP(await actionCreatePasskeySignInChallenge({ email }), "No pudimos iniciar el ingreso");
  const authResponse = await startAuthentication({ optionsJSON: options });
  // On success, the server action redirects to /[locale]/dashboard — this call never resolves
  // normally. If it does resolve, verification failed and serverError carries the reason.
  const result = await actionVerifyPasskeySignIn(authResponse);
  if (result?.serverError) throw new Error(result.serverError);
  if (result?.validationErrors) throw new Error("La verificación del passkey falló.");
}
