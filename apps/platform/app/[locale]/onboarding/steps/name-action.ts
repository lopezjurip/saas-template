"use server";

import { z } from "zod";
import { debug } from "~/lib/debug";
import { authedAction } from "~/lib/safe-action";

const log = debug("onboarding:name");

const schema = z.object({
  full_name: z.string().min(2, "Mínimo 2 caracteres").max(256),
});

export const saveName = authedAction.inputSchema(schema).action(async ({ parsedInput, ctx: { supabase, user } }) => {
  const { error } = await supabase
    .from("profiles")
    .update({ profile_name_full: parsedInput.full_name })
    .eq("profile_id", user.id);

  if (error) {
    log.error("profile_name_full update failed", { profile_id: user.id, error });
    throw new Error("No pudimos guardar tu nombre");
  }
});
