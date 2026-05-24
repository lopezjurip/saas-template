import { createServiceRoleClient } from "@packages/supabase/client.service";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { debug } from "~/lib/debug";
import {
  getAuthenticationOptions,
  insertWebAuthnChallenge,
  listWebAuthnCredentialsForProfile,
} from "~/lib/passkeys.server";

const log = debug("passkeys:signin");

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.["email"]?.trim().toLowerCase();
  if (!email) {
    log.warn("sign-in challenge requested without email");
    return NextResponse.json({ message: "Email requerido" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: profile_id, error: rpcError } = await supabase.rpc("profile_id_by_email", { email_to_check: email });
  if (rpcError) {
    log.error("profile_id_by_email RPC failed", { email, error: rpcError });
    return NextResponse.json({ message: "Error al buscar usuario" }, { status: 500 });
  }
  if (!profile_id) {
    log.info("sign-in challenge for unknown email", { email });
    return NextResponse.json({ message: "Usuario sin passkey" }, { status: 404 });
  }

  const credentials = await listWebAuthnCredentialsForProfile(supabase, profile_id);
  if (credentials.length === 0) {
    log.info("sign-in challenge for user with no passkeys", { email, profile_id });
    return NextResponse.json({ message: "Usuario sin passkey" }, { status: 404 });
  }

  const options = await getAuthenticationOptions(credentials);
  const challenge = await insertWebAuthnChallenge(supabase, { value: options.challenge });

  if (!challenge?.webauthn_challenge_id) {
    log.error("anonymous challenge insert returned no row", { email, profile_id });
    return NextResponse.json({ message: "No se pudo crear el desafío" }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set("webauthn_state", challenge.webauthn_challenge_id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: 300, // 5 minutes — challenges are short-lived
  });

  log.info("sign-in challenge issued", { email, profile_id, credential_count: credentials.length });
  return NextResponse.json(options, { status: 200 });
}
