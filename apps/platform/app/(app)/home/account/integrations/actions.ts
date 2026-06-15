"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { authedAction, formAction } from "~/lib/safe-action.server";

const log = debug("app:home:account:integrations:actions");

const createKeySchema = z.object({
  api_key_name: z
    .string()
    .min(1, "Ingresa un nombre")
    .max(128)
    .transform((v) => v.trim()),
});

const createKeyRun = authedAction
  .inputSchema(createKeySchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { data, error } = await supabase.rpc("viewer_api_key_create", {
      key_name: parsedInput.api_key_name,
    });
    if (error) {
      log.error("[actionCreateApiKey] rpc failed", { profile_id: user.id, error });
      throw new Error("No pudimos crear la clave");
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("No pudimos crear la clave");
    revalidatePath(`/${await getServerLocale()}/home/account/integrations`);
    return {
      api_key_id: row["api_key_id"],
      api_key_prefix: row["api_key_prefix"],
      api_key_secret: row["api_key_secret"],
    };
  });

export const actionCreateApiKey = formAction(createKeyRun, (fd) => ({
  api_key_name: String(fd.get("api_key_name") ?? ""),
}));

export const actionCreateApiKeyTyped = createKeyRun;

const revokeKeySchema = z.object({ api_key_id: z.coerce.number().int().positive() });

const revokeKeyRun = authedAction
  .inputSchema(revokeKeySchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase.rpc("viewer_api_key_revoke", {
      p_api_key_id: parsedInput.api_key_id,
    });
    if (error) {
      log.error("[actionRevokeApiKey] rpc failed", { profile_id: user.id, api_key_id: parsedInput.api_key_id, error });
      throw new Error("No pudimos revocar la clave");
    }
    revalidatePath(`/${await getServerLocale()}/home/account/integrations`);
  });

export const actionRevokeApiKey = formAction(revokeKeyRun, (fd) => ({
  api_key_id: Number(fd.get("api_key_id") ?? 0),
}));
