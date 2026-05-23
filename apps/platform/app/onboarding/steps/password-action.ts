"use server";

import { z } from "zod";
import { authedAction } from "~/lib/safe-action";

const schema = z.object({ password: z.string().min(8, "Mínimo 8 caracteres") });

export const setPassword = authedAction
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { error } = await supabase.auth.updateUser({ password: parsedInput.password });
    if (error) throw new Error("No pudimos guardar la contraseña");
    // Supabase may rotate the session token after a password change. Force a synchronous
    // refresh so the new cookies are written before the action response is sent — otherwise
    // the next request lands on the proxy with a stale JWT and gets bounced to /auth.
    await supabase.auth.refreshSession();
  });
