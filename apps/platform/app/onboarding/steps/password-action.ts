"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { z } from "zod";

const schema = z.object({ password: z.string().min(8) });

export async function setPassword(values: z.infer<typeof schema>) {
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: "Contraseña inválida" };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "No pudimos guardar la contraseña" };
  return { ok: true as const };
}
