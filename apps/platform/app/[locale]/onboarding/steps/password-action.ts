"use server";

import { z } from "zod";
import { debug } from "~/lib/debug";
import { authedAction } from "~/lib/safe-action";

const log = debug("onboarding:password");

const schema = z.object({ password: z.string().min(8, "Mínimo 8 caracteres") });

export const setPassword = authedAction.inputSchema(schema).action(async ({ parsedInput, ctx: { supabase, user } }) => {
  const { error } = await supabase.auth.updateUser({ password: parsedInput.password });
  if (error) {
    log.error("password update failed", { profile_id: user.id, error });
    throw new Error("No pudimos guardar la contraseña");
  }
  // Supabase may rotate the session token after a password change. Force a synchronous
  // refresh so the new cookies are written before the action response is sent — otherwise
  // the next request lands on the proxy with a stale JWT and gets bounced to /auth.
  const refresh = await supabase.auth.refreshSession();
  if (refresh.error) {
    log.warn("session refresh failed after password change; next request may bounce to /auth", {
      profile_id: user.id,
      error: refresh.error,
    });
  }
});
