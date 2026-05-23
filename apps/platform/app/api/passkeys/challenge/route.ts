import { createServerClient } from "@packages/supabase/client.server";
import { NextResponse } from "next/server";
import { debug } from "~/lib/debug";
import { getRegistrationOptions, insertWebAuthnChallenge } from "~/lib/passkeys.server";

const log = debug("passkeys:register");

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    log.warn("challenge requested without a session");
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    const options = await getRegistrationOptions(supabase, user);
    await insertWebAuthnChallenge(supabase, { profile_id: user.id, value: options.challenge });
    log.info("registration challenge issued", { profile_id: user.id });
    return NextResponse.json(options, { status: 200 });
  } catch (error) {
    log.error("registration challenge failed", { profile_id: user.id, error });
    return NextResponse.json({ message: "No pudimos iniciar el registro" }, { status: 500 });
  }
}
