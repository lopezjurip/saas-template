"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().min(2).max(256),
});

export async function saveName(values: z.infer<typeof schema>) {
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: "Nombre inválido" };

  const supabase = await createServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;
  if (!user) return { error: "Sesión expirada" };

  // biome-ignore lint/suspicious/noExplicitAny: TS6 + supabase-js inference loses Update type
  const { error } = await (supabase.from("profiles") as any)
    .update({ profile_name_full: parsed.data.full_name })
    .eq("profile_id", user.id);

  if (error) return { error: "No pudimos guardar tu nombre" };
  return { ok: true as const };
}
